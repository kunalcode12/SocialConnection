import { createSlice } from "@reduxjs/toolkit";

const initialPostState = {
  posts: [],
  recentPost: [],
  upvotedContent: [],
  upvotingLoading: false,
  upvotingError: false,
  upvotingSuccess: false,
  bookMarkedPost: null,
  loading: false,
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
        (post) => post.content.id !== action.payload
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
      const post = state.posts.find((p) => p._id === postId);

      if (post) {
        const isUpvoted = state.upvotedContent.includes(postId);

        if (isUpvoted) {
          state.upvotedContent = state.upvotedContent.filter(
            (id) => id !== postId
          );

          post.upVote = Math.max(0, post.upVote - 1);
        } else {
          state.upvotedContent.push(postId);

          post.upVote += 1;
        }
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

    setError: (state, action) => {
      state.error = action.payload;
    },
    setIsError: (state, action) => {
      state.error = action.payload;
    },

    setPosts: (state, action) => {
      state.posts = action.payload;
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
} = postSlice.actions;
export default postSlice.reducer;

export const getAllContentApi = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch("http://127.0.0.1:3000/api/v1/content", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok)
      throw new Error(data.message || "Failed to fetch content");

    dispatch(setPosts(data.data.data));
    dispatch(setLoading(false));
    dispatch(setError(false));
    dispatch(setSuccess(true));
    return data;
  } catch (error) {
    console.log("Error fetching content:", error);
    dispatch(setError(true));
    dispatch(setSuccess(false));
    dispatch(setError(error.message));
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
    dispatch(setSuccess(true));
    return data;
  } catch (error) {
    console.log("some error");
    dispatch(setError(true));
    dispatch(setSuccess(false));
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
