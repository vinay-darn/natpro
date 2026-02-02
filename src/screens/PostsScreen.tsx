import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { FileText, Calendar, User as UserIcon, Menu } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import Header from '../components/Header';
import SidebarDrawer from '../components/SidebarDrawer';
import {
  fetchPostsStart,
  refreshPostsStart,
  clearError,
  Post,
} from '../store/postsSlice';
import { fetchPostById } from '../store/postsSaga';

interface NavigationProps {
  navigation: any;
}

const PostsScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { posts, isLoading, isRefreshing, error } = useSelector(
    (state: RootState) => state.posts
  );
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  useEffect(() => {
    dispatch(fetchPostsStart());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        {
          text: 'Retry',
          onPress: () => dispatch(fetchPostsStart()),
        },
        {
          text: 'Dismiss',
          onPress: () => dispatch(clearError()),
        },
      ]);
    }
  }, [error, dispatch]);

  const handleRefresh = () => {
    dispatch(refreshPostsStart());
  };

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handlePostPress = (post: Post) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => handlePostPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.postHeader}>
        <View style={styles.postIconContainer}>
          <FileText color="#007AFF" size={20} />
        </View>
        <View style={styles.postMeta}>
          <Text style={styles.postTitle}>{item.title}</Text>
          <View style={styles.postDetails}>
            <View style={styles.postDetail}>
              <UserIcon color="#666" size={12} />
              <Text style={styles.postDetailText}>User {item.userId}</Text>
            </View>
            <View style={styles.postDetail}>
              <Calendar color="#666" size={12} />
              <Text style={styles.postDetailText}>Post #{item.id}</Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={styles.postExcerpt} numberOfLines={2}>
        {item.body}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <FileText color="#ccc" size={48} />
      </View>
      <Text style={styles.emptyStateTitle}>No Posts Available</Text>
      <Text style={styles.emptyStateSubtitle}>
        Unable to load posts. Please check your connection and try again.
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => dispatch(fetchPostsStart())}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderTitle}>All Posts</Text>
      <Text style={styles.listHeaderSubtitle}>
        {posts.length} post{posts.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  if (isLoading && posts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Posts"
          subtitle="Latest posts from the community"
          showMenuButton
          onMenuPress={handleDrawerOpen}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Posts"
        subtitle={`${posts.length} post${posts.length !== 1 ? 's' : ''}`}
        showMenuButton
        onMenuPress={handleDrawerOpen}
      />
      
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={posts.length === 0 ? styles.emptyContainer : styles.postsList}
        ListHeaderComponent={posts.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
      />

      <SidebarDrawer
        isVisible={isDrawerOpen}
        onClose={handleDrawerClose}
        navigation={navigation}
        currentRoute="Posts"
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
  postsList: {
    padding: 20,
  },
  listHeader: {
    marginBottom: 16,
  },
  listHeaderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  listHeaderSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  postItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postMeta: {
    flex: 1,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    lineHeight: 22,
  },
  postDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  postDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  postExcerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PostsScreen;
