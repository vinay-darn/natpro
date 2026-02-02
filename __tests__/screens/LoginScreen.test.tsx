import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { store } from '../../src/store/store';
import LoginScreen from '../../src/screens/LoginScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.useFakeTimers();

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
}));

describe('LoginScreen', () => {
  it('validates and logs in with correct credentials', async () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <LoginScreen />
        </Provider>,
      );
    });

    const root = (tree as renderer.ReactTestRenderer).root;
    const emailInput = root.find(node => node.props?.accessibilityLabel === 'Email input');
    const passInput = root.find(node => node.props?.accessibilityLabel === 'Password input');
    act(() => emailInput.props.onChangeText('admin@example.com'));
    act(() => passInput.props.onChangeText('password123'));

    const signInTextNode = root.find(node => node.props?.children === 'Sign In');
    let btnNode = signInTextNode;
    while (btnNode && !btnNode.props?.onPress) btnNode = (btnNode as any).parent;

    act(() => {
      if (btnNode && btnNode.props.onPress) btnNode.props.onPress();
      jest.runAllTimers();
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user_session', 'admin@example.com');
  });
});
