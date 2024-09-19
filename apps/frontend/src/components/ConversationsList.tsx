
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { profileAtom, profilesAtom } from "@/state/profileAtom";
import { ChatItem } from "./ui/chatItem";
import { SearchBar } from "./SearchBar";
import { useRecoilValue } from "recoil";
import { server } from "@/lib/axios";
import { useQuery } from "react-query";
import { parser } from "@/lib/chatParser";
export default function ConversationList(){
  // get all the chats from server and setup the conversations
  const profile = useRecoilValue(profileAtom)
  const userIds = useRecoilValue(profilesAtom)
  const {isLoading} = useQuery("chats",async()=>{

    const {data} = await server.get('/api/chats')
    parser(data,profile as string)
    return data
  },{})
  
   return (   
        <div className="flex flex-col h-screen container mx-auto">
          <header className="flex items-center justify-between p-4 border-b">
            <h1 className="text-2xl font-bold">Chats</h1>
            <Button variant="outline">New Chat</Button>
          </header>
          <div className="p-4">
            <SearchBar/>
          </div>
          {
            isLoading? <div> Loading... </div> : (
            <ScrollArea className="flex-grow">
              <div className="p-4 space-y-4">
                {
                  userIds.map(userId=>(
                    <ChatItem  userId={userId} key={userId}/>
                  ))
                }
              </div>
            </ScrollArea>
            )
          }
          
        </div>
      )
}