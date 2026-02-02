import React from 'react';
import renderer, { act } from 'react-test-renderer';
import Header from '../../src/components/Header';

describe('Header component', () => {
  it('renders title and subtitle and triggers back/menu handlers', () => {
    const onBack = jest.fn();
    const onMenu = jest.fn();

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Header
          title="Main"
          subtitle="Sub"
          showBackButton
          showMenuButton
          onBackPress={onBack}
          onMenuPress={onMenu}
        />,
      );
    });

    const root = (tree as renderer.ReactTestRenderer).root;
    expect(root.findByProps({ children: 'Main' })).toBeTruthy();
    expect(root.findByProps({ children: 'Sub' })).toBeTruthy();

    const pressable = root.findAll(node => typeof node.props?.onPress === 'function')[0];
    act(() => pressable.props.onPress());
    expect(onBack).toHaveBeenCalled();
  });
});
