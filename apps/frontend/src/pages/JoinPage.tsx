import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { server } from '@/lib/axios'
import { AxiosError } from 'axios'
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons'
import { useToast } from "@/hooks/use-toast"
import { profileAtom } from '@/state/profileAtom'
import { useSetRecoilState } from 'recoil'

export function Join() {
  const { toast } = useToast()
  const [isLogin, setIsLogin] = useState(true)
  const [passwordHidden,togglePasswordVisibility] = useState(true)
  const [password, setPassword] = useState('')
  const [loading,setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const setProfile = useSetRecoilState(profileAtom)

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true);
    if(isLogin){
      try {
        const {data}  = await server.post('/api/login',{userId,password})
        localStorage.setItem("userId",data.userId)
        setProfile(data.userId)
      } catch (error) {
        if(error instanceof AxiosError){
          // error msg here
          toast({title : error.response?.statusText,variant :"destructive"})
        }
      }
      finally{
        setLoading(false)
      }
    }
    else{
      try {
        await server.post('/api/signup',{userId,password})
        toast({title :"Successfully Account Created"})
        setIsLogin(true)
      } catch (error) {
        if(error instanceof AxiosError) toast({title : error.response?.statusText,variant : "destructive"})
      }
      finally{setLoading(false)}
    }
   
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Login' : 'Sign Up'}</CardTitle>
          <CardDescription>
            {isLogin ? 'Welcome back! Please login to your account.' : 'Create a new account to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(value) => setIsLogin(value === 'login')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="username"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className='flex items-center rounded-md py-1 px-2 focus-within:outline border'>
                    <input
                      className='border-0 bg-transparent flex-grow focus:outline-none border-none'
                      id="password"
                      type={passwordHidden ? "password" : "text"}
                      value={password}
                      
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    { passwordHidden?  <EyeClosedIcon className='cursor-pointer' onClick={()=>{togglePasswordVisibility(p=>!p)}}/> : <EyeOpenIcon className='cursor-pointer' onClick={()=>{togglePasswordVisibility(p=>!p)}}/> }
                    </div>
                   
                  </div>
                  <Button disabled = {loading} type="submit">Login</Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="username"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className='flex items-center rounded-md py-1 px-2 focus-within:outline border'>
                    <input
                      className='border-0 bg-transparent flex-grow focus:outline-none border-none'
                      id="password"
                      type={passwordHidden? "password" : "text"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    { passwordHidden?  <EyeClosedIcon onClick={()=>{togglePasswordVisibility(p=>!p)}} className='cursor-pointer' /> : <EyeOpenIcon onClick={()=>{togglePasswordVisibility(p=>!p)}} className='cursor-pointer'/> }
                    </div>
                  </div>
                  <Button disabled = {loading} type="submit">Sign Up</Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Button variant="link" className="p-0" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Login'}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}