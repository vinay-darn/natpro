import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  Image as RNImage,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Menu,
  X,
  Image,
  MapPin,
  Users,
  FileText,
  LogOut,
  Home,
  User,
  Trash2,
  Grid3X3,
  Navigation,
  Navigation2,
  Navigation2Off,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';
import PhotoStorageService, { Photo } from '../services/PhotoStorageService';
import Header from '../components/Header';
import SidebarDrawer from '../components/SidebarDrawer';
import LocationService from '../services/LocationService';
import { startLocationTracking, stopLocationTracking } from '../store/locationSlice';

interface DrawerItem {
  id: string;
  title: string;
  icon: any;
  action: () => void;
}

interface NavigationProps {
  navigation: any;
}

const DRAWER_WIDTH = 280;
const ANIMATION_DURATION = 300;
const SCREEN_WIDTH = Dimensions.get('window').width;

const DashboardScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [location, setLocation] = useState(null);

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const dispatch = useAppDispatch();
  const { currentLocation, isTracking, backgroundServiceActive } = useAppSelector(
    (state) => state.location
  );

  useEffect(() => {
    loadPhotos();
    // Initialize location service
    initializeLocationTracking();
  }, []);

  const initializeLocationTracking = async () => {
    try {
      const locationService = LocationService.getInstance();
      if (!locationService.isLocationTrackingActive()) {
        await locationService.startLocationTracking();
      }
    } catch (error) {
      console.error('Error initializing location tracking:', error);
    }
  };

  const toggleLocationTracking = () => {
    const locationService = LocationService.getInstance();
    if (isTracking) {
      locationService.stopLocationTracking();
      dispatch(stopLocationTracking());
    } else {
      initializeLocationTracking();
      dispatch(startLocationTracking());
    }
  };

  // Debug function to simulate location updates (for testing in emulator)
  const simulateLocationUpdate = () => {
    const locationService = LocationService.getInstance();
    locationService.simulateLocationUpdate();
  };

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
    const response = await PhotoStorageService.deletePhoto(photoId);
    if (response.success && response.data) {
      setPhotos(response.data);
    }
  };

  const renderPhotoItem = ({ item }: { item: Photo }) => (
    <View style={styles.photoItem}>
      <RNImage source={{ uri: item.uri }} style={styles.photoThumbnail} />
      <TouchableOpacity
        style={styles.deletePhotoButton}
        onPress={() => handleDeletePhoto(item.id)}
      >
        <Trash2 color="#fff" size={12} />
      </TouchableOpacity>
    </View>
  );

  const drawerItems: DrawerItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: Home,
      action: () => handleDrawerClose(),
    },
    {
      id: 'upload',
      title: 'Upload Photo',
      icon: Image,
      action: () => {
        handleDrawerClose();
        navigation.navigate('UploadPhoto');
      },
    },
    {
      id: 'location',
      title: 'Capture Location',
      icon: MapPin,
      action: () => handleDrawerClose(),
    },
    {
      id: 'contacts',
      title: 'Open Contacts',
      icon: Users,
      action: () => {
        handleDrawerClose();
        navigation.navigate('Contacts');
      },
    },
    {
      id: 'posts',
      title: 'Show Posts',
      icon: FileText,
      action: () => {
        handleDrawerClose();
        navigation.navigate('Posts');
      },
    },
  ];

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleLogout = () => {
    handleDrawerClose();
    dispatch(logout());
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'upload':
        navigation.navigate('UploadPhoto');
        break;
      case 'location':
        // TODO: Implement location functionality
        break;
      case 'contacts':
        navigation.navigate('Contacts');
        break;
      case 'posts':
        navigation.navigate('Posts');
        break;
      default:
        break;
    }
  };

  const renderQuickActionCard = (
    title: string,
    subtitle: string,
    IconComponent: React.ComponentType<any>,
    color: string,
    action: string,
  ) => (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={() => handleQuickAction(action)}
      activeOpacity={0.8}
    >
      <View style={styles.actionIconContainer}>
        <IconComponent color={color} size={24} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Dashboard"
        subtitle="Welcome back!"
        showMenuButton
        onMenuPress={handleDrawerOpen}
      />
      
      <SidebarDrawer
        isVisible={isDrawerOpen}
        onClose={handleDrawerClose}
        navigation={navigation}
        currentRoute="Dashboard"
      />
      
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading photos...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Good Morning! 🌟</Text>
              <Text style={styles.welcomeSubtitle}>
                {photos.length === 0
                  ? 'Start by uploading your first photo'
                  : 'What would you like to do today?'}
              </Text>
            </View>

            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationTitle}>Current Location</Text>
                <View style={styles.locationButtons}>
                  <TouchableOpacity
                    style={[
                      styles.locationToggleButton,
                      isTracking && styles.locationToggleActive,
                    ]}
                    onPress={toggleLocationTracking}
                    activeOpacity={0.8}
                  >
                    {isTracking ? (
                      <Navigation2Off color="#fff" size={16} />
                    ) : (
                      <Navigation2 color="#fff" size={16} />
                    )}
                  </TouchableOpacity>
                  {/* Debug button for emulator testing */}
                  {__DEV__ && (
                    <TouchableOpacity
                      style={styles.debugButton}
                      onPress={simulateLocationUpdate}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.debugButtonText}>Simulate</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
              {currentLocation ? (
                <View style={styles.locationContent}>
                  <View style={styles.locationInfo}>
                    <MapPin color="#007AFF" size={20} />
                    <View style={styles.locationDetails}>
                      <Text style={styles.locationCoords}>
                        {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                      </Text>
                      <Text style={styles.locationAccuracy}>
                        Accuracy: ±{currentLocation.accuracy?.toFixed(0)}m
                      </Text>
                      {currentLocation.speed && (
                        <Text style={styles.locationSpeed}>
                          Speed: {currentLocation.speed.toFixed(1)} m/s
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.locationStatus}>
                    <View style={[
                      styles.statusIndicator,
                      isTracking && styles.statusActive
                    ]} />
                    <Text style={[
                      styles.statusText,
                      isTracking && styles.statusTextActive
                    ]}>
                      {isTracking ? 'Tracking' : 'Idle'}
                    </Text>
                    {backgroundServiceActive && (
                      <Text style={styles.backgroundStatus}>Background Active</Text>
                    )}
                  </View>
                </View>
              ) : (
                <View style={styles.locationEmpty}>
                  <MapPin color="#ccc" size={32} />
                  <Text style={styles.locationEmptyText}>
                    {isTracking ? 'Acquiring location...' : 'Location tracking disabled'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.quickActionsContainer}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                {renderQuickActionCard(
                  'Upload',
                  'Add photos',
                  Image,
                  '#007AFF',
                  'upload',
                )}
                {renderQuickActionCard(
                  'Location',
                  'Capture place',
                  MapPin,
                  '#34C759',
                  'location',
                )}
                {renderQuickActionCard(
                  'Contacts',
                  'View friends',
                  Users,
                  '#FF9500',
                  'contacts',
                )}
                {renderQuickActionCard(
                  'Posts',
                  'Read updates',
                  FileText,
                  '#AF52DE',
                  'posts',
                )}
              </View>
            </View>

            {photos.length > 0 && (
              <View style={styles.photosContainer}>
                <View style={styles.photosHeader}>
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
                    My Photos ({photos.length})
                  </Text>
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => navigation.navigate('AllPhotos')}
                  >
                    <Grid3X3 color="#007AFF" size={20} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={photos.slice(0, 6)}
                  renderItem={renderPhotoItem}
                  keyExtractor={item => item.id}
                  numColumns={3}
                  scrollEnabled={false}
                  contentContainerStyle={styles.photosGrid}
                />
                {photos.length > 6 && (
                  <TouchableOpacity
                    style={styles.viewAllPhotosButton}
                    onPress={() => navigation.navigate('AllPhotos')}
                  >
                    <Text style={styles.viewAllPhotosText}>
                      View All Photos
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
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
  headerCenter: {
    flex: 2,
    marginLeft: 30,
  },
  menuButton: {
    padding: 8,
    borderRadius: 3,
    backgroundColor: '#f0f0f0',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
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
  photosContainer: {
    marginTop: 24,
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
  },
  photosGrid: {
    gap: 8,
  },
  photoItem: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  photoThumbnail: {
    width: SCREEN_WIDTH / 3.6,
    height: 200,
    borderRadius: 8,
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllPhotosButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllPhotosText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadedImageContainer: {
    marginBottom: 20,
  },
  imageCard: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadedImage: {
    width: '100%',
    height: 200,
  },
  imageRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debugButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  locationToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationToggleActive: {
    backgroundColor: '#007AFF',
  },
  locationContent: {
    gap: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  locationCoords: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  locationAccuracy: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  locationSpeed: {
    fontSize: 12,
    color: '#666',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  statusActive: {
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  statusTextActive: {
    color: '#34C759',
    fontWeight: '500',
  },
  backgroundStatus: {
    fontSize: 10,
    color: '#007AFF',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  locationEmpty: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  locationEmptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  quickActionsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // Drawer Styles
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
  },
  drawerContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
  },
  drawerSafeArea: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  drawerContent: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    top: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  drawerItemsContainer: {
    flex: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f5f5f5',
  },
  activeItem: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeIconContainer: {
    backgroundColor: '#007AFF',
  },
  drawerItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  activeItemText: {
    color: '#007AFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 'auto',
  },
  logoutIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FF3B30',
  },
});

export default DashboardScreen;
