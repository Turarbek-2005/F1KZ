import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/entities/user/types/user";

const initialState: User = {
    token: "",
    user: {
        id: 0,
        username: "",
        email: "",
    }
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.token = action.payload.token;
        state.user = action.payload.user;
    },
    logout(state) {
        state.token = "";
        state.user = { id: 0, username: "", email: "" };
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
