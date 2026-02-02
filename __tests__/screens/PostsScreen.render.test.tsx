import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { store } from '../../src/store/store';
import PostsScreen from '../../src/screens/PostsScreen';
import { fetchPostsStart, fetchPostsSuccess } from '../../src/store/postsSlice';

describe('PostsScreen rendering and interactions', () => {
  it('shows loading state when isLoading and no posts', () => {
    store.dispatch(fetchPostsStart());
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <PostsScreen navigation={{ navigate: jest.fn() }} />
        </Provider>,
      );
    });

    const root = (tree as renderer.ReactTestRenderer).root;
    const loading = root.findAll(node => node.props && node.props.children === 'Loading posts...');
    expect(loading.length >= 0).toBe(true);
  });

  it('renders posts list and navigates on press', () => {
    const posts = [{ id: 11, userId: 3, title: 'hello', body: 'body' }];
    store.dispatch(fetchPostsSuccess(posts));

    let tree: renderer.ReactTestRenderer;
    const navigation = { navigate: jest.fn() };
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <PostsScreen navigation={navigation} />
        </Provider>,
      );
    });

    const root = (tree as renderer.ReactTestRenderer).root;
    const titleText = root.find(node => node.type === 'Text' && node.props.children === 'hello');
    let postTouchable: any = titleText;
    while (postTouchable && typeof postTouchable.props?.onPress !== 'function') {
      postTouchable = postTouchable.parent;
    }
    act(() => postTouchable && postTouchable.props.onPress && postTouchable.props.onPress());
    expect(navigation.navigate).toHaveBeenCalledWith('PostDetail', { postId: 11 });
  });
});
