import React from 'react';
import renderer, { act } from 'react-test-renderer';
import SidebarDrawer from '../../src/components/SidebarDrawer';
import { store } from '../../src/store/store';
import { Provider } from 'react-redux';

describe('SidebarDrawer', () => {
  it('renders and dispatches logout when logout pressed', () => {
    const onClose = jest.fn();
    const navigation = { navigate: jest.fn() };

    const spy = jest.spyOn(store, 'dispatch');

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <SidebarDrawer isVisible onClose={onClose} navigation={navigation} />
        </Provider>,
      );
    });

    const root = (tree as renderer.ReactTestRenderer).root;
    const buttons = root.findAll(node => typeof node.props?.onPress === 'function');
    const logoutBtn = buttons[buttons.length - 1];
    act(() => logoutBtn.props.onPress());

    expect(spy).toHaveBeenCalled();
  });
});
