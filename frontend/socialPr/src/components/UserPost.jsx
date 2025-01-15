import { memo, useState, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../components/UI/Avatar";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../components/UI/CardComp";
import { Button } from "../components/UI/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/UI/Alerts";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Award,
  MoreHorizontal,
  Edit,
  Delete,
  Bookmark,
  Flag,
} from "lucide-react";
import {
  deletePostApi,
  setSuccess,
  setError,
  unsavedPostApi,
} from "../store/postSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const UserPost = memo(({ post, id, name, className, isbookMarkedPost }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);

  const sameUserPost = id === user?._id;
  console.log(id, user?._id);

  const handleThreeDotClick = useCallback((e) => {
    e.stopPropagation();
    setShowDropdown((prev) => !prev);
  }, []);

  const {
    loading,
    error,
    savingSuccess,
    savingError,

    isError,
    success,
  } = useSelector((state) => state.post);

  const handleDropdownOptionClick = useCallback(
    (option, post) => {
      if (option === "delete") {
        setShowDeleteConfirmation(true);
      }
      if (option === "edit") {
        const editPath = `${location.pathname}/edit`;
        navigate(editPath, { state: { post, name } });
      }
      if (option === "saved") {
        //
        dispatch(unsavedPostApi(post._id));
      }
      setShowDropdown(false);
    },
    [navigate, location, name, dispatch]
  );

  const handleDeleteConfirm = useCallback(() => {
    dispatch(deletePostApi(post._id, token));

    setShowDeleteConfirmation(false);
  }, [dispatch, post._id, token]);

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

  useEffect(() => {
    let timer;
    if (success || isError) {
      timer = setTimeout(() => {
        success ? dispatch(setSuccess(false)) : dispatch(setError(false));
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, isError, dispatch]);

  return (
    <>
      <AnimatePresence>
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2
             bg-red-500 
           text-white p-4 rounded-md shadow-lg z-50 `}
          >
            unable to delete the post
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2
             bg-green-500 
           text-white p-4 rounded-md shadow-lg z-50 `}
          >
            Post deleted successfully
          </motion.div>
        )}
      </AnimatePresence>

      <Card className={`w-full max-w-2xl bg-white mb-4 ${className}`}>
        <CardHeader className="p-3 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage
                  src="/placeholder.svg?height=24&width=24"
                  alt={name}
                />
                <AvatarFallback>
                  {name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center text-sm">
                <span className="font-medium hover:cursor-pointer hover:text-blue-600">
                  by/{name}
                </span>
                <span className="mx-1 text-gray-500">•</span>
                <span className="text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
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
                        <button
                          onClick={() =>
                            handleDropdownOptionClick("saved", post)
                          }
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                          role="menuitem"
                        >
                          <Bookmark className="inline-block w-4 h-4 mr-2 " />
                          Save
                        </button>
                        <button
                          onClick={() =>
                            handleDropdownOptionClick("report", post)
                          }
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
                          onClick={() =>
                            handleDropdownOptionClick("edit", post)
                          }
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                          role="menuitem"
                        >
                          <Edit className="inline-block w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDropdownOptionClick("delete", post)
                          }
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
              <ArrowBigUp className="h-6 w-8 mr-1 hover:text-red-500" />
              <span className="font-bold">{post.upVote}</span>
              <ArrowBigDown className="h-6 w-8 mr-1 hover:text-red-500" />
            </Button>
            <Button
              variant="secondary"
              className="bg-gray-200 hover:bg-gray-300"
              size="sm"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{post.comments?.length || 0}</span>
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

      <AlertDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this post?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

UserPost.displayName = "UserPost";

export default UserPost;
