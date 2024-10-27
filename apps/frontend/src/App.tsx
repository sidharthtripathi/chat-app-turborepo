import { Join } from "./pages/JoinPage";
import ChatAppPage from "./pages/ChatAppPage";
import { useQuery } from "react-query";
import { server } from "./lib/axios";
import { WebsocketWrapper } from "./components/WebsocketWrapper";
import { useRecoilState } from "recoil";
import { loggedInUserAtom } from "./state/profileAtom";

export default function App() {
  const [loggedInUser,setLoggedInUser] = useRecoilState(loggedInUserAtom)
  const {isLoading} = useQuery({
    queryKey : ['valid-token'],
    queryFn : async()=>{
      try {
        const {data} = await server.get<{userId : string}>('/api/valid-token')
        setLoggedInUser(data.userId)
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    },
    refetchOnMount : false,
    refetchOnWindowFocus : false
  })
  if(isLoading) return <div>Loading....</div>
  if (!loggedInUser) return <Join />;
  else
    return (
      <WebsocketWrapper>
        <ChatAppPage/>
      </WebsocketWrapper>
    );
}

