import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/axios";
import type { AuthResponse, Credentials, RegisterPayload, User } from "../../types/types";

const loadUser = (): User | null => {
  try {
    const stored = localStorage.getItem("user");

    
        if (!stored) return null;

    return JSON.parse(stored);
  } catch {


    return null;
  }
};

const saveUser = (user: User | null) => {

  if (user) localStorage.setItem("user", JSON.stringify(user));

  else {

    localStorage.removeItem("user");
  }
};

const loadToken = (): string | null => localStorage.getItem("token");

const saveToken = (token: string | null) => {

   if (token) localStorage.setItem("token", token);

   
  else localStorage.removeItem("token");
};

export interface AuthState {
  user: User | null;          
  users: User[];             
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: loadUser(),
  users: [],                
  token: loadToken(),
  status: "idle",
  error: null,
};

//get all users
export const getUsers = createAsyncThunk<User[]>(
  "auth/getUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<User[]>("/auth/users");
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

// register user
export const register = createAsyncThunk<
  AuthResponse,
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

export const login = createAsyncThunk<
  AuthResponse,
  Credentials,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      saveUser(null);
      saveToken(null);
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: AuthState) => {
      state.status = "loading";
      state.error = null;
    };

    const handleFulfilled = (
      state: AuthState,
      action: PayloadAction<AuthResponse>
    ) => {
      state.status = "succeeded";

      const token = action.payload.token ?? loadToken();
      const loggedUser = action.payload.user ?? loadUser();

      state.user = loggedUser as User;
      state.token = token;

      saveUser(loggedUser as User);
      if (token) saveToken(token);
    };

    const handleRejected = (
      state: AuthState,
      action: PayloadAction<string | undefined>
    ) => {
      state.status = "failed";
      state.error = action.payload || "Something went wrong";
    };

    builder
     
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, handleFulfilled)
      .addCase(register.rejected, handleRejected)

      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleFulfilled)
      .addCase(login.rejected, handleRejected)

    
      .addCase(getUsers.pending, (state: AuthState) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.status = "succeeded";
        state.users = action.payload;   // ✅ store list of users
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || action.error?.message || null;
      });
  },
});


export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUsers = (state: { auth: AuthState }) => state.auth.users;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export const { logout } = authSlice.actions;
export default authSlice.reducer;