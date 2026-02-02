import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image as RNImage,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Upload, X, Check } from 'lucide-react-native';
import BottomSheet from '../components/BottomSheet';
import ImagePicker from '../components/ImagePicker';
import PhotoStorageService from '../services/PhotoStorageService';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NavigationProps {
  navigation: any;
}

const UploadPhotoScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageSelected = async (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  const handleSavePhoto = async () => {
    if (!selectedImage) return;

    setIsSaving(true);
    
    try {
      const response = await PhotoStorageService.savePhoto(selectedImage);
      
      if (response.success) {
        Alert.alert(
          'Success',
          'Photo saved successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to save photo');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseImagePicker = () => {
    setShowImagePicker(false);
  };

  const handleUploadPhoto = () => {
    setShowImagePicker(true);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Upload Photo"
        subtitle={selectedImage ? 'Photo selected' : 'Choose a photo to upload'}
        showBackButton
        onBackPress={handleBack}
        rightComponent={selectedImage ? (
          <TouchableOpacity onPress={handleRemoveImage} style={styles.removeButton}>
            <X color="#FF3B30" size={20} />
          </TouchableOpacity>
        ) : null}
      />

      <View style={styles.content}>
        {!selectedImage ? (
          <View style={styles.uploadContainer}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadPhoto}
              activeOpacity={0.8}
            >
              <View style={styles.uploadIconContainer}>
                <Upload color="#007AFF" size={32} />
              </View>
              <Text style={styles.uploadTitle}>Upload Photo</Text>
              <Text style={styles.uploadSubtitle}>
                Tap to choose from gallery or camera
              </Text>
            </TouchableOpacity>
            
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Instructions:</Text>
              <Text style={styles.instructionsText}>
                • Choose a clear, well-lit photo{'\n'}
                • Maximum file size: 10MB{'\n'}
                • Supported formats: JPG, PNG{'\n'}
                • Tap the upload button to get started
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Photo Preview</Text>
            <View style={styles.imageContainer}>
              <RNImage
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
                resizeMode="cover"
              />
            </View>
            <TouchableOpacity
              style={[styles.confirmButton, isSaving && styles.disabledButton]}
              onPress={handleSavePhoto}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size={20} />
              ) : (
                <>
                  <Check color="#fff" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.confirmButtonText}>Save Photo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <BottomSheet
        visible={showImagePicker}
        onClose={handleCloseImagePicker}
        title="Select Photo Source"
      >
        <ImagePicker
          onImageSelected={handleImageSelected}
          onClose={handleCloseImagePicker}
        />
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    width: 300
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  instructionsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    width: 300
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UploadPhotoScreen;
