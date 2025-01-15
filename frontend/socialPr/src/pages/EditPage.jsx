import { useState, useRef, useMemo, useEffect } from "react";
import { useLocation, Link, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Image,
  Play,
  FileText,
  X,
  LinkIcon,
  Send,
  ArrowLeft,
} from "lucide-react";
import { Button } from "../components/UI/Button";
import { useSelector, useDispatch } from "react-redux";
import { updatePostApi, setUpdatePostError } from "../store/postSlice";
import { motion, AnimatePresence } from "framer-motion";
import UserPost from "../components/UserPost";

const EditPage = () => {
  const location = useLocation();
  const post = location.state;
  const userId = useParams();

  const dispatch = useDispatch();

  const [content, setContent] = useState(post.post.description);

  const [title, setTitle] = useState(post.post.title);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [url, setUrl] = useState(post.post.url || "");

  const { updatePostLoading, error, updatePostError, updatePostSuccess } =
    useSelector((state) => state.post);

  const token = useSelector((state) => state.auth.token);

  const isSubmitEnabled = useMemo(() => {
    return title.trim().length > 1 && content.trim().length > 1;
  }, [title, content]);

  const submitButtonClass = useMemo(() => {
    const baseClass = "flex items-center";
    const enabledClass = "bg-blue-800 text-white hover:bg-blue-900";
    const disabledClass = "bg-gray-100 text-gray-400 cursor-not-allowed";

    return `${baseClass} ${isSubmitEnabled ? enabledClass : disabledClass}`;
  }, [isSubmitEnabled]);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleImageClick = () => imageInputRef.current.click();
  const handleVideoClick = () => videoInputRef.current.click();

  const handleSaveButtonClick = () => {
    if (isSubmitEnabled) {
      //api
      const cleanContent = content.replace(/<p>/g, "").replace(/<\/p>/g, "");
      dispatch(
        updatePostApi(post?.post._id, token, {
          title: title,
          description: cleanContent,
          url: url,
        })
      );
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview({
          type: file.type.startsWith("image") ? "image" : "video",
          src: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
  ];

  useEffect(() => {
    let timer;
    if (updatePostError) {
      timer = setTimeout(() => {
        dispatch(setUpdatePostError(false));
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [updatePostError, dispatch]);

  return (
    <>
      <AnimatePresence>
        {updatePostError && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2
             bg-red-500 
           text-white p-4 rounded-md shadow-lg z-50 `}
          >
            Unable to update the post
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-16 bg-gray-100 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="w-full mb-4 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Link to={`..`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-2 hover:bg-gray-200 transition-colors duration-200"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              </Link>
              <img
                src="/api/placeholder/32/32"
                alt="User Avatar"
                className="w-10 h-10 rounded-full"
              />
              <Link to={`..`} className="hover:underline">
                <span className="font-semibold text-lg">{post.name}</span>
              </Link>
              <span className="text-gray-500 text-sm">
                • {new Date(post.post.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/*  */}

            <input
              type="text"
              value={title}
              className="w-full text-2xl font-bold mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
            />

            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              className="mb-4"
              style={{ height: "200px", marginBottom: "50px" }}
            />

            <div className="flex items-center mb-4">
              <LinkIcon size={20} className="mr-2 text-gray-500" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter URL..."
              />
            </div>

            {mediaPreview && (
              <div className="relative mt-4 mb-4">
                {mediaPreview.type === "image" ? (
                  <img
                    src={mediaPreview.src}
                    alt="Preview"
                    className="max-w-full h-auto rounded"
                  />
                ) : (
                  <video
                    src={mediaPreview.src}
                    controls
                    className="max-w-full h-auto rounded"
                  />
                )}
                <button
                  onClick={() => setMediaPreview(null)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleFileChange}
                  accept="video/*"
                  className="hidden"
                />
                <Button variant="outline" size="sm" onClick={handleImageClick}>
                  <Image size={16} className="mr-2" /> Image
                </Button>
                <Button variant="outline" size="sm" onClick={handleVideoClick}>
                  <Play size={16} className="mr-2" /> Video
                </Button>
                <Button variant="outline" size="sm">
                  <FileText size={16} className="mr-2" /> File
                </Button>
              </div>
              <div className="flex space-x-2">
                <Link to={".."}>
                  <Button variant="ghost" size="sm">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className={submitButtonClass}
                  disabled={!isSubmitEnabled}
                  onClick={handleSaveButtonClick}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {!updatePostLoading ? "Submit" : "Submitting..."}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {updatePostSuccess && (
          <UserPost
            post={post.post}
            name={post.name}
            id={userId}
            className={"ml-72"}
          />
        )}
      </div>
    </>
  );
};

export default EditPage;
