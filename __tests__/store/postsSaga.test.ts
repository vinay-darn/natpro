import { fetchPostById } from '../../src/store/postsSaga';

describe('postsSaga actions', () => {
  it('fetchPostById action creator returns correct shape', () => {
    const action = fetchPostById(42);
    expect(action).toEqual({ type: 'posts/fetchPostById', payload: { postId: 42 } });
  });
});
