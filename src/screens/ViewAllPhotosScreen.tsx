import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image as RNImage,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Trash2, Grid3X3, List, Menu } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import PhotoStorageService, { Photo } from '../services/PhotoStorageService';
import SidebarDrawer from '../components/SidebarDrawer';

interface NavigationProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');
const PHOTO_SPACING = 8;
const PHOTO_SIZE = (screenWidth - PHOTO_SPACING * 4) / 3; // 3 columns with spacing

const ViewAllPhotosScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const response = await PhotoStorageService.getPhotos();
      if (response.success && response.data) {
        setPhotos(response.data);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPhotos();
    setIsRefreshing(false);
  };

  const handleDeletePhoto = async (photoId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const response = await PhotoStorageService.deletePhoto(photoId);
            if (response.success && response.data) {
              setPhotos(response.data);
              setSelectedPhotos(prev => {
                const newSet = new Set(prev);
                newSet.delete(photoId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedPhotos.size === 0) return;

    Alert.alert(
      'Delete Selected Photos',
      `Are you sure you want to delete ${selectedPhotos.size} photo${selectedPhotos.size > 1 ? 's' : ''}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            let updatedPhotos = [...photos];
            for (const photoId of selectedPhotos) {
              const response = await PhotoStorageService.deletePhoto(photoId);
              if (response.success && response.data) {
                updatedPhotos = response.data;
              }
            }
            setPhotos(updatedPhotos);
            setSelectedPhotos(new Set());
          },
        },
      ]
    );
  };

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };
    const renderPhotoItem = ({ item }: { item: Photo }) => {
    const isSelected = selectedPhotos.has(item.id);
    
    if (viewMode === 'grid') {
      return (
        <TouchableOpacity
          style={[
            styles.photoItem,
            isSelected && styles.selectedPhotoItem,
          ]}
          onPress={() => togglePhotoSelection(item.id)}
          onLongPress={() => handleDeletePhoto(item.id)}
        >
          <RNImage source={{ uri: item.uri }} style={styles.photoThumbnail} />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeletePhoto(item.id)}
          >
            <Trash2 color="#fff" size={12} />
          </TouchableOpacity>
          {isSelected && (
            <View style={styles.selectionOverlay}>
              <View style={styles.selectionIndicator}>
                <Text style={styles.selectionText}>✓</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.listItem}>
        <RNImage source={{ uri: item.uri }} style={styles.listThumbnail} />
        <View style={styles.listContent}>
          <Text style={styles.listTitle}>Photo</Text>
          <Text style={styles.listSubtitle}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.listDeleteButton}
          onPress={() => handleDeletePhoto(item.id)}
        >
          <Trash2 color="#FF3B30" size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Grid3X3 color="#ccc" size={48} />
      </View>
      <Text style={styles.emptyStateTitle}>No Photos Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start by uploading some photos to see them here
      </Text>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => navigation.navigate('UploadPhoto')}
      >
        <Text style={styles.uploadButtonText}>Upload Photos</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.screenHeader}>
      <View style={styles.headerTop}>
        <Text style={styles.photoCount}>
          {photos.length} Photo{photos.length !== 1 ? 's' : ''}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? (
              <List color="#007AFF" size={20} />
            ) : (
              <Grid3X3 color="#007AFF" size={20} />
            )}
          </TouchableOpacity>
          {selectedPhotos.size > 0 && (
            <TouchableOpacity
              style={styles.deleteSelectedButton}
              onPress={handleDeleteSelected}
            >
              <Trash2 color="#FF3B30" size={20} />
              <Text style={styles.deleteSelectedText}>
                {selectedPhotos.size}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {selectedPhotos.size > 0 && (
        <Text style={styles.selectionInfo}>
          {selectedPhotos.size} photo{selectedPhotos.size > 1 ? 's' : ''} selected
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="All Photos"
          showBackButton
          onBackPress={() => navigation.goBack()}
          showMenuButton={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="All Photos"
        subtitle={`${photos.length} photo${photos.length !== 1 ? 's' : ''}`}
        showBackButton
        showMenuButton={false}
        onBackPress={() => navigation.goBack()}
      />
      
      <FlatList
        data={photos}
        renderItem={renderPhotoItem}
        keyExtractor={item => item.id}
        numColumns={viewMode === 'grid' ? 3 : 1}
        key={viewMode}
        contentContainerStyle={photos.length === 0 ? styles.emptyContainer : styles.photoGrid}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={photos.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
      <SidebarDrawer
        isVisible={isDrawerOpen}
        onClose={handleDrawerClose}
        navigation={navigation}
        currentRoute="AllPhotos"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  screenHeader: {
    marginTop: 10,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoCount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 10
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
  },
  deleteSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff5f5',
    gap: 4,
  },
  deleteSelectedText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  selectionInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  photoGrid: {
    marginLeft: 6
  },
  photoItem: {
    position: 'relative',
    marginBottom: PHOTO_SPACING,
    marginRight: PHOTO_SPACING,
  },
  selectedPhotoItem: {
    opacity: 0.8,
  },
  photoThumbnail: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  listDeleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff5f5',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ViewAllPhotosScreen;
