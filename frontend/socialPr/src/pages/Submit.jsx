import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Type,
  Image as ImageIcon,
  Video,
  Send,
  Eye,
} from "lucide-react";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { Textarea } from "../components/UI/TextArea";

import FileUpload from "../components/FileUplaod";
import PostPreview from "../components/PostPreview";
import { useCallback, useMemo } from "react";
import { Form } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addPost, setLoading, setError } from "../store/postSlice";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EnhancedSubmitPage = () => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [activeButton, setActiveButton] = useState("post");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const loading = useSelector((state) => state.post.loading);

  const baseClasses =
    "ml-10 w-[800px] py-2 flex h-14 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
  };

  const isSubmitEnabled = useMemo(() => {
    return title.trim().length > 1 && content.trim().length > 1;
  }, [title, content]);

  const submitButtonClass = useMemo(() => {
    const baseClass = "flex items-center";
    const enabledClass = "bg-blue-800 text-white hover:bg-blue-900";
    const disabledClass = "bg-gray-100 text-gray-400 cursor-not-allowed";

    return `${baseClass} ${isSubmitEnabled ? enabledClass : disabledClass}`;
  }, [isSubmitEnabled]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitEnabled) {
      dispatch(setLoading(true));
      try {
        const response = await fetch("http://127.0.0.1:3000/api/v1/content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add this line to include the token
          },
          body: JSON.stringify({
            title: title,
            description: content,
            url: link,
            category: "education",
          }),
        });
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || "Failed to create post");
        }

        dispatch(addPost(responseData.data.data));
        console.log("Post created:", responseData.data.data);
        alert("Post submitted successfully!");
        // Clear the form
        setTitle("");
        setContent("");
        setLink("");
        navigate(`/user/${responseData.data.data.user}`);
      } catch (error) {
        console.error("Error creating post:", error);
        dispatch(setError(error.message));
        setErrorMessage("Unable to create a post");
        // alert("Error submitting post. Please try again.");
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleButtonClick = useCallback((buttonValue) => {
    setActiveButton(buttonValue);
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getButtonStyle = (buttonValue) => {
    return activeButton === buttonValue
      ? "bg-gray-300 text-gray-800"
      : "hover:bg-gray-300 bg-white text-gray-600";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 my-20 bg-background">
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-12 left-12 right-12 bg-red-500 text-white p-4 text-center"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
      <h1 className="text-3xl font-bold mb-6 text-center">Create post</h1>

      <Form
        onSubmit={handleSubmit}
        method="post"
        className="space-y-10 space-x-10"
      >
        <Input
          type="text"
          id="title"
          placeholder="Title"
          value={title}
          name="title"
          onChange={(e) => setTitle(e.target.value)}
          className={`${baseClasses} ${variantClasses.outline}`}
          required
        />

        <div className="space-y-4">
          <div className="grid w-full grid-cols-4 h-auto">
            <Button
              type="button"
              onClick={() => handleButtonClick("post")}
              className={getButtonStyle("post")}
            >
              <Type className="w-4 h-4 mr-2" /> Post
            </Button>

            <Button
              type="button"
              onClick={() => handleButtonClick("image")}
              className={getButtonStyle("image")}
            >
              <ImageIcon className="w-4 h-4 mr-2" /> Image
            </Button>

            <Button
              type="button"
              onClick={() => handleButtonClick("video")}
              className={getButtonStyle("video")}
            >
              <Video className="w-4 h-4 mr-2" /> Video
            </Button>

            <Button
              type="button"
              onClick={() => handleButtonClick("link")}
              className={getButtonStyle("link")}
            >
              <Link2 className="w-4 h-4 mr-2" /> Link
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isPreviewMode ? "preview" : "edit"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {isPreviewMode ? (
                <PostPreview
                  title={title}
                  content={content}
                  link={link}
                  file={file}
                />
              ) : (
                <div>
                  {activeButton === "post" && (
                    <Textarea
                      placeholder="Text (optional)"
                      value={content}
                      name="description"
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[190px] rounded-xl"
                    />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {activeButton === "image" && (
            <FileUpload
              type="image"
              file={file}
              name="image"
              onFileChange={handleFileChange}
              triggerFileInput={triggerFileInput}
              fileInputRef={fileInputRef}
            />
          )}

          {activeButton === "video" && (
            <FileUpload
              type="video"
              name="video"
              file={file}
              onFileChange={handleFileChange}
              triggerFileInput={triggerFileInput}
              fileInputRef={fileInputRef}
            />
          )}

          {activeButton === "link" && (
            <Input
              type="url"
              placeholder="Url"
              name="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full p-4 rounded-xl"
            />
          )}
        </div>

        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center  bg-gray-100 text-gray-400"
          >
            {isPreviewMode ? (
              <Type className="w-4 h-4 mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>
          <Button
            type="submit"
            className={submitButtonClass}
            disabled={!isSubmitEnabled}
          >
            <Send className="w-4 h-4 mr-2" />
            {!loading ? "Post" : "Posting..."}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EnhancedSubmitPage;
