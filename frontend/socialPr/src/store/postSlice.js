import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

const initialPostState = {
  posts: [],
  recentPost: [],
  upvotedContent: [],
  totalPages: 1,
  errorMessage: "",
  upvotingLoading: false,
  upvotingError: false,
  upvotingSuccess: false,
  bookMarkedPost: null,
  loading: false,
  postDeleteSuccess: false,
  updatePostLoading: false,
  updatePostError: false,
  updatePostSuccess: false,
  savingSuccess: false,
  savingError: false,
  error: null,
  isError: false,
  success: false,
};

export const postSlice = createSlice({
  name: "post",
  initialState: initialPostState,
  reducers: {
    addPost: (state, action) => {
      state.posts.push(action.payload);
    },
    setRecentPost: (state, action) => {
      state.recentPost = action.payload;
    },
    setBookMarkedPost: (state, action) => {
      state.bookMarkedPost = action.payload;
    },
    deleteBookMark: (state, action) => {
      state.bookMarkedPost = state.bookMarkedPost.filter(
        (post) => post.id !== action.payload
      );
      console.log(action, state.bookMarkedPost);
    },

    updatePost: (state, action) => {
      const index = state.posts.findIndex(
        (post) => post.id === action.payload.id
      );
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...action.payload };
      }
    },

    deletePost: (state, action) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload);
    },
    setUpvotedContent: (state, action) => {
      state.upvotedContent = action.payload;
    },
    setUpvotingLoading: (state, action) => {
      state.upvotingLoading = action.payload;
    },
    setUpvotingError: (state, action) => {
      state.upvotingError = action.payload;
    },
    setUpvotingSuccess: (state, action) => {
      state.upvotingSuccess = action.payload;
    },

    updatePostUpvote: (state, action) => {
      const postId = action.payload;
      const isUpvoted = state.upvotedContent.includes(postId);

      if (isUpvoted) {
        state.upvotedContent = state.upvotedContent.filter(
          (id) => id !== postId
        );
      } else {
        state.upvotedContent.push(postId);
      }

      const updateVoteCount = (post) => {
        if (post) {
          if (isUpvoted) {
            post.upVote = Math.max(0, post.upVote - 1);
          } else {
            post.upVote += 1;
          }
        }
      };

      const mainPost = state.posts.find((p) => p._id === postId);
      const recentPost = state.recentPost.find((p) => p._id === postId);

      updateVoteCount(mainPost);
      updateVoteCount(recentPost);
    },

    incrementCommentCount: (state, action) => {
      const postId = action.payload;

      // Handle main posts array
      const post = state.posts.find((post) => post._id === postId);
      if (post) {
        post.commentCount = (post.commentCount || 0) + 1;
      }

      // Handle recent posts array
      const recentPost = state.recentPost.find((post) => post._id === postId);
      if (recentPost) {
        recentPost.commentCount = (recentPost.commentCount || 0) + 1;
      }
    },

    decrementCommentCount: (state, action) => {
      const postId = action.payload;

      // Handle main posts array
      const post = state.posts.find((post) => post._id === postId);
      if (post) {
        post.commentCount = Math.max((post.commentCount || 0) - 1, 0);
      }

      // Handle recent posts array
      const recentPost = state.recentPost.find((post) => post._id === postId);
      if (recentPost) {
        recentPost.commentCount = Math.max(
          (recentPost.commentCount || 0) - 1,
          0
        );
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSavingSuccess: (state, action) => {
      state.savingSuccess = action.payload;
    },
    setSavingError: (state, action) => {
      state.savingError = action.payload;
    },
    setUpdatePostLoading: (state, action) => {
      state.updatePostLoading = action.payload;
    },
    setUpdatePostError: (state, action) => {
      state.updatePostError = action.payload;
    },
    setUpdatePostSuccess: (state, action) => {
      state.updatePostSuccess = action.payload;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
    },
    setPostDeleteSuccess: (state, action) => {
      state.postDeleteSuccess = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
    setIsError: (state, action) => {
      state.error = action.payload;
    },

    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    setTotalPages: (state, action) => {
      state.totalPages = action.payload;
    },
    setErrorMessage: (state, action) => {
      state.errorMessage = action.payload;
    },
    resetStates: (state) => {
      state.upvotingLoading = false;
      state.upvotingError = false;
      state.upvotingSuccess = false;
      state.loading = false;
      state.updatePostLoading = false;
      state.updatePostError = false;
      state.updatePostSuccess = false;
      state.savingSuccess = false;
      state.savingError = false;
      state.error = null;
      state.isError = false;
      state.success = false;
    },
  },
});

export const {
  addPost,
  updatePost,
  deletePost,
  setLoading,
  setError,
  setSuccess,
  setPosts,
  setUpdatePostLoading,
  setUpdatePostError,
  setUpdatePostSuccess,
  setRecentPost,
  setIsError,
  setSavingError,
  setSavingSuccess,
  setBookMarkedPost,
  deleteBookMark,
  setUpvotedContent,
  setUpvotingLoading,
  setUpvotingError,
  setUpvotingSuccess,
  updatePostUpvote,
  incrementCommentCount,
  decrementCommentCount,
  resetStates,
  setTotalPages,
  setErrorMessage,
  setPostDeleteSuccess,
} = postSlice.actions;
export default postSlice.reducer;

