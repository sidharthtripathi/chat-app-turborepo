import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRecoilValue } from "recoil"
import { conversationFamily } from "@/state/conversationsAtom"
export function ConversationItem({id} : {id : string }){
  const conversation = useRecoilValue(conversationFamily(id))
    return (
        <Link to={conversation.id} key={conversation.id}  className="flex items-center space-x-4 cursor-pointer hover:bg-secondary rounded-lg p-2 transition-colors">
        <Avatar>
          <AvatarImage src={conversation.avatar} alt={conversation.username} />
          <AvatarFallback>{conversation.username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="flex justify-between items-baseline">
            <h2 className="font-semibold">{conversation.username}</h2>
            <span className="text-sm text-gray-500">5m ago</span>
          </div>
          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
        </div>
      </Link>
    )
}