import { createSlice } from "@reduxjs/toolkit";

const initialCommentState = {
  comments: [],
  loading: false,
  isError: false,
  success: false,
  errorMessage: "",
  successMessage: "",
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
      }
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
    console.log(data.data.data);
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

export default commentSlice.reducer;
