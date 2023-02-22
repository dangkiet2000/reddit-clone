import { atom } from "recoil";

/*
    * Its quite similar AuthModalSlice (name, initialState, reducers - export actions to dispatch) in redux toolkit
*/
export interface AuthModalState {
  open: boolean;
  view: "login" | "signup" | "resetPassword"; // Its string and we know this view just has one of three values. => Do this
}

const defaultModalState: AuthModalState = {
  open: false,
  view: "login",
};

export const authModalState = atom<AuthModalState>({
    key: "authModalState",
    default: defaultModalState
})
