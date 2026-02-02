import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { ArrowLeft, User as UserIcon, Calendar, FileText } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import Header from '../components/Header';
import {
  clearCurrentPost,
  clearError,
  Post,
} from '../store/postsSlice';
import { fetchPostById } from '../store/postsSaga';

interface NavigationProps {
  navigation: any;
  route: {
    params: {
      postId: number;
    };
  };
}

const PostDetailScreen: React.FC<NavigationProps> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { currentPost, isLoading, error } = useSelector(
    (state: RootState) => state.posts
  );
  const { postId } = route.params;

  useEffect(() => {
    dispatch(fetchPostById(postId));

    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, postId]);

  useEffect(() => {
    if (error) {
      navigation.goBack();
    }
  }, [error, navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Loading..."
          showBackButton
          onBackPress={handleBackPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading post details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentPost) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Post Not Found"
          showBackButton
          onBackPress={handleBackPress}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Unable to load post details. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(fetchPostById(postId))}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={`Post #${currentPost.id}`}
        showBackButton
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.postHeader}>
            <View style={styles.postIconContainer}>
              <FileText color="#007AFF" size={24} />
            </View>
            <View style={styles.postMeta}>
              <Text style={styles.postTitle}>{currentPost.title}</Text>
              <View style={styles.postDetails}>
                <View style={styles.postDetail}>
                  <UserIcon color="#666" size={14} />
                  <Text style={styles.postDetailText}>User {currentPost.userId}</Text>
                </View>
                <View style={styles.postDetail}>
                  <Calendar color="#666" size={14} />
                  <Text style={styles.postDetailText}>Post #{currentPost.id}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.postContent}>
            <Text style={styles.contentTitle}>Content</Text>
            <Text style={styles.contentText}>{currentPost.body}</Text>
          </View>

          <View style={styles.postStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentPost.id}</Text>
              <Text style={styles.statLabel}>Post ID</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentPost.userId}</Text>
              <Text style={styles.statLabel}>User ID</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentPost.body.split(' ').length}</Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  postIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  postMeta: {
    flex: 1,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 28,
  },
  postDetails: {
    flexDirection: 'row',
    gap: 20,
  },
  postDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  postContent: {
    marginBottom: 32,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
});

export default PostDetailScreen;
