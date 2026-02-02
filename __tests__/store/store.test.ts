import { store } from '../../src/store/store';

describe('store', () => {
  it('should have expected top-level reducers', () => {
    const state = store.getState();
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('posts');
    expect(state).toHaveProperty('location');
  });
});
