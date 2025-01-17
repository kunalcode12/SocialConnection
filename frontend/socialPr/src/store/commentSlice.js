import { createSlice } from "@reduxjs/toolkit";

const initialCommentState = {
  comments: [],
  loading: false,
  isError: false,
  success: false,
  errorMessage: "",
  successMessage: "",
  upvoteLoading: false,
  userVotes: {
    commentVotes: [],
    replyVotes: [],
  },
};

export const commentSlice = createSlice({
  name: "Comments",
  initialState: initialCommentState,
  reducers: {
    setComments: (state, action) => {
      state.comments = action.payload.map((comment) => ({
        ...comment,
        userId: {
          _id: comment.userId._id,
          name: comment.userId.name,
          email: comment.userId.email,
        },
        replies: comment.replies.map((reply) => ({
          ...reply,
          userId: {
            _id: reply.userId._id,
            name: reply.userId.name,
            email: reply.userId.email,
            id: reply.userId.id,
          },
        })),
      }));
    },

    setUserVotes: (state, action) => {
      state.userVotes = {
        commentVotes: action.payload.commentVotes.map((vote) => ({
          commentId: vote.commentId._id,
          voteType: vote.voteType,
          userId: vote.userId,
        })),
        replyVotes: action.payload.replyVotes.map((vote) => ({
          replyId: vote.replyId,
          voteType: vote.voteType,
          userId: vote.userId,
        })),
      };
    },

    addComment: (state, action) => {
      state.comments.push({
        ...action.payload,
        replies: [],
        upVote: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      });
    },

    removeComment: (state, action) => {
      state.comments = state.comments.filter(
        (comment) => comment._id !== action.payload
      );

      // Remove associated votes when comment is deleted
      state.userVotes.commentVotes = state.userVotes.commentVotes.filter(
        (vote) => vote.commentId !== action.payload
      );
    },
    addReply: (state, action) => {
      const { commentId, reply } = action.payload;
      const comment = state.comments.find((c) => c._id === commentId);
      if (comment) {
        // Initialize replies array if it doesn't exist
        if (!comment.replies) comment.replies = [];

        // Check if this reply ID already exists
        const replyExists = comment.replies.some((r) => r._id === reply._id);

        // Only add the reply if it doesn't already exist
        if (!replyExists) {
          comment.replies.push({
            _id: reply._id,
            commentId: reply.commentId,
            reply: reply.reply,
            upVoteReply: reply.upVoteReply || 0,
            createdAt: reply.createdAt,
            id: reply._id,
            userId: {
              _id: reply.userId._id,
              name: reply.userId.name,
              email: reply.userId.email,
              id: reply.userId.id,
            },
          });
        }
      }
    },

    removeReply: (state, action) => {
      const { commentId, replyId } = action.payload;
      const comment = state.comments.find((c) => c._id === commentId);
      if (comment && comment.replies) {
        comment.replies = comment.replies.filter(
          (reply) => reply._id !== replyId
        );

        // Remove associated votes when reply is deleted
        state.userVotes.replyVotes = state.userVotes.replyVotes.filter(
          (vote) => vote.replyId !== replyId
        );
      }
    },

    updateCommentVote: (state, action) => {
      const { commentId, voteType, userId } = action.payload;
      const comment = state.comments.find((c) => c._id === commentId);

      if (comment) {
        // Update vote count
        if (action.payload.message === "upvote removed successfull") {
          comment.upVote = Math.max(0, (comment.upVote || 0) - 1);
          // Remove vote from userVotes
          state.userVotes.commentVotes = state.userVotes.commentVotes.filter(
            (vote) => vote.commentId !== commentId
          );
        } else {
          comment.upVote = (comment.upVote || 0) + 1;
          // Add or update vote in userVotes
          const existingVoteIndex = state.userVotes.commentVotes.findIndex(
            (vote) => vote.commentId === commentId
          );

          if (existingVoteIndex >= 0) {
            state.userVotes.commentVotes[existingVoteIndex] = {
              commentId,
              voteType,
              userId,
            };
          } else {
            state.userVotes.commentVotes.push({
              commentId,
              voteType,
              userId,
            });
          }
        }
      }
    },

    updateReplyVote: (state, action) => {
      const { commentId, replyId, voteType, userId } = action.payload;
      const comment = state.comments.find((c) => c._id === commentId);

      if (comment) {
        const reply = comment.replies.find((r) => r._id === replyId);
        if (reply) {
          // Update vote count
          if (action.payload.message === "upvote removed successfully") {
            reply.upVoteReply = Math.max(0, (reply.upVoteReply || 0) - 1);
            // Remove vote from userVotes
            state.userVotes.replyVotes = state.userVotes.replyVotes.filter(
              (vote) => vote.replyId !== replyId
            );
          } else {
            reply.upVoteReply = (reply.upVoteReply || 0) + 1;
            // Add or update vote in userVotes
            const existingVoteIndex = state.userVotes.replyVotes.findIndex(
              (vote) => vote.replyId === replyId
            );

            if (existingVoteIndex >= 0) {
              state.userVotes.replyVotes[existingVoteIndex] = {
                replyId,
                voteType,
                userId,
              };
            } else {
              state.userVotes.replyVotes.push({
                replyId,
                voteType,
                userId,
              });
            }
          }
        }
      }
    },

    setUpvoteLoading: (state, action) => {
      state.upvoteLoading = action.payload;
    },

    setSuccess: (state, action) => {
      state.success = true;
      state.successMessage = action.payload;
      state.isError = false;
      state.errorMessage = "";
    },
    setError: (state, action) => {
      state.isError = true;
      state.errorMessage = action.payload;
      state.success = false;
      state.successMessage = "";
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    resetStatus: (state) => {
      state.success = false;
      state.isError = false;
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
});

export const {
  setComments,
  addComment,
  removeComment,
  addReply,
  removeReply,
  setError,
  setLoading,
  setSuccess,
  resetStatus,
  updateCommentVote,
  updateReplyVote,
  setUpvoteLoading,
  setUserVotes,
} = commentSlice.actions;

// Get all comments
export const getComments = (postId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/comment/getComments/${postId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch comments");
    }
    dispatch(setComments(data.data.data));
    dispatch(setSuccess("Comments fetched successfully"));
    dispatch(setLoading(false));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Create a new comment
export const createComment = (postId, content) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/comment/${postId}/createComment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: content }),
      }
    );
    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to create comment");
    }

    dispatch(addComment(data.data.data));
    dispatch(setSuccess("Comment created successfully"));
    dispatch(setLoading(false));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Delete a comment
