import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { selectedProfileAtom } from "@/state/profileAtom"
import { useSetRecoilState } from "recoil"
export function ChatItem({userId} : {userId : string }){
  const setSelectedUser = useSetRecoilState(selectedProfileAtom)
    return (
        <div onClick={()=>{
          setSelectedUser(userId)
        }}  
        className="flex items-center space-x-4 cursor-pointer hover:bg-secondary rounded-lg p-2 transition-colors">
        <Avatar>
          <AvatarFallback>{userId.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="flex justify-between items-baseline">
            <h2 className="font-semibold">{userId}</h2>
            <span className="text-sm text-gray-500">5m ago</span>
          </div>
        </div>
      </div>
    )
}