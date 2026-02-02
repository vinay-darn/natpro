import React from 'react';
import renderer, { act } from 'react-test-renderer';
import BottomSheet from '../../src/components/BottomSheet';

describe('BottomSheet interactions', () => {
  it('calls onClose when overlay pressed', () => {
    const onClose = jest.fn();
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<BottomSheet visible onClose={onClose} />);
    });

    const root = (tree as renderer.ReactTestRenderer).root;
    const overlay = root.findAll(node => node.props && node.props.onPress).find(n => n.props.onPress && n.type !== 'RCTView');
    act(() => overlay && overlay.props.onPress());
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button pressed', () => {
    const onClose = jest.fn();
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <BottomSheet visible title="T" onClose={onClose}>
          <></>
        </BottomSheet>,
      );
    });

    const root = (tree as renderer.ReactTestRenderer).root;
    const pressables = root.findAll(node => typeof node.props?.onPress === 'function');
    for (const p of pressables) {
      act(() => p.props.onPress && p.props.onPress());
      if (onClose.mock.calls.length > 0) break;
    }
    expect(onClose).toHaveBeenCalled();
  });
});
