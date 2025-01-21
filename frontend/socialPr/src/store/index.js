import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./authSlice";
import { postSlice } from "./postSlice";
import { commentSlice } from "./commentSlice";
import { userUpdateSlice } from "./userUpdateSlice";
import { followSlice } from "./followSlice";

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    post: postSlice.reducer,
    userUpdate: userUpdateSlice.reducer,
    comments: commentSlice.reducer,
    follow: followSlice.reducer,
  },
});

export default store;
