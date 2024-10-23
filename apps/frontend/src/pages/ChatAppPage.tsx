
import { useRecoilValue } from "recoil";

import {profileAtom, selectedProfileAtom} from '../state/profileAtom'
import { Chats } from "@/components/Chats";
import ConversationList from "@/components/ConversationsList";
import { useQuery } from "react-query";
import { server } from "@/lib/axios";
import { parser } from "@/lib/chatParser";


export default function ChatAppPage(){
    const selectedUser = useRecoilValue(selectedProfileAtom)
    const profile = useRecoilValue(profileAtom)
    const {isLoading} = useQuery(['chats'],async()=>{
        console.log("fetching chats")
        const {data} = await server.get('/api/chats')
        parser(data,profile as string)
        return data
      },{
        refetchOnWindowFocus : false,
        refetchOnMount : false,
      })
    if(isLoading) return <div>Loading...</div>
    else{
        if(selectedUser) return  <Chats userId={selectedUser}/>
        else return <ConversationList/>
    }
}