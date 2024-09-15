import {atom} from 'recoil'
import z from 'zod'
const localStorageProfileSchema = z.object({
    username : z.string(),
    id : z.string()
})
export const profileAtom = atom<undefined | {username:string,id:string}>({
    key :"profile",
    default : getProfile()
})

function getProfile(){
    const profileString = localStorage.getItem("profile")
    if(profileString==null) return undefined;
    try {
        const profile = localStorageProfileSchema.parse(JSON.parse(profileString))
        return profile
    } catch (error) {
        console.log(error)
        return  undefined
    }
}