import React from 'react';
import renderer, { act } from 'react-test-renderer';
import BottomSheet from '../../src/components/BottomSheet';

describe('BottomSheet', () => {
  it('renders children and title', () => {
    const onClose = jest.fn();
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <BottomSheet visible title="MyTitle" onClose={onClose}>
          <TextPlaceholder />
        </BottomSheet>,
      );
    });

    const root = (tree as renderer.ReactTestRenderer).root;
    const found = root.findAll(node => node.props && node.props.children === 'MyTitle');
    expect(found.length).toBeGreaterThan(0);
  });
});

const TextPlaceholder = () => null;
