import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Image, Camera } from 'lucide-react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType, PhotoQuality } from 'react-native-image-picker';

interface ImagePickerProps {
  onImageSelected: (imageUri: string) => void;
  onClose: () => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ onImageSelected, onClose }) => {
  const options = {
    mediaType: 'photo' as MediaType,
    quality: 0.8 as PhotoQuality,
    maxWidth: 800,
    maxHeight: 600,
  };

  const handleOpenGallery = () => {
    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          onImageSelected(imageUri);
          onClose();
        }
      }
    });
  };

  const handleOpenCamera = () => {
    Alert.alert(
      'Camera Permission',
      'We need camera permission to take photos',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onClose,
        },
        {
          text: 'OK',
          onPress: () => {
            launchCamera(options, (response: ImagePickerResponse) => {
              if (response.didCancel || response.errorMessage) {
                return;
              }

              if (response.assets && response.assets[0]) {
                const imageUri = response.assets[0].uri;
                if (imageUri) {
                  onImageSelected(imageUri);
                  onClose();
                }
              }
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={handleOpenGallery}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Image color="#007AFF" size={24} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.optionTitle}>Open Gallery</Text>
          <Text style={styles.optionSubtitle}>Choose from your photos</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={handleOpenCamera}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Camera color="#34C759" size={24} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.optionTitle}>Open Camera</Text>
          <Text style={styles.optionSubtitle}>Take a new photo</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default ImagePicker;
