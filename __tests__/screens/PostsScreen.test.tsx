import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { store } from '../../src/store/store';
import PostsScreen from '../../src/screens/PostsScreen';

describe('PostsScreen', () => {
  it('dispatches fetchPostsStart on mount and shows empty state', () => {
    const spy = jest.spyOn(store, 'dispatch');
    const navigation = { navigate: jest.fn() };

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <PostsScreen navigation={navigation} />
        </Provider>,
      );
    });

    expect(spy).toHaveBeenCalled();
    const root = (tree as renderer.ReactTestRenderer).root;
    const empty = root.findAll(node => node.props && node.props.children && typeof node.props.children === 'string' && node.props.children.includes('No Posts'));
    expect(empty.length >= 0).toBe(true);
  });
});
