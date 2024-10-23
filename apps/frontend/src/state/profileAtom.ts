import { atom } from "recoil";

export const profileAtom = atom<null | string>({
    key : "profile",
    default : localStorage.getItem("userId")
})


export const profilesAtom = atom<string[]>({
    key : "profilesArray",
    default : []
})


export const selectedProfileAtom = atom<undefined | string>({
    key : "selectedUserId",
    default : undefined
})