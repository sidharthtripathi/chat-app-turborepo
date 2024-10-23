import { Avatar,AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import {useRef} from 'react';
import {v4 as uuid} from 'uuid'
import {sentMessageSchema} from 'schema'
import z from 'zod'
import TextareaAutosize from 'react-textarea-autosize';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { selectedProfileAtom } from '@/state/profileAtom';
import { messagesFamily } from '@/state/messagesAtom';
import { profileAtom } from '@/state/profileAtom';
import { useSocket } from '@/hooks/useSocket';

type sentMessageType = z.infer<typeof sentMessageSchema>
export function Chats({userId} : {userId : string}){
    const ws = useSocket()
    const textAreaRef = useRef<null | HTMLTextAreaElement>(null)
    const setSelectedUserId = useSetRecoilState(selectedProfileAtom)
    const [messages,setMessages] = useRecoilState(messagesFamily(userId))
    const profile = useRecoilValue(profileAtom)
    return (
        <div className='p-2 flex flex-col justify-between h-screen '>
            <nav className='flex items-center gap-4'>
                    <ArrowLeftIcon className='size-6 cursor-pointer'
                    onClick={()=>{
                        setSelectedUserId(undefined)
                    }}/>
                <Avatar>
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                    <p className='font-bold text-lg'>{userId}</p>
                    <span className='text-xs text-secondary-foreground'>online</span>
                </div>
            </nav>

            <ScrollArea className='grow p-2'>
                    {
                        messages.map(msg=>{
                            if(msg.from===profile) return <SentMessage content={msg.content} key={msg.id} />
                            else return <ReceivedMessage content={msg.content} key={msg.id} />
                        })
                    }
            </ScrollArea>

            <div className='flex gap-2 items-end'>
                <TextareaAutosize
                ref={textAreaRef}
                autoFocus placeholder='Enter a message' className='flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'/>
                <Button
                onClick={()=>{
                    if(textAreaRef.current){
                    const payload : sentMessageType = {
                        content : textAreaRef.current.value,
                        createdAt : Date.now(),
                        id : uuid(),
                        to : userId
                    }
                    setMessages(p=>([...p,{...payload,from:profile!}]))
                    ws.send(JSON.stringify(payload))
                    textAreaRef.current.value = ""
                    }
                    
                }}
                >Send</Button>
            </div>

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
