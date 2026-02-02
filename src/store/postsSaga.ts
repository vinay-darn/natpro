import { call, put, takeLatest, all } from 'redux-saga/effects';
import {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  refreshPostsStart,
  refreshPostsSuccess,
  refreshPostsFailure,
  fetchPostSuccess,
  fetchPostFailure,
  Post,
} from './postsSlice';

// API service functions
export const postsAPI = {
  fetchAllPosts: async (): Promise<Post[]> => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  fetchPostById: async (id: number): Promise<Post> => {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
};

// Saga workers
function* fetchPostsSaga(): Generator<any, void, unknown> {
  try {
    const posts = yield call(postsAPI.fetchAllPosts);
    yield put(fetchPostsSuccess(posts as Post[]));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch posts';
    yield put(fetchPostsFailure(errorMessage));
  }
}

function* refreshPostsSaga(): Generator<any, void, unknown> {
  try {
    const posts = yield call(postsAPI.fetchAllPosts);
    yield put(refreshPostsSuccess(posts as Post[]));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to refresh posts';
    yield put(refreshPostsFailure(errorMessage));
  }
}

function* fetchPostSaga(action: any): Generator<any, void, unknown> {
  try {
    const { postId } = action.payload;
    const post = yield call(postsAPI.fetchPostById, postId);
    yield put(fetchPostSuccess(post as Post));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch post';
    yield put(fetchPostFailure(errorMessage));
  }
}

// Saga watchers
function* watchFetchPosts() {
  yield takeLatest(fetchPostsStart.type, fetchPostsSaga);
}

function* watchRefreshPosts() {
  yield takeLatest(refreshPostsStart.type, refreshPostsSaga);
}

function* watchFetchPost() {
  yield takeLatest('posts/fetchPostById', fetchPostSaga);
}

// Root saga for posts
export function* postsSaga() {
  yield all([
    watchFetchPosts(),
    watchRefreshPosts(),
    watchFetchPost(),
  ]);
}

// Action creator for fetching a single post
export const fetchPostById = (postId: number) => ({
  type: 'posts/fetchPostById',
  payload: { postId },
});

export default postsSaga;
