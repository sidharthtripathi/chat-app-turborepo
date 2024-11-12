import { atom } from "recoil";

export const usersAtom = atom<string[]>({
    key : "conversationsAtom",
    default : []
})

export const selectedUserAtom = atom<string | undefined>({
    key : "selectedUser",
    default: undefined
})

export const loggedInUserAtom = atom<{userId : string,token : string} | undefined>({
    key :"loggedInUser",
    default : undefined
})