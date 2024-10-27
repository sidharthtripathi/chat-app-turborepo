import { Avatar,AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import TextareaAutosize from 'react-textarea-autosize';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { messagesFamily } from '@/state/messagesAtom';
import { selectedUserAtom } from '@/state/profileAtom';
import { useForm } from 'react-hook-form';
import { useSocket } from '@/hooks/useSocket';
import {sentMessageSchema} from 'schema'
import { z } from 'zod';
import {v4 as uuid} from 'uuid'
type SentMessage = z.infer<typeof sentMessageSchema>
export function Chats({userId} : {userId : string}){
    const [messages,setMessages] = useRecoilState(messagesFamily(userId))
    const setSelectedUser = useSetRecoilState(selectedUserAtom)
    const socket = useSocket()
    const {register,handleSubmit,formState : {errors},reset} = useForm<{message : string}>()
    function onSubmit(data : {message : string}){
        console.log(data)
        const payload : SentMessage = {
            id : uuid(),
            content : data.message,
            to : userId,
            createdAt : new Date(),
        }
        setMessages(p=>([...p,{...payload,from:userId}]))
        socket.send(JSON.stringify(payload))
        reset()
    }
    return (
        <div className='p-2 flex flex-col justify-between h-screen '>
            <nav className='flex items-center gap-4'>
                    <ArrowLeftIcon className='size-6 cursor-pointer'
                    onClick={()=>{
                        setSelectedUser(null)
                    }}/>
                <Avatar>
                    <AvatarFallback>{userId.slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <p className='font-bold text-lg'>{userId}</p>
                    <span className='text-xs text-secondary-foreground'>online</span>
                </div>
            </nav>

            <ScrollArea className='grow p-2'>
                    {
                        messages.map(msg=>{
                            if(msg.to===userId) return <SentMessage content={msg.content} key={msg.id} />
                            else return <ReceivedMessage content={msg.content} key={msg.id} />
                        })
                    }
            </ScrollArea>

            <form onSubmit={handleSubmit(onSubmit)} className='flex gap-2 items-end'>
                <TextareaAutosize
                {...register("message",{
                    required : true,
                    minLength : 1
                })}
                autoFocus placeholder='Enter a message' className='flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                />
                {errors.message && <p>{errors.message.message}</p>}
                <Button
                
                type='submit'
                >Send</Button>
            </form>

        </div>
    )
}


function SentMessage({content} : {content:string}){
    
    return (
        <div className='flex justify-end my-1'>
            <span className='p-2 bg-secondary rounded-md'>{content}</span>
        </div>
    )
}

function ReceivedMessage({content} : {content:string}){
    return (
        <div className='flex my-1'>
            <span className='p-2 bg-primary text-primary-foreground rounded-md'>{content}</span>
        </div>
    )
}