export const deleteComment = (commentId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/comment/getComment/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete comment");
    }
    console.log(data);

    dispatch(removeComment(commentId));
    dispatch(setSuccess("Comment deleted successfully"));
    dispatch(setLoading(false));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Reply to a comment
export const replyToComment = (commentId, content) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/comment/reply/${commentId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reply: content }),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to reply to comment");
    }

    const updatedComment = data.data.reply;

    const newReply = updatedComment.replies[updatedComment.replies.length - 1];
    console.log(newReply);

    dispatch(
      addReply({
        commentId: updatedComment._id,
        reply: newReply,
      })
    );

    dispatch(setSuccess("Reply added successfully"));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteReply = (commentId, replyId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/comment/${commentId}/reply/${replyId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete reply");
    }

    dispatch(removeReply({ commentId, replyId }));
    dispatch(setSuccess("Reply deleted successfully"));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const upvoteComment = (commentId) => async (dispatch) => {
  try {
    dispatch(setUpvoteLoading(true));
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/votes/commentVote/${commentId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType: "upvote" }),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to upvote comment");
    }

    dispatch(
      updateCommentVote({
        commentId,
        userId: data.data.data.userId,
        message: data.data.message,
        voteType: data.data.data.voteType,
      })
    );

    dispatch(setSuccess(data.data.message));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setUpvoteLoading(false));
  }
};

export const getUserVotes = (userId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/votes/userCommentVotes/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user votes");
    }

    dispatch(setUserVotes(data.data));
    dispatch(setLoading(false));
    dispatch(setSuccess(true));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
    dispatch(setLoading(false));
  }
};

export const upvoteReply = (commentId, replyId) => async (dispatch) => {
  try {
    dispatch(setUpvoteLoading(true));
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/votes/comments/${commentId}/replies/${replyId}/vote`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType: "upvote" }),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to upvote reply");
    }

    dispatch(
      updateReplyVote({
        commentId,
        replyId,
        userId: data.data.data.userId,
        message: data.data.message,
        voteType: data.data.data.voteType,
      })
    );

    dispatch(setSuccess(data.data.message));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setUpvoteLoading(false));
  }
};

export default commentSlice.reducer;
