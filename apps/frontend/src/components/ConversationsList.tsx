import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { ChatItem } from "./ui/chatItem";
import { SearchBar } from "./SearchBar";
import { useRecoilValue } from "recoil";
import { usersAtom, loggedInUserAtom } from "@/state/profileAtom";

export default function ConversationList() {
  const userLoggedIn = useRecoilValue(loggedInUserAtom)
  const users = useRecoilValue(usersAtom)
  return (
    <div className="flex flex-col h-screen container mx-auto">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Chats</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">Hello <span className="text-primary underline text-bold text-lg">{userLoggedIn}</span></p>
          <Button variant="outline"
          
          >Logout</Button>
        </div>
      </header>
      <div className="p-4">
        <SearchBar />
      </div>

      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-4">
          {
            users.map((user)=>(
              <ChatItem userId={user} key={user} />
            ))
          }
        </div>
      </ScrollArea>
    </div>
  );
}
