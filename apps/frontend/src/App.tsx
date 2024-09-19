
import { useRecoilValue } from "recoil"
import { profileAtom } from "./state/profileAtom"
import { Join } from "./pages/JoinPage"
import ChatAppPage from "./pages/ChatAppPage"




function App() {
const profile = useRecoilValue(profileAtom)
  if(!profile) return <Join/>
  else return <ChatAppPage/>
}

export default App
