import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/entities/user/types/user.types";

const initialState: User = {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInVzZXJuYW1lIjoibTBuZXN5IiwiaWF0IjoxNzYyMDIyMjM3LCJleHAiOjE3NjI2MjcwMzd9.F4MzxnAwhEcEMmxKo1Ieov-7bYfjwyGV4SfiWc-VXqc",
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
