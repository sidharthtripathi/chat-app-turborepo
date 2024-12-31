import { createClient } from "redis";
import { prisma } from "./lib/prisma";
const db = createClient({
  url: process.env.REDISDB_URL,
});
type ChatMessage = {
  id: string;
  createdAt: string;
  content: string;
  from: string;
  to: string;
};

async function job() {
  const res = await db.ft.search(
    "idx:messages",
    `@createdAt : [0 ${Date.now()}]`
  );
  if (res.total == 0) return;
  const msgs = res.documents;
  const msgIds: string[] = [];
  for (let i = 0; i < msgs.length; i++) {
    const msg = msgs[i];
    msgIds.push(msgs[i].id);
    const chatMessage: ChatMessage = {
      id: msg.id,
      content: msg.value.content as string,
      from: msg.value.from as string,
      to: msg.value.to as string,
      createdAt: msg.value.createdAt as string,
    };
    // check if such conversation exists or not
    const conversation = await prisma.privateConversation.findFirst({
      where: {
        AND: [
          {
            members: {
              some: {
                userId: chatMessage.from,
              },
            },
          },
          {
            members: {
              some: {
                userId: chatMessage.to,
              },
            },
          },
        ],
      },
      select: { id: true },
    });
    let convoId: string;
    if (!conversation) {
      const convo = await prisma.privateConversation.create({
        data: {
          members: {
            connect: [{ userId: chatMessage.from }, { userId: chatMessage.to }],
          },
        },
        select: { id: true },
      });
      convoId = convo.id;
    } else {
      convoId = conversation.id;
    }

    // now create the msg for this conversation
    await prisma.privateMessage.create({
      data: {
        privateConversationId: convoId,
        content: chatMessage.content,
        to: chatMessage.to,
        from: chatMessage.from,
        createdAt: new Date(parseInt(chatMessage.createdAt)),
      },
    });
  }
  await db.del(msgIds);
}

async function main() {
  await db.connect();
  setInterval(job, 600000);
}

main();
