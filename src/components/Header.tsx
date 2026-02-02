import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { ArrowLeft, Menu } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showNotificationButton?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  borderBottomColor?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  showMenuButton = false,
  showNotificationButton = false,
  onBackPress,
  onMenuPress,
  rightComponent,
  backgroundColor = '#fff',
  borderBottomColor = '#ddd',
}) => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <View
        style={[
          styles.header,
          {
            backgroundColor,
            borderBottomColor,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          {showBackButton && (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <ArrowLeft color="#333" size={24} />
            </TouchableOpacity>
          )}
          {showMenuButton && (
            <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
              <Menu color="#333" size={24} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          )}
        </View>

        <View style={styles.headerRight}>
          {rightComponent || (
            <>
              {showNotificationButton && (
                <TouchableOpacity style={styles.notificationButton}>
                  <View style={styles.notificationDot} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
  },
  headerCenter: {
    flex: 2,
    marginLeft: 20,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
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
    position: 'relative',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default Header;
