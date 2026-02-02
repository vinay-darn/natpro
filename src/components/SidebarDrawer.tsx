import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Animated,
  Image as RNImage,
} from 'react-native';
import {
  X,
  Home,
  User,
  Image,
  MapPin,
  Users,
  FileText,
  LogOut
} from 'lucide-react-native';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/authSlice';

interface DrawerItem {
  id: string;
  title: string;
  icon: any;
  action: () => void;
  route: string;
}

interface SidebarDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  navigation?: any;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  currentRoute?: string;
}

const DRAWER_WIDTH = 280;
const ANIMATION_DURATION = 300;

const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isVisible,
  onClose,
  navigation,
  userName = 'John Doe',
  userEmail = 'john.doe@example.com',
  userAvatar,
  currentRoute = 'Dashboard',
}) => {
  const dispatch = useAppDispatch();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }).start();
    }
  }, [isVisible, slideAnim]);

  const handleDrawerClose = () => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    }).start(() => {
      onClose();
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    handleDrawerClose();
  };

  const drawerItems: DrawerItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: Home,
      action: () => {
        navigation?.navigate('Dashboard');
        handleDrawerClose();
      },
      route: 'Dashboard',
    },
    {
      id: 'photos',
      title: 'My Photos',
      icon: Image,
      action: () => {
        navigation?.navigate('AllPhotos');
        handleDrawerClose();
      },
      route: 'AllPhotos',
    },
    {
      id: 'contacts',
      title: 'Contacts',
      icon: Users,
      action: () => {
        navigation?.navigate('Contacts');
        handleDrawerClose();
      },
      route: 'Contacts',
    },
    {
      id: 'posts',
      title: 'Posts',
      icon: FileText,
      action: () => {
        navigation?.navigate('Posts');
        handleDrawerClose();
      },
      route: 'Posts',
    },
  ];

  const renderDrawerItem = ({ item }: { item: DrawerItem }) => {
    const IconComponent = item.icon;
    const isActive = currentRoute === item.route;
    return (
      <TouchableOpacity
        style={[styles.drawerItem, isActive && styles.activeItem]}
        onPress={item.action}
        activeOpacity={0.7}
      >
        <View style={[styles.drawerItemIcon, isActive && styles.activeItemIcon]}>
          <IconComponent color={isActive ? '#007AFF' : '#333'} size={20} />
        </View>
        <Text
          style={[styles.drawerItemText, isActive && styles.activeItemText]}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDrawerHeader = () => (
    <View style={styles.drawerHeader}>
      <View style={styles.profileContainer}>
        {userAvatar ? (
          <RNImage source={{ uri: userAvatar }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <User color="#fff" size={32} />
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userName}</Text>
          <Text style={styles.profileEmail}>{userEmail}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={handleDrawerClose} style={styles.closeButton}>
        <X color="#333" size={24} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleDrawerClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.drawerContent,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {renderDrawerHeader()}
          <View style={styles.drawerBody}>
            <FlatList
              data={drawerItems}
              renderItem={renderDrawerItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.drawerList}
            />
          </View>
          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={[styles.drawerItem, styles.logoutItem]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.drawerItemIcon}>
                <LogOut color="#FF3B30" size={20} />
              </View>
              <Text style={[styles.drawerItemText, styles.logoutText]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContent: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  profilePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  drawerBody: {
    flex: 1,
  },
  drawerList: {
    flex: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  drawerItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activeItem: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  activeItemIcon: {
    backgroundColor: '#e6f3ff',
  },
  activeItemText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#FF3B30',
  },
});

export default SidebarDrawer;
