import { conversationsAtom } from "@/state/conversationsAtom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useRecoilState } from "recoil"
import { ConversationItem } from "@/components/ui/chatItem"
import { useQuery } from "react-query";
import { server } from "@/lib/axios";
export default function ConversationList(){
    const [conversations,setConversations] = useRecoilState(conversationsAtom)
    const {isLoading} = useQuery("conversationsList",async()=>{
        const {data} = await server.get('/api/chats')
        setConversations(data)
        return data
    })
    if(isLoading) return <div>Loading...</div>
    return (  
        <div className="flex flex-col h-screen container mx-auto">
          <header className="flex items-center justify-between p-4 border-b">
            <h1 className="text-2xl font-bold">Chats</h1>
            <Button variant="outline">New Chat</Button>
          </header>
          <div className="p-4">
            <Input type="search" placeholder="Search chats..." className="w-full" />
          </div>
          <ScrollArea className="flex-grow">
            <div className="p-4 space-y-4">
              {conversations.map((conversation) => (
                <ConversationItem id={conversation.id}/>
              ))}
            </div>
          </ScrollArea>
        </div>
      )
}