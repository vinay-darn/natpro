import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title = 'Select Option',
  children,
  height = Dimensions.get('window').height * 0.4,
}) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: false,
        tension: 65,
        friction: 8,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, height, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > height * 0.3) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: false,
            tension: 65,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 250,
      useNativeDriver: false,
    }).start(() => onClose());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{ width: '100%', height }}
          onPress={e => e.stopPropagation()}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <Animated.View
              style={{
                flex: 1,
                backgroundColor: '#fff',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                transform: [{ translateY }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
              }}
              {...panResponder.panHandlers}
            >
              <View style={{ padding: 20 }}>
                <View
                  style={{
                    width: 40,
                    height: 4,
                    backgroundColor: '#ddd',
                    alignSelf: 'center',
                    borderRadius: 2,
                    marginBottom: 20,
                  }}
                />
                
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: '#333',
                    }}
                  >
                    {title}
                  </Text>
                  <TouchableOpacity onPress={handleClose}>
                    <X color="#666" size={24} />
                  </TouchableOpacity>
                </View>

                {children}
              </View>
            </Animated.View>
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default BottomSheet;
