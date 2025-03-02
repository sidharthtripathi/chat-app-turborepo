import { Join } from "./pages/JoinPage";
import ChatAppPage from "./pages/ChatAppPage";
import { useQuery } from "react-query";
import { server } from "./lib/axios";
import { WebsocketWrapper } from "./components/WebsocketWrapper";
import {  useRecoilState } from "recoil";
import { loggedInUserAtom } from "./state/profileAtom";
import Loader from "./components/Loader";

export default function App() {
  const [loggedInUser,setLoggedInUser] = useRecoilState(loggedInUserAtom);
  const { isLoading } = useQuery({
    queryKey: ["valid-token"],
    queryFn: async () => {
      try {
        const { data } = await server.get<{ userId: string,token : string }>(
          "/api/valid-token"
        );
        setLoggedInUser({token : data.token,userId : data.userId});
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  if (isLoading) return <Loader/>;
  if (!loggedInUser) return <Join />;
  else
    return (
      <WebsocketWrapper token={loggedInUser.token}>
        <ChatAppPage />
      </WebsocketWrapper>
    );
}
