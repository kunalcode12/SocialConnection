import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  channels: [],
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
    setIsUploading: (state, action) => {
      state.isUploading = action.payload;
    },
    setIsDownloading: (state, action) => {
      state.isDownloading = action.payload;
    },
    setFileUploadProgress: (state, action) => {
      state.fileUploadProgress = action.payload;
    },
    setFileDownloadProgress: (state, action) => {
      state.fileDownloadProgress = action.payload;
    },
    setChannels: (state, action) => {
      state.channels = action.payload;
    },
    addChannel: (state, action) => {
      if (!action.payload) return;

      state.channels = [action.payload, ...state.channels];
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
  setIsUploading,
  setIsDownloading,
  setFileUploadProgress,
  setFileDownloadProgress,
  setChannels,
  resetEvereything,
  addMessage,
  addChannel,
} = chatSlice.actions;
