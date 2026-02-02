import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
}

const initialState: PostsState = {
  posts: [],
  currentPost: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  currentPage: 1,
  hasMore: true,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Fetch posts actions
    fetchPostsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPostsSuccess: (state, action: PayloadAction<Post[]>) => {
      state.isLoading = false;
      state.posts = action.payload;
      state.error = null;
    },
    fetchPostsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Refresh posts actions
    refreshPostsStart: (state) => {
      state.isRefreshing = true;
      state.error = null;
    },
    refreshPostsSuccess: (state, action: PayloadAction<Post[]>) => {
      state.isRefreshing = false;
      state.posts = action.payload;
      state.error = null;
    },
    refreshPostsFailure: (state, action: PayloadAction<string>) => {
      state.isRefreshing = false;
      state.error = action.payload;
    },
    
    // Fetch single post actions
    fetchPostStart: (state) => {
      state.isLoading = true;
      state.error = null;
      state.currentPost = null;
    },
    fetchPostSuccess: (state, action: PayloadAction<Post>) => {
      state.isLoading = false;
      state.currentPost = action.payload;
      state.error = null;
    },
    fetchPostFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.currentPost = null;
    },
    
    // Clear current post
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  refreshPostsStart,
  refreshPostsSuccess,
  refreshPostsFailure,
  fetchPostStart,
  fetchPostSuccess,
  fetchPostFailure,
  clearCurrentPost,
  clearError,
} = postsSlice.actions;

export default postsSlice.reducer;
