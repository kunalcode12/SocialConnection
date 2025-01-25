import { createSlice } from "@reduxjs/toolkit";

const initialAuthState = {
  isAuthenticated: false,
  user: null,
  profileUser: null,
  token: null,
  loading: false,
  error: null,
  initialized: false,
};

export const authSlice = createSlice({
  name: "authentication",
  initialState: initialAuthState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    setProfileUser: (state, action) => {
      state.profileUser = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("token");
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state, action) => {
      state.initialized = action.payload;
    },
    // initializeAuth: (state) => {
    //   const token = localStorage.getItem("token");
    //   if (token) {
    //     state.isAuthenticated = true;
    //     state.token = token;
    //     state.loading = true;

    //     // Note: We don't have user data here, so we'll need to fetch it
    //   }
    // },
  },
});

export const {
  setCredentials,
  logout,
  setLoading,
  setError,
  clearError,
  //initializeAuth,
  setInitialized,
  setProfileUser,
} = authSlice.actions;

export default authSlice.reducer;

export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch("http://127.0.0.1:3000/api/v1/users/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Login failed");

    if (!data?.data?.user?.active) {
      throw new Error("Account is inactive");
    }

    const mainUser = {
      user: data.data.user,
      token: data.token,
    };

    //console.log(`Login one:`, data);

    localStorage.setItem("token", data.token);
    dispatch(setCredentials(mainUser));
    dispatch(setLoading(false));
  } catch (error) {
    console.log("some error");
    dispatch(setError(error.message));
  }
};

export const signup = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Signup failed");

    localStorage.setItem("token", data.token);
    dispatch(setCredentials(data));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const initializeAuthAsync = () => async (dispatch, getState) => {
  const { initialized, token } = getState().auth;

  if (initialized) return;

  dispatch(setInitialized(true));

  if (!token) {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      dispatch(logout());
      return;
    }
  }

  try {
    dispatch(setLoading(true));
    const response = await fetch("http://127.0.0.1:3000/api/v1/users/me", {
      headers: {
        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
      },
    });
    const userData = await response.json();

    if (!response.ok)
      throw new Error(userData.message || "Failed to fetch user data");

    //console.log(`Initialize (/me) one :`, userData.data.data.active);

    if (!userData?.data?.data?.active) {
      throw new Error("Account is inactive");
    }

    dispatch(
      setCredentials({
        user: userData.data.data,
        token: token || localStorage.getItem("token"),
      })
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
    dispatch(logout());
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchUserData = (userId, token) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const userData = await response.json();

    if (!response.ok)
      throw new Error(userData.message || "Failed to fetch user data");

    if (!userData?.data?.data?.active) {
      throw new Error("Account is inactive");
    }
    //console.log(`fetchUserdata one :`, userData.data.data.active);

    dispatch(setProfileUser(userData.data.data));
    dispatch(setLoading(false));
  } catch (error) {
    console.log("some error23");
    dispatch(logout());
    dispatch(setError(error.message));
  }
};
