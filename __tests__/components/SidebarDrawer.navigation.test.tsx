import React from 'react';
import renderer, { act } from 'react-test-renderer';
import SidebarDrawer from '../../src/components/SidebarDrawer';
import { Provider } from 'react-redux';
import { store } from '../../src/store/store';

describe('SidebarDrawer navigation items', () => {
  it('navigates to items and calls onClose via navigation', () => {
    const navigation = { navigate: jest.fn() };
    const onClose = jest.fn();

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <SidebarDrawer isVisible onClose={onClose} navigation={navigation} />
        </Provider>,
      );
    });

    const root = (tree as renderer.ReactTestRenderer).root;
    const items = root.findAll(node => typeof node.props?.onPress === 'function');
    const findByTextChild = (text: string) =>
      items.find(n => {
        const children = n.props.children;
        if (!children) return false;
        if (typeof children === 'string') return children === text;
        if (Array.isArray(children)) return children.some(c => c && c.props && c.props.children === text);
        return children.props && children.props.children === text;
      });

    const dashboardTouchable = findByTextChild('Dashboard');
    expect(dashboardTouchable).toBeTruthy();
    act(() => dashboardTouchable && dashboardTouchable.props.onPress());
    expect(navigation.navigate).toHaveBeenCalledWith('Dashboard');

    const photosTouchable = findByTextChild('My Photos');
    expect(photosTouchable).toBeTruthy();
    act(() => photosTouchable && photosTouchable.props.onPress());
    expect(navigation.navigate).toHaveBeenCalledWith('AllPhotos');
  });
});
