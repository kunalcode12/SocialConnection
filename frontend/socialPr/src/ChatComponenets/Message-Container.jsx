import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedChatMessage } from "@/store/chatSlice";
import { Download, Folder, X } from "lucide-react";
import { setFileDownloadProgress, setIsDownloading } from "@/store/chatSlice";
import axios from "axios";

function MessageContainer() {
  const scrollRef = useRef();
  const dispatch = useDispatch();
  const [showImage, setShowImage] = useState();
  const [imageURL, setImageURL] = useState();
  // const { user } = useSelector((state) => state.auth);
  const { selectedChatType, selectedChatData, selectedChatMessages } =
    useSelector((state) => state.chat);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:3000/api/v1/messages/get-messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: selectedChatData.userId }),
          }
        );

        const data = await response.json();
        console.log(data);

        if (data.messages) {
          dispatch(setSelectedChatMessage(data.messages));
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedChatData.userId) {
      if (selectedChatType === "contact") {
        getMessages();
      }
    }
  }, [selectedChatData, selectedChatType, dispatch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checIfImage = (filepath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;

    return imageRegex.test(filepath);
  };

  const downloadFile = async (url) => {
    dispatch(setIsDownloading(true));
    const response = await axios.get(`http://127.0.0.1:3000/${url}`, {
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;
        const percentCompleted = Math.round((loaded * 100) / total);
        dispatch(setFileDownloadProgress(percentCompleted));
      },
    });

    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
    dispatch(setIsDownloading(false));
    dispatch(setFileDownloadProgress(0));
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}

          {selectedChatType === "contact" && renderDMMessages(message)}
        </div>
      );
    });
  };

  const renderDMMessages = (message) => (
    <div
      className={`${
        message.senders === selectedChatData.userId ? "text-left" : "text-right"
      }`}
    >
      {message.messageType === "text" && (
        <div
          className={`${
            message.senders !== selectedChatData.userId
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50 "
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20 "
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words `}
        >
          {message.content}
        </div>
      )}
      {message.messageType === "file" && (
        <div
          className={`${
            message.senders !== selectedChatData.userId
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50 "
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20 "
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words `}
        >
          {checIfImage(message.fileUrl) ? (
            <div
              className="cursor-pointer"
              onClick={() => {
                setShowImage(true), setImageURL(message.fileUrl);
              }}
            >
              <img
                src={`http://127.0.0.1:3000/${message.fileUrl}`}
                height={300}
                width={300}
                alt="messageImage"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-5">
              <span className="text-white/8 text-3xl bg-black/20 rounded-full p-3">
                <Folder />
              </span>
              <span>{message.fileUrl.split("/").pop()}</span>
              <span
                onClick={() => downloadFile(message.fileUrl)}
                className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300 "
              >
                <Download />
              </span>
            </div>
          )}
        </div>
      )}
      <div className="text-xs text-gray-600">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {renderMessages()}
      <div ref={scrollRef} />
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <div>
            <img
              src={`http://127.0.0.1:3000/${imageURL}`}
              className="h-[80vh] w-full bg-cover"
            />
          </div>
          <div className="flex gap-5 fixed top-0 mt-5 ">
            <button
              onClick={() => downloadFile(imageURL)}
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300 "
            >
              <Download />
            </button>
            <button
              onClick={() => {
                setShowImage(false);
                setImageURL(null);
              }}
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300 "
            >
              <X />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageContainer;
