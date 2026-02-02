import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '../store/hooks';
import { loginSuccess } from '../store/authSlice';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react-native';

// Hardcoded Credentials
const VALID_EMAIL = 'admin@example.com';
const VALID_PASSWORD = 'password123';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  const dispatch = useAppDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateForm = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    setIsFormValid(
      isEmailValid && isPasswordValid && !emailError && !passwordError,
    );
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) validateEmail(text);
    validateForm();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) validatePassword(text);
    validateForm();
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        try {
          await AsyncStorage.setItem('user_session', email);
          dispatch(loginSuccess(email));
        } catch (e) {
          Alert.alert('Error', 'Failed to save session');
        }
      } else {
        Alert.alert(
          'Invalid Credentials',
          'Username or password is incorrect',
        );
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.headerContainer}>
              <View style={styles.iconContainer}>
                <Lock size={40} color="#4F46E5" />
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue to your account
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input]}
                    placeholder="Email address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={handleEmailChange}
                    onBlur={() => validateEmail(email)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    accessibilityLabel="Email input"
                    accessibilityHint="Enter your email address"
                  />
                </View>
                {emailError ? (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{emailError}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input]}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={handlePasswordChange}
                    onBlur={() => validatePassword(password)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    textContentType="password"
                    accessibilityLabel="Password input"
                    accessibilityHint="Enter your password"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    accessibilityLabel={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{passwordError}</Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  (!isFormValid || loading) && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={!isFormValid || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Demo Credentials:</Text>
                <Text style={styles.demoCredentials}>admin@example.com</Text>
                <Text style={styles.demoCredentials}>password123</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  inputIcon: {
    marginLeft: 4,
  },
  eyeIcon: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 6,
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  demoCredentials: {
    fontSize: 13,
    color: '#4B5563',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});

export default LoginScreen;
