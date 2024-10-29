import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { ChatItem } from "./ui/chatItem";
import { SearchBar } from "./SearchBar";
import { useRecoilState, useRecoilValue } from "recoil";
import { usersAtom, loggedInUserAtom } from "@/state/profileAtom";
import { useQuery } from "react-query";
import { server } from "@/lib/axios";

export default function ConversationList() {
  const userLoggedIn = useRecoilValue(loggedInUserAtom);
  const [users, setUsers] = useRecoilState(usersAtom);
  const { isLoading } = useQuery(
    ["chats"],
    async () => {
      const { data } = await server.get<string[]>("/api/chats");
      setUsers(data);
      return data;
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );
  return (
    <div className="flex flex-col h-screen container mx-auto">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Chats</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Hello
            <span className="text-primary underline text-bold text-lg">
              {userLoggedIn}
            </span>
          </p>
          <Button variant="outline">Logout</Button>
        </div>
      </header>
      <div className="p-4">
        <SearchBar />
      </div>

      {isLoading ? (
        <div>Loading chats...</div>
      ) : (
        <ScrollArea className="flex-grow">
          <div className="p-4 space-y-4">
            {users.map((user) => (
              <ChatItem userId={user} key={user} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
    
  );
}
