import { atom } from "recoil";

function getUserId(){
    const userId = localStorage.getItem("userId")
    if(!userId) return undefined
    else return userId
}
export const profileAtom = atom<undefined | string>({
    key : "profile",
    default : getUserId()
})


export const profilesAtom = atom<string[]>({
    key : "profilesArray",
    default : []
})


export const selectedProfileAtom = atom<undefined | string>({
    key : "selectedUserId",
    default : undefined
})