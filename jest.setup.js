/* eslint-disable */

try {
    jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch (e1) {
    try {
        jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');
    } catch (e2) {
        // ignore if not found
    }
}

let Easing;
try {
    Easing = require('react-native/Libraries/Animated/Easing');
} catch (e) {
    try {
        Easing = require('react-native/Libraries/Animated/src/Easing');
    } catch (e) {
        Easing = null;
    }
}

if (Easing && (!Easing.bezier || typeof Easing.bezier !== 'function')) {
    Easing.bezier = () => () => 0;
}

try {
    const RN = require('react-native');
    if (RN && RN.Animated) {
        RN.Animated.timing = () => ({
            start: (cb) => { if (typeof cb === 'function') cb({ finished: true }); return { stop: () => { } }; },
        });
        RN.Animated.spring = () => ({
            start: (cb) => { if (typeof cb === 'function') cb({ finished: true }); return { stop: () => { } }; },
        });
    }
} catch (e) {
    // ignore
}

// Suppress known noisy jest/react-native warnings in test output
const realConsoleError = console.error;
console.error = (...args) => {
    try {
        const msg = args[0] ? String(args[0]) : '';
        if (msg.includes('not wrapped in act') || msg.includes('Cannot log after tests are done') || msg.includes('trying to `import` a file after the Jest environment has been torn down')) {
            return;
        }
    } catch (e) {
        // ignore
    }
    realConsoleError.apply(console, args);
};

const realConsoleWarn = console.warn;
console.warn = (...args) => {
    try {
        const msg = args[0] ? String(args[0]) : '';
        if (msg.includes('not wrapped in act') || msg.includes('Cannot log after tests are done') || msg.includes('An error occurred in the <')) {
            return;
        }
    } catch (e) {
        // ignore
    }
    realConsoleWarn.apply(console, args);
};
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

// Use fake timers to control animated/time-based behaviors and clear pending timers after tests
try {
    jest.useFakeTimers();
    afterAll(() => {
        try {
            jest.runOnlyPendingTimers();
        } catch (e) {
            // ignore
        }
        try {
            jest.useRealTimers();
        } catch (e) {
            // ignore
        }
    });
} catch (e) {
    // ignore if jest not available
}
