import { useSelector } from "react-redux";
import ChatContainer from "./Chat-container";
import ContactsContainer from "./contacts-container";
import EmptyChatContainer from "./empty-chat-container";

const Chat = () => {
  const { selectedChatData, selectedChatType } = useSelector(
    (state) => state.chat
  );

  return (
    <div className=" mt-14 flex h-[90vh] text-white overflow-hidden">
      <ContactsContainer />
      {selectedChatType === undefined ? (
        <EmptyChatContainer />
      ) : (
        <ChatContainer />
      )}
    </div>
  );
};

export default Chat;
