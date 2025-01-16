import React, { useState } from "react";
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
  Share2,
  Award,
  Bookmark,
  Heart,
  MessageCircle,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";

const CommentModal = ({ isOpen, onClose, userName, post }) => {
  const [replyStates, setReplyStates] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const { comments, loading, isError, success, errorMessage, successMessage } =
    useSelector((state) => state.comments);

  const handleShowReplyInput = (commentId) => {
    setReplyStates((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReplyTextChange = (commentId, text) => {
    setReplyTexts((prev) => ({
      ...prev,
      [commentId]: text,
    }));
  };

  const handleAddReply = (e, commentId) => {
    e.preventDefault();
    // Add reply logic here
    setReplyTexts((prev) => ({
      ...prev,
      [commentId]: "",
    }));
    setReplyStates((prev) => ({
      ...prev,
      [commentId]: false,
    }));
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-5xl z-50 bg-transparent border-none shadow-none p-0 gap-0 outline-none">
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
                        className="flex items-start space-x-3 group"
                      >
                        <Avatar className="w-8 h-8 ring-1 ring-blue-100">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            {comment.userId?.name?.[0]?.toUpperCase() || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-2xl px-4 py-2 shadow-sm">
                            <p className="mb-1">
                              <span className="font-bold text-gray-900 mr-2">
                                {comment.userId?.name}
                              </span>
                              <span className="text-gray-800">
                                {comment.comment}
                              </span>
                            </p>
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
                            <span>{comment.upVote} likes</span>
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
                                      <div className="bg-gray-50 rounded-2xl px-3 py-2 shadow-sm">
                                        <p className="mb-1">
                                          <span className="font-bold text-gray-900 mr-2 text-sm">
                                            {reply.userId?.name}
                                          </span>
                                          <span className="text-gray-800 text-sm">
                                            {reply.reply}
                                          </span>
                                        </p>
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
                                        <span>{reply.upVoteReply} likes</span>
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
                <form className="flex items-center bg-gray-50 rounded-full px-4 py-2 shadow-sm">
                  <input
                    type="text"
                    placeholder="Add a comment..."
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
