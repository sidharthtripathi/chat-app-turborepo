import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { profileAtom, profilesAtom } from "@/state/profileAtom";
import { ChatItem } from "./ui/chatItem";
import { SearchBar } from "./SearchBar";
import { useRecoilState, useRecoilValue } from "recoil";
import { server } from "@/lib/axios";

export default function ConversationList() {
  const userIds = useRecoilValue(profilesAtom);
  const [profile,setProfile] = useRecoilState(profileAtom)
  return (
    <div className="flex flex-col h-screen container mx-auto">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Chats</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">Hello <span className="text-primary underline text-bold text-lg">{profile}</span></p>
          <Button variant="outline"
          onClick={async()=>{
            await server.post('/api/logout')
            setProfile(null)
          }}
          >Logout</Button>
        </div>
      </header>
      <div className="p-4">
        <SearchBar />
      </div>

      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-4">
          {userIds.map((userId) => (
            <ChatItem userId={userId} key={userId} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
