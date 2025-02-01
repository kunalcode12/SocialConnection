import ChatContainer from "./Chat-container";
import ContactsContainer from "./contacts-container";
import EmptyChatContainer from "./empty-chat-container";

const Chat = () => {
  return (
    <div className=" mt-14 flex h-[90vh] text-white overflow-hidden">
      <ContactsContainer />
      {/* <EmptyChatContainer /> */}
      <ChatContainer />
    </div>
  );
};

export default Chat;
