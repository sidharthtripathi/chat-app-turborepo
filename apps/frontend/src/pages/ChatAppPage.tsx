import { profileAtom } from "@/state/profileAtom";
import { useRecoilValue } from "recoil";
import LoginFirst from "./LoginFirst";
import {selectedProfileAtom} from '../state/profileAtom'
import { Chats } from "@/components/Chats";
import ConversationList from "@/components/ConversationsList";


export default function ChatAppPage(){
    const profile = useRecoilValue(profileAtom);
    const selectedUser = useRecoilValue(selectedProfileAtom)
    if(!profile) return <LoginFirst/>
    else{
        if(!selectedUser) return <ConversationList/>
        else return <Chats userId={selectedUser}/>
    }
}