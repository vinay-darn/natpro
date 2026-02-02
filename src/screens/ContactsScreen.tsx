import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  RefreshControl,
} from 'react-native';
import { Search, User, Phone, Mail } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import SidebarDrawer from '../components/SidebarDrawer';
// import Contacts from 'react-native-contacts'; // Temporarily commented for demo

interface Contact {
  recordID: string;
  contactType: string;
  familyName: string;
  givenName: string;
  middleName: string;
  name: string;
  phoneNumbers: Array<{
    label: string;
    number: string;
  }>;
  emailAddresses: Array<{
    label: string;
    email: string;
  }>;
  postalAddresses: Array<any>;
}

interface NavigationProps {
  navigation: any;
}

const ContactsScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [searchQuery, contacts]);

  const requestContactsPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Contacts Permission',
            message: 'This app needs access to your contacts to display them.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // For iOS, we need to check and request permission differently
        // Since react-native-contacts is commented out, we'll return true for demo
        // In production with real contacts library, you'd use:
        // const permission = await Contacts.requestPermission();
        // return permission === 'authorized';
        return true;
      }
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  const loadContacts = async () => {
    try {
      // First check if we have permission
      let hasPermission = false;
      
      if (Platform.OS === 'android') {
        const hasExistingPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );
        
        if (!hasExistingPermission) {
          // Request permission if not granted
          hasPermission = await requestContactsPermission();
        } else {
          hasPermission = true;
        }
      } else {
        // iOS - for demo purposes, assume permission granted
        hasPermission = true;
      }
      
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'This app needs contacts permission to display your contacts. Please enable it in Settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Try Again',
              onPress: () => loadContacts(),
            },
          ]
        );
        setIsLoading(false);
        return;
      }

      // For demo purposes, create mock contacts
      // In production, replace with: const contactsData = await Contacts.getAll();
      const mockContacts: Contact[] = [
        {
          recordID: '1',
          contactType: 'person',
          familyName: 'Smith',
          givenName: 'John',
          middleName: '',
          name: 'John Smith',
          phoneNumbers: [{ label: 'mobile', number: '+1234567890' }],
          emailAddresses: [{ label: 'work', email: 'john.smith@example.com' }],
          postalAddresses: [],
        },
        {
          recordID: '2',
          contactType: 'person',
          familyName: 'Johnson',
          givenName: 'Sarah',
          middleName: '',
          name: 'Sarah Johnson',
          phoneNumbers: [{ label: 'home', number: '+0987654321' }],
          emailAddresses: [{ label: 'personal', email: 'sarah.j@example.com' }],
          postalAddresses: [],
        },
        {
          recordID: '3',
          contactType: 'person',
          familyName: 'Williams',
          givenName: 'Mike',
          middleName: '',
          name: 'Mike Williams',
          phoneNumbers: [{ label: 'work', number: '+1122334455' }],
          emailAddresses: [],
          postalAddresses: [],
        },
      ];
      
      const contactsData = mockContacts;
      
      // Sort contacts by name
      const sortedContacts = contactsData.sort((a: Contact, b: Contact) => 
        a.givenName.localeCompare(b.givenName)
      );
      
      setContacts(sortedContacts);
      setFilteredContacts(sortedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert(
        'Error',
        'Failed to load contacts. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filterContacts = () => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = contacts.filter(contact => {
      const fullName = `${contact.givenName} ${contact.familyName}`.toLowerCase();
      const email = contact.emailAddresses?.[0]?.email?.toLowerCase() || '';
      const phone = contact.phoneNumbers?.[0]?.number?.toLowerCase() || '';
      
      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query)
      );
    });
    
    setFilteredContacts(filtered);
  };

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const renderContactItem = ({ item }: { item: Contact }) => {
    const fullName = `${item.givenName} ${item.familyName}`.trim();
    const phoneNumber = item.phoneNumbers?.[0]?.number || '';
    const emailAddress = item.emailAddresses?.[0]?.email || '';

    return (
      <TouchableOpacity
        style={styles.contactItem}
        activeOpacity={0.7}
      >
        <View style={styles.contactAvatar}>
          {fullName ? (
            <Text style={styles.contactInitial}>
              {fullName.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <User color="#666" size={24} />
          )}
        </View>
        
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>
            {fullName || 'Unknown Contact'}
          </Text>
          
          {phoneNumber && (
            <View style={styles.contactDetail}>
              <Phone color="#666" size={14} />
              <Text style={styles.contactText}>{phoneNumber}</Text>
            </View>
          )}
          
          {emailAddress && (
            <View style={styles.contactDetail}>
              <Mail color="#666" size={14} />
              <Text style={styles.contactText}>{emailAddress}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <User color="#ccc" size={48} />
      </View>
      <Text style={styles.emptyStateTitle}>No Contacts Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery
          ? 'Try adjusting your search terms'
          : 'No contacts available on your device'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadContacts}
        >
          <Text style={styles.refreshButtonText}>Refresh Contacts</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Contacts"
          subtitle={`${contacts.length} contacts`}
          showMenuButton
          onMenuPress={handleDrawerOpen}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Contacts"
        subtitle={`${filteredContacts.length} of ${contacts.length} contacts`}
        showMenuButton
        onMenuPress={handleDrawerOpen}
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color="#666" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <FlatList
        data={filteredContacts}
        renderItem={renderContactItem}
        keyExtractor={item => item.recordID}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contactsList}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={loadContacts}
          />
        }
      />

      <SidebarDrawer
        isVisible={isDrawerOpen}
        onClose={handleDrawerClose}
        navigation={navigation}
        currentRoute="Contacts"
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
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  contactsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  sectionHeader: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
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
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContactsScreen;
