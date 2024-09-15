

import { useRecoilValue } from "recoil"
import { profileAtom } from "@/state/profileAtom"

import LoginFirst from "./LoginFirst"
import ConversationList from "@/components/ConversationsList"




export default function ChatsListPage() {
    const profileState = useRecoilValue(profileAtom)
    if(!profileState){ return <LoginFirst/>}
    return <ConversationList/>
}

