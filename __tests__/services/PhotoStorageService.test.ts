import AsyncStorage from '@react-native-async-storage/async-storage';
import PhotoStorageService from '../../src/services/PhotoStorageService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('PhotoStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getPhotos returns empty array when none stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const res = await PhotoStorageService.getPhotos();
    expect(res.success).toBe(true);
    expect(res.data).toEqual([]);
  });

  it('savePhoto stores a new photo and calls AsyncStorage.setItem', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const res = await PhotoStorageService.savePhoto('file://img.jpg', 'img.jpg');
    expect(res.success).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    expect(res.data && res.data.length).toBe(1);
  });

  it('deletePhoto removes the specified id', async () => {
    const photos = [
      { id: '1', uri: 'a', timestamp: 1 },
      { id: '2', uri: 'b', timestamp: 2 },
    ];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(photos));
    const res = await PhotoStorageService.deletePhoto('1');
    expect(res.success).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    expect(res.data && res.data.find(p => p.id === '1')).toBeUndefined();
  });

  it('clearAllPhotos removes storage key', async () => {
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValueOnce(undefined);
    const res = await PhotoStorageService.clearAllPhotos();
    expect(res.success).toBe(true);
    expect(AsyncStorage.removeItem).toHaveBeenCalled();
  });

  it('getStorageStats returns counts and sizes', async () => {
    const photos = [
      { id: '1', uri: 'a', timestamp: 1, size: 10 },
      { id: '2', uri: 'b', timestamp: 2, size: 20 },
    ];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(photos));
    const stats = await PhotoStorageService.getStorageStats();
    expect(stats.photoCount).toBe(2);
    expect(stats.totalSize).toBe(30);
  });
});
