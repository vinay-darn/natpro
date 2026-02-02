import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ImagePicker from '../../src/components/ImagePicker';
import { Alert } from 'react-native';

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

describe('ImagePicker camera flow', () => {
  it('invokes camera flow and handles OK press', () => {
    const onImageSelected = jest.fn();
    const onClose = jest.fn();
    const { launchCamera } = require('react-native-image-picker');

    jest.spyOn(Alert, 'alert').mockImplementation((title, msg, buttons) => {
      const ok = buttons && buttons.find(b => b.text === 'OK');
      if (ok && typeof ok.onPress === 'function') ok.onPress();
    });

    (launchCamera as jest.Mock).mockImplementation((_opts, cb) => cb({ assets: [{ uri: 'camera://img.jpg' }] }));

    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ImagePicker onImageSelected={onImageSelected} onClose={onClose} />);
    });

    const root = (tree as renderer.ReactTestRenderer).root;
    const touchables = root.findAll(node => typeof node.props?.onPress === 'function');
    const cameraBtn = touchables[touchables.length - 1];

    act(() => cameraBtn.props.onPress());

    expect(onImageSelected).toHaveBeenCalledWith('camera://img.jpg');
    expect(onClose).toHaveBeenCalled();
  });
});
