import { Join } from "./pages/JoinPage";
import ChatAppPage from "./pages/ChatAppPage";
import { useQuery } from "react-query";
import { server } from "./lib/axios";
import { WebsocketWrapper } from "./components/WebsocketWrapper";

export default function App() {
  const {isLoading,data} = useQuery({
    queryKey : ['valid-token'],
    queryFn : async()=>{
      try {
        await server.get('/api/valid-token')
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
  if (!data) return <Join />;
  else
    return (
      <WebsocketWrapper>
        <ChatAppPage/>
      </WebsocketWrapper>
    );
}

