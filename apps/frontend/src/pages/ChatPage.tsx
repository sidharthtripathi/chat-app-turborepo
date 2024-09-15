

import { useRecoilValue } from "recoil"
import { profileAtom } from "@/state/profileAtom"
import LoginFirst from "./LoginFirst"
import { useParams } from "react-router-dom"
import { Chats } from "@/components/Chats"




export default function ChatPage() {
    const {conversationId} = useParams()
    const profileState = useRecoilValue(profileAtom)
    if(!profileState){ return <LoginFirst/>}
    return <Chats conversationId={conversationId!} />
}

