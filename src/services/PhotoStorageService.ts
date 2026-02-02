import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Photo {
  id: string;
  uri: string;
  timestamp: number;
  size?: number;
  fileName?: string;
}

export interface PhotoStorageResponse {
  success: boolean;
  data?: Photo[];
  error?: string;
}

class PhotoStorageService {
  private static readonly STORAGE_KEY = '@app_uploaded_photos';
  private static readonly MAX_PHOTOS = 50; // Limit storage size

  /**
   * Save a photo to AsyncStorage
   */
  static async savePhoto(photoUri: string, fileName?: string): Promise<PhotoStorageResponse> {
    try {
      const response = await this.getPhotos();
      
      if (!response.success || !response.data) {
        throw new Error('Failed to retrieve existing photos');
      }

      const photos = response.data;
      
      // Check if we've reached the maximum number of photos
      if (photos.length >= this.MAX_PHOTOS) {
        // Remove the oldest photo
        photos.shift();
      }

      const newPhoto: Photo = {
        id: Date.now().toString(),
        uri: photoUri,
        timestamp: Date.now(),
        fileName: fileName || `photo_${Date.now()}.jpg`,
      };

      photos.push(newPhoto);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(photos));
      
      return {
        success: true,
        data: photos,
      };
    } catch (error) {
      console.error('Error saving photo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get all photos from AsyncStorage
   */
  static async getPhotos(): Promise<PhotoStorageResponse> {
    try {
      const storedPhotos = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (!storedPhotos) {
        return {
          success: true,
          data: [],
        };
      }

      const photos: Photo[] = JSON.parse(storedPhotos);
      
      // Sort by timestamp (newest first)
      const sortedPhotos = photos.sort((a, b) => b.timestamp - a.timestamp);
      
      return {
        success: true,
        data: sortedPhotos,
      };
    } catch (error) {
      console.error('Error retrieving photos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Delete a photo by ID
   */
  static async deletePhoto(photoId: string): Promise<PhotoStorageResponse> {
    try {
      const response = await this.getPhotos();
      
      if (!response.success || !response.data) {
        throw new Error('Failed to retrieve photos');
      }

      const photos = response.data.filter(photo => photo.id !== photoId);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(photos));
      
      return {
        success: true,
        data: photos,
      };
    } catch (error) {
      console.error('Error deleting photo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Clear all photos
   */
  static async clearAllPhotos(): Promise<PhotoStorageResponse> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      
      return {
        success: true,
        data: [],
      };
    } catch (error) {
      console.error('Error clearing photos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    photoCount: number;
    totalSize: number;
    oldestPhoto?: Photo;
    newestPhoto?: Photo;
  }> {
    try {
      const response = await this.getPhotos();
      
      if (!response.success || !response.data) {
        return {
          photoCount: 0,
          totalSize: 0,
        };
      }

      const photos = response.data;
      const sortedByTimestamp = [...photos].sort((a, b) => a.timestamp - b.timestamp);
      
      return {
        photoCount: photos.length,
        totalSize: photos.reduce((sum, photo) => sum + (photo.size || 0), 0),
        oldestPhoto: sortedByTimestamp[0],
        newestPhoto: sortedByTimestamp[sortedByTimestamp.length - 1],
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        photoCount: 0,
        totalSize: 0,
      };
    }
  }
}

export default PhotoStorageService;
