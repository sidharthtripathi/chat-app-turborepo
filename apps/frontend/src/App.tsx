import { Join } from "./pages/JoinPage";
import ChatAppPage from "./pages/ChatAppPage";
import { useRecoilValue } from "recoil";
import { profileAtom } from "./state/profileAtom";
import { WebSocketProvider } from "./context/wsContext";

function App() {
  const profile = useRecoilValue(profileAtom);
  if (!profile) return <Join />;
  else
    return (
      <WebSocketProvider>
        <ChatAppPage />
      </WebSocketProvider>
    );
}

export default App;
