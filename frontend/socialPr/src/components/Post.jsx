import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Award,
  MoreHorizontal,
  Edit,
  Flag,
  Delete,
  BookmarkCheck,
} from "lucide-react";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "./UI/CardComp";
import { Button } from "./UI/Button";
import { Avatar, AvatarImage, AvatarFallback } from "./UI/Avatar";
import Modal from "./UI/Modal";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { savePostApi } from "@/store/postSlice";
import { setSavingSuccess } from "@/store/postSlice";
import { unsavedPostApi } from "@/store/postSlice";
import { useDispatch } from "react-redux";
import { Alert, AlertDescription } from "./UI/Alerts";
import CommentModal from "./CommentModel";
import { getComments } from "@/store/commentSlice";

function Post({ post, id, name }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showError, setShowError] = useState(false);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, savingSuccess, savingError, error } = useSelector(
    (state) => state.post
  );
  const { isAuthenticated, user, profileUser } = useSelector(
    (state) => state.auth
  );

  const sameUserPost = id === user?._id;

  const isBookmarked = user?.bookmarkedCont?.some(
    (bookmark) => bookmark.content._id === post._id
  );

  useEffect(() => {
    if (savingError) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [savingError]);

  const handleThreeDotClick = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  console.log();

  const handleDropdownOptionClick = (option) => {
    if (option === "delete" || option === "edit") {
      navigate(isAuthenticated ? `/user/${id}` : "/");
    }
    if (option === "save") {
      dispatch(savePostApi(post._id));
    }
    if (option === "unsave") {
      dispatch(unsavedPostApi(post._id));
    }
    setShowDropdown(false);
  };

  const openComments = (post) => {
    setSelectedPost(post);
    dispatch(getComments(post._id));
  };

  const closeComments = () => {
    setSelectedPost(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <>
      {showError && (
        <Alert className="fixed top-4 right-4 w-72 bg-red-100 border-red-400">
          <AlertDescription>Unable to save the post</AlertDescription>
        </Alert>
      )}
      <Card key={post.id} className="w-full max-w-2xl bg-white mb-4">
        <CardHeader className="p-3 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage
                  src="/placeholder.svg?height=24&width=24"
                  alt="r/AskIndia"
                />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="flex items-center text-sm">
                <Link to={isAuthenticated ? `/user/${id}` : "/"}>
                  <span className="font-medium hover:cursor-pointer hover:text-blue-600">
                    by/{name}
                  </span>
                </Link>
                <span className="mx-1 text-gray-500">•</span>
                <span className="text-gray-500">{post.createdAt}</span>
                <span className="mx-1 text-gray-500">•</span>
                <span className="text-gray-500">Suggested</span>
              </div>
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleThreeDotClick}
                ref={buttonRef}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                >
                  <div
                    className="py-1"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    {!sameUserPost && (
                      <>
                        {isBookmarked ? (
                          <button
                            onClick={() => handleDropdownOptionClick("unsave")}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                            role="menuitem"
                            disabled={loading}
                          >
                            <BookmarkCheck className="inline-block w-4 h-4 mr-2" />
                            {loading ? "Saving..." : "Saved"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDropdownOptionClick("save")}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                            role="menuitem"
                            disabled={loading}
                          >
                            <Bookmark className="inline-block w-4 h-4 mr-2" />
                            {loading ? "Saving..." : "Save"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDropdownOptionClick("report")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                          role="menuitem"
                        >
                          <Flag className="inline-block w-4 h-4 mr-2" />
                          Report
                        </button>
                      </>
                    )}
                    {sameUserPost && (
                      <>
                        <button
                          onClick={() => handleDropdownOptionClick("edit")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                          role="menuitem"
                        >
                          <Edit className="inline-block w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDropdownOptionClick("delete")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                          role="menuitem"
                        >
                          <Delete className="inline-block w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <CardTitle className="text-lg font-medium mb-2">
            {post.title}
          </CardTitle>
          <CardDescription className="text-base text-black">
            {post.description}
          </CardDescription>
          <div className="flex items-center space-x-2 mt-3">
            <Button
              variant="secondary"
              className="bg-gray-200 hover:bg-gray-300"
              size="sm"
            >
              <ArrowBigUp className="h-6 w-8 mr-1 hover:text-red-500 " />
              <span className="font-bold">{post.upVote}</span>
              <ArrowBigDown className="h-6 w-8 mr-1 hover:text-red-500" />
            </Button>
            <Button
              variant="secondary"
              className="bg-gray-200 hover:bg-gray-300"
              size="sm"
              onClick={() => openComments(post)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{post.comments}</span>
            </Button>
            <Button
              variant="secondary"
              className="bg-gray-200 hover:bg-gray-300"
              size="sm"
            >
              <Award className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              className="bg-gray-200 hover:bg-gray-300"
              size="sm"
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span>Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <CommentModal
        post={selectedPost}
        isOpen={selectedPost !== null}
        onClose={closeComments}
        userName={name}
      />
    </>
  );
}

export default Post;
