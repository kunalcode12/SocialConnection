import { addMessage } from "@/store/chatSlice";
import { createContext, useContext, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { user } = useSelector((state) => state.auth);
  const { selectedChatData, selectedChatType } = useSelector(
    (state) => state.chat
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      socket.current = io("http://127.0.0.1:3000/", {
        withCredentials: true,
        query: { userId: user._id },
      });
      socket.current.on("connect", () => {
        console.log("Connected to socket server with ID:", socket.current.id);
      });
      socket.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
      console.log(selectedChatData);

      const handleRecieveMessage = (message) => {
        // console.log("Received message full details:", message);
        // console.log("Current selectedChatType:", selectedChatType);
        // console.log("Current selectedChatData:", selectedChatData);
        // console.log("Message senders:", message.senders);
        // console.log("Message recipient:", message.recipient);

        if (
          selectedChatType !== undefined &&
          (selectedChatData.userId === message.senders._id ||
            selectedChatData.userId === message.recipient._id)
        ) {
          console.log("Dispatching message to Redux store:", message);
          dispatch(addMessage(message));
        } else {
          console.log("Message not dispatched - conditions not met");
        }
      };

      socket.current.on("recieveMessage", handleRecieveMessage);

      // return () => {
      //   socket.current.disconnect();
      // };
    }
  }, [user, dispatch, selectedChatType, selectedChatData]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
