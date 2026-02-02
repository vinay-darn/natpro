import { postsAPI } from '../../src/store/postsSaga';

describe('postsAPI', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('fetchAllPosts returns data on success', async () => {
    const mockData = [{ id: 1, userId: 1, title: 't', body: 'b' }];
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockData) });

    const res = await postsAPI.fetchAllPosts();
    expect(res).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalled();
  });

  it('fetchAllPosts throws on network error', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(postsAPI.fetchAllPosts()).rejects.toThrow('HTTP error');
  });

  it('fetchPostById returns post data', async () => {
    const mockPost = { id: 2, userId: 2, title: 'x', body: 'y' };
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockPost) });

    const res = await postsAPI.fetchPostById(2);
    expect(res).toEqual(mockPost);
  });

  it('fetchPostById throws on 404', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });
    await expect(postsAPI.fetchPostById(999)).rejects.toThrow('HTTP error');
  });
});