export const getAllContentApi =
  (page = 1, options = {}) =>
  async (dispatch) => {
    try {
      const { limit = 10, pathname = "/", categories = null } = options;

      // Determine sort parameter based on pathname
      let sortParam = "";
      switch (pathname) {
        case "/popular":
          sortParam = "-upVote";
          break;
        case "/newest":
          sortParam = "-createdAt";
          break;
        default:
          sortParam = ""; // Default sorting
      }

      // Construct query parameters
      const queryParams = new URLSearchParams({
        sort: sortParam,
        limit: limit.toString(),
        page: page.toString(),
      });

      // Add categories if provided
      if (categories) {
        // Convert categories to comma-separated string if it's an array
        const categoriesParam = Array.isArray(categories)
          ? categories.join(",")
          : categories;

        queryParams.append("categories", categoriesParam);
      }

      // Construct full URL
      const url = `http://127.0.0.1:3000/api/v1/content?${queryParams.toString()}`;

      // Fetch content
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch content");
      }

      dispatch(setPosts(data.data.data));
      dispatch(setTotalPages(data.data.totalPages));
      dispatch(setLoading(false));
      dispatch(setError(false));
      dispatch(setSuccess(true));

      return data;
    } catch (error) {
      console.log("Error fetching content:", error);
      dispatch(setError(true));
      dispatch(setSuccess(false));
      dispatch(setErrorMessage(error.message));
      dispatch(setLoading(false));
      throw error;
    }
  };

export const getUpvotedContentApi = (contentId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/votes/contentVote/${contentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (!response.ok)
      throw new Error(data.message || "Failed to fetch upvoted content");

    dispatch(setUpvotedContent(data.data.content));
    dispatch(setLoading(false));
    dispatch(setError(false));
    dispatch(setSuccess(true));
    return data;
  } catch (error) {
    console.log("Error fetching upvoted content:", error);
    dispatch(setError(true));
    dispatch(setSuccess(false));
    dispatch(setError(error.message));
    dispatch(setLoading(false));
    throw error;
  }
};

export const upvoteContentApi = (contentId) => async (dispatch) => {
  try {
    dispatch(setUpvotingLoading(true));

    const response = await fetch(`http://127.0.0.1:3000/api/v1/votes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ voteType: "upvote", contentId: contentId }),
    });
    const data = await response.json();

    if (!response.ok)
      throw new Error(data.message || "Failed to upvote content");

    console.log(data.data.data);

    dispatch(updatePostUpvote(data.data.data.contentId));
    dispatch(setUpvotingLoading(false));
    dispatch(setUpvotingError(false));
    dispatch(setUpvotingSuccess(true));
    return data;
  } catch (error) {
    console.log("Error upvoting content:", error);
    dispatch(setUpvotingError(true));
    dispatch(setUpvotingSuccess(false));
    dispatch(setError(error.message));
    dispatch(setUpvotingLoading(false));
    throw error;
  }
};

export const deletePostApi = (postID, token) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/content/deleteContent/${postID}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    console.log(data);

    if (!response.ok) throw new Error(data.message || "Login failed");
    dispatch(deletePost(postID));
    dispatch(setLoading(false));
    dispatch(setError(false));
    dispatch(setPostDeleteSuccess(true));
    return data;
  } catch (error) {
    console.log("some error");
    dispatch(setError(true));
    dispatch(setPostDeleteSuccess(false));
    dispatch(setError(error.message));
    throw error;
  }
};

export const updatePostApi =
  (postID, token, updateData) => async (dispatch) => {
    try {
      dispatch(setUpdatePostLoading(true));
      const response = await fetch(
        `http://127.0.0.1:3000/api/v1/content/${postID}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );
      const data = await response.json();
      console.log(data);

      if (!response.ok) throw new Error(data.message || "Login failed");

      dispatch(updatePost({ id: postID, data: updateData }));
      dispatch(setUpdatePostLoading(false));
      dispatch(setUpdatePostError(false));
      dispatch(setUpdatePostSuccess(true));
      return data;
    } catch (error) {
      console.log("some error update");
      dispatch(setUpdatePostError(true));
      dispatch(setUpdatePostSuccess(false));
      dispatch(setError(error.message));
      dispatch(setUpdatePostLoading(false));
      throw error;
    }
  };

export const savePostApi = (postID) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/users/bookmark/${postID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    console.log(data);

    if (!response.ok) throw new Error(data.message || "Login failed");

    dispatch(setLoading(false));
    dispatch(setSavingError(false));
    dispatch(setSavingSuccess(true));
    return data;
  } catch (error) {
    console.log("some error update");
    dispatch(setSavingError(true));
    dispatch(setLoading(false));
    dispatch(setError(error.message));
    dispatch(setSavingSuccess(false));
    throw error;
  }
};

export const unsavedPostApi = (postID) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/users/bookmark/${postID}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    console.log(data);

    if (!response.ok) throw new Error(data.message || "Login failed");

    dispatch(setLoading(false));
    dispatch(deleteBookMark(postID));
    dispatch(setSavingError(false));
    dispatch(setSavingSuccess(true));
    return data;
  } catch (error) {
    console.log("some error update");
    dispatch(setSavingError(true));
    dispatch(setLoading(false));
    dispatch(setError(error.message));
    dispatch(setSavingSuccess(false));
    throw error;
  }
};
