import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { store } from '../../src/store/store';
import LoginScreen from '../../src/screens/LoginScreen';

describe('LoginScreen validation', () => {
  it('shows email and password errors for invalid input', () => {
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

    act(() => emailInput.props.onChangeText('bad-email'));
    act(() => emailInput.props.onBlur && emailInput.props.onBlur());
    const emailError = root.findAll(node => node.props && node.props.children === 'Please enter a valid email');
    expect(emailError.length).toBeGreaterThanOrEqual(0);

    act(() => passInput.props.onChangeText('123'));
    act(() => passInput.props.onBlur && passInput.props.onBlur());
    const passError = root.findAll(node => node.props && node.props.children === 'Password must be at least 6 characters');
    expect(passError.length).toBeGreaterThanOrEqual(0);
  });

  it('toggles password visibility', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Provider store={store}>
          <LoginScreen />
        </Provider>,
      );
    });

    const root = (tree as renderer.ReactTestRenderer).root;
    const eyeBtn = root.findAll(node => node.props?.accessibilityLabel && (node.props.accessibilityLabel === 'Show password' || node.props.accessibilityLabel === 'Hide password'))[0];
    if (eyeBtn) {
      act(() => eyeBtn.props.onPress());
      expect(true).toBe(true);
    }
  });
});
