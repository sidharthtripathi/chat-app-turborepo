import { atom } from "recoil";

export const usersAtom = atom<string[]>({
    key : "conversationsAtom",
    default : []
})


export const selectedUserAtom = atom<string | null>({
    key : "selectedUser",
    default : null
})

export const loggedInUserAtom = atom<string | null>({
    key :"loggedInUser",
    default : null
})