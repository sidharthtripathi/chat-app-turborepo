import { server } from "@/lib/axios"
import { Input } from "./ui/input"
import { useRef, useState } from "react"
import { useSetRecoilState } from "recoil"
import { selectedUserAtom } from "@/state/profileAtom"

export function SearchBar(){
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [users,setUsers] = useState<{userId : string}[]>([])
    const setSelectedUser = useSetRecoilState(selectedUserAtom)
    return (
        <div>
             <Input ref={inputRef} type="search" placeholder="Search chats..." className="w-full"
            onKeyDown={async(e)=>{
              if(e.key==='Enter'){
                const {data} = await server.get(`/api/users?q=${inputRef.current?.value}`)
                setUsers(data)
              }
               
            }}
            />
            <div className="mt-2">
                {
                    users.map(user=>(
                    <div
                    className="hover:cursor-pointer p-2 bg-secondary rounded-md"
                    onClick={()=>{
                       setSelectedUser(user.userId)
                    }} 
                    key={user.userId}>{user.userId}</div>))
                }
            </div>
        </div>
    )
}
