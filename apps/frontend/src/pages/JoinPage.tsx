import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { server } from "@/lib/axios";
import { AxiosError } from "axios";
import { useSetRecoilState } from "recoil";
import { loggedInUserAtom } from "@/state/profileAtom";
const loginSignupSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(8),
});
type LoginSignupType = z.infer<typeof loginSignupSchema>;
export function Join() {
  const setLoggedInUser = useSetRecoilState(loggedInUserAtom)
  const [isLogin, setIsLogin] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSignupType>({
    resolver: zodResolver(loginSignupSchema),
  });
  async function onSubmit({userId,password}: LoginSignupType) {
    if(isLogin){
      try {
        await server.post('/api/login',{userId,password})
        setLoggedInUser(userId)
        
      } catch (error) {
        if(error instanceof AxiosError)
        console.log(error.response?.statusText)
      }
    }
    else{
      try {
        await server.post('/api/signup',{userId,password})
        setIsLogin(false)
        console.log("Created")
      } catch (error) {
        if(error instanceof AxiosError)
          console.log(error.message)
      }
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Login" : "Sign Up"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Welcome back! Please login to your account."
              : "Create a new account to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={isLogin ? "login" : "signup"}
            onValueChange={(value) => setIsLogin(value === "login")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="userId">Username</Label>
                    <Input {...register("userId")} id="userId" />
                    {errors.userId && <p>{errors.userId.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" {...register("password")} type="password" />
                    {errors.password && <p>{errors.password.message}</p>}
                  </div>
                  <Button type="submit" disabled = {isSubmitting}>Login</Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="userId">Username</Label>
                    <Input id="userId" {...register("userId")} />
                    {errors.userId && <p>{errors.userId.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" {...register("password")} type="password" />
                    {errors.password && <p>{errors.password.message}</p>}
                  </div>
                  <Button type="submit" disabled = {isSubmitting}>Sign Up</Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Button
              variant="link"
              className="p-0"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Login"}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
