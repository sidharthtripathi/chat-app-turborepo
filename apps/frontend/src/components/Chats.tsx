import { Avatar, AvatarImage,AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessagesFamily } from '@/state/MessagesAtom';
import { profileAtom } from '@/state/profileAtom';
import { wsState } from '@/state/socketAtom';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import {useRef} from 'react';
import {v4 as uuid} from 'uuid'
import { Link } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { useRecoilState, useRecoilValue } from 'recoil';
export function Chats({conversationId} : {conversationId : string}){
    const textAreaRef = useRef<null | HTMLTextAreaElement>(null)
    const profile = useRecoilValue(profileAtom)
    const [messages,setMessages] = useRecoilState(MessagesFamily(conversationId))
    const ws = useRecoilValue(wsState)
    
    return (
        <div className='p-2 flex flex-col justify-between h-screen '>
            <nav className='flex items-center gap-4'>
                <Link to={"/chats"}>
                    <ArrowLeftIcon className='size-6 cursor-pointer'/>
                </Link>
                
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                    <p className='font-bold text-lg'>username</p>
                    <span className='text-xs text-secondary-foreground'>online</span>
                </div>
            </nav>

            <ScrollArea className='grow p-2'>
                {
                    messages.map(msg=>{
                        if(msg.sender===profile?.id) return <SentMessage content={msg.content} key={msg.id} />
                        else <ReceivedMessage content={msg.content} key={msg.id} />
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
                    const content = textAreaRef.current.value
                    const sender = profile?.id as string
                    const id = uuid()
                    const createdAt = new Date()
                    setMessages((p)=>[...p,{content,conversationId,sender, id,createdAt}])
                    ws.send(JSON.stringify({
                        content,
                        sender,
                        conversationId,
                        createdAt
                    }))
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
        <div className='flex justify-end'>
            <span className='p-2 bg-secondary rounded-md'>{content}</span>
        </div>
    )
}

function ReceivedMessage({content} : {content:string}){
    return (
        <div className='flex'>
            <span className='p-2 bg-primary text-primary-foreground rounded-md'>{content}</span>
        </div>
    )
}
