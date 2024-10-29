import { Chats } from "@/components/Chats";
import ConversationList from "@/components/ConversationsList";
import { useRecoilValue } from "recoil";
import { selectedUserAtom } from "@/state/profileAtom";
export default function ChatAppPage() {
  const selectedUser = useRecoilValue(selectedUserAtom);
  if (selectedUser) return <Chats userId={selectedUser} />;
  else return (
  <ConversationList />
  )
}
