import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "./UI/Button";
import { Avatar, AvatarImage, AvatarFallback } from "./UI/Avatar";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Heart,
  MessageCircle,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { createComment, upvoteReply, resetStatus } from "@/store/commentSlice";
import { deleteComment } from "@/store/commentSlice";
import { replyToComment } from "@/store/commentSlice";
import { deleteReply } from "@/store/commentSlice";
import { upvoteComment } from "@/store/commentSlice";
import { Alert, AlertDescription } from "./UI/Alerts";

const CommentModal = ({ isOpen, onClose, userName, post }) => {
  const dispatch = useDispatch();
  const [newComment, setNewComment] = useState("");
  const [replyStates, setReplyStates] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const {
    comments,
    loading,
    isError,
    success,
    errorMessage,
    successMessage,
    userVotes,
    upvoteLoading,
  } = useSelector((state) => state.comments);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(resetStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen) {
      dispatch(resetStatus());
    }
  }, [isOpen, dispatch]);

  const handleShowReplyInput = (commentId) => {
    setReplyStates((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  useEffect(() => {
    if (isError || success) {
      const timer = setTimeout(() => {
        dispatch(resetStatus());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isError, success, dispatch]);

  const handleAddReply = (e, commentId) => {
    e.preventDefault();

    const replyText = replyTexts[commentId];

    if (!replyText?.trim()) return;

    dispatch(replyToComment(commentId, replyText));

    setReplyTexts((prev) => ({
      ...prev,
      [commentId]: "",
    }));
    setReplyStates((prev) => ({
      ...prev,
      [commentId]: false,
    }));
  };

  const handleReplyTextChange = (commentId, text) => {
    setReplyTexts((prev) => ({
      ...prev,
      [commentId]: text,
    }));
  };

  const handlePostComment = (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    dispatch(createComment(post._id, newComment.trim()));

    setNewComment("");
  };

  const handleDeleteComment = (commentId) => {
    // Dispatch delete comment action
    dispatch(deleteComment(commentId));
  };

  const handleDeleteReply = (commentId, replyId) => {
    dispatch(deleteReply(commentId, replyId));
  };

  const handleUpvoteComment = (commentId) => {
    dispatch(upvoteComment(commentId));
  };

  const handleUpvoteReply = (commentId, replyId) => {
    dispatch(upvoteReply(commentId, replyId));
  };

  const hasUserUpvotedComment = (commentId) => {
    return (
      userVotes?.commentVotes?.some(
        (vote) =>
          vote.commentId === commentId &&
          vote.userId === user?._id &&
          vote.voteType === "upvote"
      ) || false
    );
  };

  // Function to check if user has upvoted a reply
  const hasUserUpvotedReply = (replyId) => {
    return (
      userVotes?.replyVotes?.some(
        (vote) =>
          vote.replyId === replyId &&
          vote.userId === user?._id &&
          vote.voteType === "upvote"
      ) || false
    );
  };

  const isCommentOwner = (comment) => {
    if (!user || !comment) return false;

    const commentUserId = comment.userId?._id || comment.userId;
    const currentUserId = user._id;

    return commentUserId === currentUserId;
  };

  const isReplyOwner = (reply) => {
    if (!user || !reply) return false;

    const replyUserId = reply.userId?._id || reply.userId;
    const currentUserId = user._id;

    return replyUserId === currentUserId;
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-5xl z-50 bg-transparent border-none shadow-none p-0 gap-0 outline-none">
          {(isError || success) && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-96">
              {isError && (
                <Alert variant="destructive" className="mb-2">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <div className="relative flex flex-col md:flex-row h-[85vh] md:h-[75vh] bg-white rounded-xl overflow-hidden shadow-2xl">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Media Section */}
            <div className="w-full md:w-3/5 bg-black/95 flex items-center justify-center">
              {post.url ? (
                <video
                  src={post.url}
                  alt="Post content"
                  className="w-full h-full object-contain"
                  controls
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                  <img
                    src="/api/placeholder/400/400"
                    alt="Placeholder"
                    className="opacity-50"
                  />
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="w-full md:w-2/5 flex flex-col bg-white">
              {/* Header */}
              <header className="border-b p-4 flex items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10 shadow-sm">
                <Avatar className="w-10 h-10 mr-3 ring-2 ring-blue-100">
                  <AvatarImage
                    src={post.user?.avatar || "/api/placeholder/40/40"}
                    alt={userName}
                  />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {userName?.[0]?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer">
                    {userName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </header>

              {/* Content and Comments */}
              <div className="flex-grow overflow-y-auto custom-scrollbar">
                {/* Comments List */}
                <div className="p-4 space-y-6">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        No comments yet. Be the first to comment!
                      </p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex items-start space-x-3 group relative"
                      >
                        <Avatar className="w-8 h-8 ring-1 ring-blue-100">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            {comment.userId?.name?.[0]?.toUpperCase() || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-2xl px-4 py-2 shadow-sm relative group">
                            <p className="mb-1 pr-8">
                              <span className="font-bold text-gray-900 mr-2">
                                {comment.userId?.name}
                              </span>
                              <span className="text-gray-800">
                                {comment.comment}
                              </span>
                            </p>
                            {isCommentOwner(comment) && (
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-red-50 rounded-full"
                                title="Delete comment"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-xs mt-1.5 text-gray-500 pl-4">
                            <span>
                              {formatDistanceToNow(
                                new Date(comment.createdAt),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </span>
                            <button
                              onClick={() => handleUpvoteComment(comment._id)}
                              className="flex items-center space-x-1 group"
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  hasUserUpvotedComment(comment._id)
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-400 group-hover:text-red-500"
                                } transition-colors`}
                              />
                              <span
                                className={`${
                                  hasUserUpvotedComment(comment._id)
                                    ? "text-red-500"
                                    : "text-gray-500"
                                } group-hover:text-red-500`}
                              >
                                {comment.upVote || 0}
                              </span>
                            </button>
                            <button
                              className="font-semibold hover:text-blue-600"
                              onClick={() => handleShowReplyInput(comment.id)}
                            >
                              Reply
                            </button>
                          </div>

                          {/* Reply Input */}
                          {replyStates[comment.id] && (
                            <form
                              onSubmit={(e) => handleAddReply(e, comment.id)}
                              className="mt-3 pl-4"
                            >
                              <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 shadow-sm">
                                <input
                                  type="text"
                                  value={replyTexts[comment.id] || ""}
                                  onChange={(e) =>
                                    handleReplyTextChange(
                                      comment.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Write a reply..."
                                  className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
                                />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2 text-blue-500 font-semibold hover:text-blue-600 hover:bg-transparent"
                                >
                                  Post
                                </Button>
                              </div>
                            </form>
                          )}

                          {/* Replies */}
                          {Array.isArray(comment.replies) &&
                            comment.replies.length > 0 && (
                              <div className="mt-3 space-y-3">
                                {comment.replies.map((reply) => (
                                  <div
                                    key={reply._id}
                                    className="ml-8 flex items-start space-x-3"
                                  >
                                    <Avatar className="w-6 h-6 ring-1 ring-blue-100">
                                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xs">
                                        {reply.userId?.name?.[0]?.toUpperCase() ||
                                          "A"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="bg-gray-50 rounded-2xl px-3 py-2 shadow-sm relative group/reply">
                                        <p className="mb-1 pr-8">
                                          <span className="font-bold text-gray-900 mr-2 text-sm">
                                            {reply.userId?.name}
                                          </span>
                                          <span className="text-gray-800 text-sm">
                                            {reply.reply}
                                          </span>
                                        </p>
                                        {isReplyOwner(reply) && (
                                          <button
                                            onClick={() =>
                                              handleDeleteReply(
                                                comment._id,
                                                reply._id
                                              )
                                            }
                                            className="absolute right-2 top-2 opacity-0 group-hover/reply:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-red-50 rounded-full"
                                            title="Delete reply"
                                          >
                                            <Trash2 className="h-3 w-3 text-red-500" />
                                          </button>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-4 text-xs mt-1 text-gray-500 pl-3">
                                        <span>
                                          {formatDistanceToNow(
                                            new Date(reply.createdAt),
                                            {
                                              addSuffix: true,
                                            }
                                          )}
                                        </span>
                                        <button
                                          onClick={() =>
                                            handleUpvoteReply(
                                              comment._id,
                                              reply._id
                                            )
                                          }
                                          className="flex items-center space-x-1 group"
                                        >
                                          <Heart
                                            className={`h-3 w-3 ${
                                              hasUserUpvotedReply(reply._id)
                                                ? "fill-red-500 text-red-500"
                                                : "text-gray-400 group-hover:text-red-500"
                                            } transition-colors`}
                                          />
                                          <span
                                            className={`${
                                              hasUserUpvotedReply(reply._id)
                                                ? "text-red-500"
                                                : "text-gray-500"
                                            } group-hover:text-red-500`}
                                          >
                                            {reply.upVoteReply || 0}
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Interaction Bar */}
              <div className="border-t p-4 bg-white/95 backdrop-blur-sm">
                <div className="flex justify-between mb-3">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-100 transition-all"
                    >
                      <ArrowBigUp className="h-5 w-5 mr-1 hover:text-red-500 transition-colors" />
                      <span className="font-bold">{post.upVote || 0}</span>
                      <ArrowBigDown className="h-5 w-5 ml-1 hover:text-red-500 transition-colors" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-100 transition-all"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span>{comments.length}</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comment Input */}
              <div className="border-t p-3 bg-white">
                <form
                  onSubmit={handlePostComment}
                  className="flex items-center bg-gray-50 rounded-full px-4 py-2 shadow-sm"
                >
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-blue-500 font-semibold hover:text-blue-600 hover:bg-transparent"
                    disabled={loading || !newComment.trim()}
                  >
                    Post
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default CommentModal;
