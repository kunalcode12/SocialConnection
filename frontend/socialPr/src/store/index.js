import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./authSlice";
import { postSlice } from "./postSlice";
import { userUpdateSlice } from "./userUpdateSlice";

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    post: postSlice.reducer,
    userUpdate: userUpdateSlice.reducer,
  },
});

export default store;
