import { Chats } from "@/components/Chats";
import ConversationList from "@/components/ConversationsList";
import { useQuery } from "react-query";
import { server } from "@/lib/axios";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { usersAtom, selectedUserAtom } from "@/state/profileAtom";

export default function ChatAppPage(){
    const selectedUser = useRecoilValue(selectedUserAtom)
    const setUsers = useSetRecoilState(usersAtom)
    const {isLoading} = useQuery(['chats'],async()=>{
        console.log("fetching chats")
        const {data} = await server.get<string[]>('/api/chats')
        setUsers(data)
        return data
      },{
        refetchOnWindowFocus : false,
        refetchOnMount : false,
      })
    if(isLoading) return <div>Loading chats...</div>
    else{
        if(selectedUser) return  <Chats userId={selectedUser}/>
        else return <ConversationList/>
    }
}