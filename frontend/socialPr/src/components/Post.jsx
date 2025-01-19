import {
  ArrowBigUp,
  MessageSquare,
  Share2,
  Award,
  MoreHorizontal,
  Edit,
  Flag,
  Delete,
  BookmarkCheck,
  Bookmark,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "./UI/CardComp";
import { Button } from "./UI/Button";
import { Avatar, AvatarImage, AvatarFallback } from "./UI/Avatar";
import { useState, useEffect, useRef, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { savePostApi, unsavedPostApi } from "@/store/postSlice";
import { Alert, AlertDescription } from "./UI/Alerts";
import CommentModal from "./CommentModel";
import { getComments, getUserVotes } from "@/store/commentSlice";

const Post = memo(function Post({ post, id, name, onUpvote, currentUser }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showError, setShowError] = useState(false);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, savingError, upvotedContent } = useSelector(
    (state) => state.post
  );
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const sameUserPost = id === user?._id;
  const isUpvoted = upvotedContent?.includes(post._id);
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

  const handleDropdownOptionClick = (option) => {
    switch (option) {
      case "delete":
      case "edit":
        navigate(isAuthenticated ? `/user/${id}` : "/");
        break;
      case "save":
        dispatch(savePostApi(post._id));
        break;
      case "unsave":
        dispatch(unsavedPostApi(post._id));
        break;
    }
    setShowDropdown(false);
  };

  const handleUpvote = (e) => {
    e.preventDefault();
    if (currentUser) onUpvote(post._id);
  };

  const openComments = (post) => {
    setSelectedPost(post);
    if (user?._id) {
      dispatch(getUserVotes(user._id));
      dispatch(getComments(post._id));
    }
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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  return (
    <>
      {showError && (
        <Alert className="fixed top-4 right-4 w-72 bg-red-100 border-red-400 shadow-lg animate-fade-in">
          <AlertDescription>Unable to save the post</AlertDescription>
        </Alert>
      )}
      <Card className="w-full max-w-2xl bg-white mb-4 hover:shadow-lg transition-shadow duration-200 rounded-lg border border-gray-200">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8 ring-2 ring-gray-100">
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt={`${name}'s avatar`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <Link to={isAuthenticated ? `/user/${id}` : "/"}>
                  <span className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {name}
                  </span>
                </Link>
                <div className="flex items-center text-sm text-gray-500 space-x-2">
                  <span>{formattedDate}</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    Suggested
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleThreeDotClick}
                ref={buttonRef}
                className="hover:bg-gray-100 rounded-full"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-10 overflow-hidden"
                >
                  <div className="py-1" role="menu">
                    {!sameUserPost ? (
                      <>
                        <button
                          onClick={() =>
                            handleDropdownOptionClick(
                              isBookmarked ? "unsave" : "save"
                            )
                          }
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          disabled={loading}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4 mr-2 text-green-500" />
                          ) : (
                            <Bookmark className="w-4 h-4 mr-2" />
                          )}
                          {loading
                            ? "Saving..."
                            : isBookmarked
                            ? "Saved"
                            : "Save"}
                        </button>
                        <button
                          onClick={() => handleDropdownOptionClick("report")}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Flag className="w-4 h-4 mr-2 text-red-500" />
                          Report
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDropdownOptionClick("edit")}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4 mr-2 text-blue-500" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDropdownOptionClick("delete")}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          <Delete className="w-4 h-4 mr-2" />
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
        <CardContent className="p-4">
          <CardTitle className="text-xl font-bold mb-3 text-gray-900">
            {post.title}
          </CardTitle>
          <CardDescription className="text-base text-gray-700 leading-relaxed">
            {post.description}
          </CardDescription>
          <div className="flex items-center space-x-3 mt-4">
            <Button
              variant="ghost"
              className={`hover:bg-gray-100 rounded-full transition-colors ${
                isUpvoted ? "bg-red-50" : ""
              }`}
              onClick={handleUpvote}
              disabled={!currentUser}
            >
              <div className="flex items-center space-x-2">
                <ArrowBigUp
                  className={`h-7 w-7 transition-colors ${
                    isUpvoted
                      ? "text-red-500"
                      : "text-gray-500 group-hover:text-red-500"
                  }`}
                />
                <span
                  className={`font-bold ${
                    isUpvoted ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  {post.upVote}
                </span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="hover:bg-gray-100 rounded-full space-x-2"
              onClick={() => openComments(post)}
            >
              <MessageSquare className="h-5 w-5 text-gray-500" />
              <span className="font-medium">{post.comments}</span>
            </Button>
            <Button variant="ghost" className="hover:bg-gray-100 rounded-full">
              <Award className="h-5 w-5 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              className="hover:bg-gray-100 rounded-full space-x-2"
            >
              <Share2 className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <CommentModal
        post={selectedPost}
        isOpen={selectedPost !== null}
        onClose={() => setSelectedPost(null)}
        userName={name}
      />
    </>
  );
});

export default Post;
