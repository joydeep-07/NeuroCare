import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  _id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  [key: string]: any;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}

const authData = localStorage.getItem("auth");

const initialState: AuthState = authData
  ? JSON.parse(authData)
  : {
      isAuthenticated: false,
      token: null,
      user: null,
    };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        token: string;
        user: User;
      }>,
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;

      localStorage.setItem(
        "auth",
        JSON.stringify({
          isAuthenticated: true,
          token: action.payload.token,
          user: action.payload.user,
        }),
      );
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;

      localStorage.removeItem("auth");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("email");
      localStorage.removeItem("isLoggedIn");
    },

    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;

      localStorage.setItem(
        "auth",
        JSON.stringify({
          isAuthenticated: state.isAuthenticated,
          token: state.token,
          user: action.payload,
        }),
      );

      localStorage.setItem("user", JSON.stringify(action.payload));
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;
