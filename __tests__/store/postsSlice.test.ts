import reducer, {
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
  PostsState,
  Post,
} from '../../src/store/postsSlice';

describe('postsSlice', () => {
  const initialState: PostsState = {
    posts: [],
    currentPost: null,
    isLoading: false,
    isRefreshing: false,
    error: null,
    currentPage: 1,
    hasMore: true,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' } as any)).toEqual(initialState);
  });

  it('should handle fetchPostsStart and success', () => {
    const s1 = reducer(initialState, fetchPostsStart());
    expect(s1.isLoading).toBe(true);

    const posts: Post[] = [{ id: 1, userId: 1, title: 't', body: 'b' }];
    const s2 = reducer(s1, fetchPostsSuccess(posts));
    expect(s2.isLoading).toBe(false);
    expect(s2.posts).toEqual(posts);
  });

  it('should handle fetchPostsFailure and refresh flows', () => {
    const s = reducer(initialState, fetchPostsFailure('fail'));
    expect(s.isLoading).toBe(false);
    expect(s.error).toBe('fail');

    const r1 = reducer(initialState, refreshPostsStart());
    expect(r1.isRefreshing).toBe(true);

    const posts: Post[] = [{ id: 2, userId: 2, title: 'x', body: 'y' }];
    const r2 = reducer(r1, refreshPostsSuccess(posts));
    expect(r2.isRefreshing).toBe(false);
    expect(r2.posts).toEqual(posts);

    const r3 = reducer(r2, refreshPostsFailure('rfail'));
    expect(r3.isRefreshing).toBe(false);
    expect(r3.error).toBe('rfail');
  });

  it('should handle single post fetch and clearing', () => {
    const s1 = reducer(initialState, fetchPostStart());
    expect(s1.isLoading).toBe(true);
    expect(s1.currentPost).toBeNull();

    const post: Post = { id: 3, userId: 3, title: 'a', body: 'b' };
    const s2 = reducer(s1, fetchPostSuccess(post));
    expect(s2.isLoading).toBe(false);
    expect(s2.currentPost).toEqual(post);

    const s3 = reducer(s2, fetchPostFailure('pfail'));
    expect(s3.isLoading).toBe(false);
    expect(s3.error).toBe('pfail');
    expect(s3.currentPost).toBeNull();

    const s4 = reducer(s3, clearCurrentPost());
    expect(s4.currentPost).toBeNull();

    const s5 = reducer(s4, clearError());
    expect(s5.error).toBeNull();
  });
});
