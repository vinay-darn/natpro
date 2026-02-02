import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ImagePicker from '../../src/components/ImagePicker';

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

describe('ImagePicker', () => {
  it('calls onImageSelected when gallery returns an asset', () => {
    const onImageSelected = jest.fn();
    const onClose = jest.fn();
    const { launchImageLibrary } = require('react-native-image-picker');

    (launchImageLibrary as jest.Mock).mockImplementation((_opts, cb) => {
      cb({ assets: [{ uri: 'file://img.jpg' }] });
    });

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ImagePicker onImageSelected={onImageSelected} onClose={onClose} />,
      );
    });

    const root = (tree as renderer.ReactTestRenderer).root;
    const touchables = root.findAll(node => typeof node.props?.onPress === 'function');
    act(() => {
      touchables[0].props.onPress();
    });

    expect(onImageSelected).toHaveBeenCalledWith('file://img.jpg');
    expect(onClose).toHaveBeenCalled();
  });
});
