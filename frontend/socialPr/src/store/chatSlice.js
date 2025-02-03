import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
};

export const chatSlice = createSlice({
  name: "Chat",
  initialState: initialState,
  reducers: {
    setSelectedChatType: (state, action) => {
      state.selectedChatType = action.payload;
    },
    setSelectedChatData: (state, action) => {
      state.selectedChatData = action.payload;
    },
    setSelectedChatMessage: (state, action) => {
      state.selectedChatMessages = action.payload;
    },
    setDirectMessagesContacts: (state, action) => {
      state.directMessagesContacts = action.payload;
    },

    addMessage: (state, action) => {
      const formattedMessage = {
        ...action.payload,
        recipient:
          state.selectedChatType === "channel"
            ? action.payload.recipient
            : action.payload.recipient?._id,
        senders:
          state.selectedChatType === "channel"
            ? action.payload.senders
            : action.payload.senders?._id,
      };

      state.selectedChatMessages.push(formattedMessage);
    },

    resetEvereything: (state) => {
      state.selectedChatData = undefined;
      state.selectedChatType = undefined;
      state.selectedChatMessages = [];
    },
  },
});

export const {
  setSelectedChatData,
  setSelectedChatType,
  setSelectedChatMessage,
  setDirectMessagesContacts,
  resetEvereything,
  addMessage,
} = chatSlice.actions;
