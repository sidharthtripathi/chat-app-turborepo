
import { Link } from "react-router-dom";
export default function LoginFirst(){
    return (
        <div className="flex flex-col gap-4 h-screen justify-center items-center">
            <h1 className="text-xl font-extrabold">Unauthenticated</h1>
            <Link to={"/"} className="bg-secondary p-4 rounded-md font-bold">Login</Link>
        </div>
    )
}