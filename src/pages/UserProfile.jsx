import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPublishedPosts } from '../services/postService';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

export default function UserProfile() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userStats, setUserStats] = useState({
    postCount: 0,
    likeCount: 0,
    commentCount: 0
  });
  const [userInteractions, setUserInteractions] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [retryCount, setRetryCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // 检查用户登录状态
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  // 处理头像上传
  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const storage = getStorage();
      const avatarRef = ref(storage, `users/${currentUser.uid}/avatar.${file.name.split('.').pop()}`);
      await uploadBytes(avatarRef, file);
      const photoURL = await getDownloadURL(avatarRef);
      await updateProfile(currentUser, { photoURL });
      window.location.reload(); // 刷新页面以显示新头像
    } catch (error) {
      console.error('上传头像失败:', error);
      setError('上传头像失败');
    } finally {
      setUploading(false);
    }
  };

  // 处理封面图片上传
  const handleCoverChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const storage = getStorage();
      const coverRef = ref(storage, `users/${currentUser.uid}/cover.${file.name.split('.').pop()}`);
      await uploadBytes(coverRef, file);
      const coverURL = await getDownloadURL(coverRef);
      setCoverImage(coverURL);
    } catch (error) {
      console.error('上传封面失败:', error);
      setError('上传封面失败');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);

        if (!userId || !currentUser) {
          throw new Error('无效的用户ID或未登录');
        }

        console.log('开始获取用户数据:', userId);
        const posts = await getPublishedPosts(userId);
        console.log('获取到的文章:', posts);

        if (!isMounted) return;

        if (!Array.isArray(posts)) {
          throw new Error('获取文章数据失败');
        }

        setUserPosts(posts);

        const stats = {
          postCount: posts.length,
          likeCount: posts.reduce((sum, post) => sum + (post.likeCount || 0), 0),
          commentCount: posts.reduce((sum, post) => sum + (post.commentCount || 0), 0)
        };
        console.log('计算的统计数据:', stats);
        
        if (!isMounted) return;
        setUserStats(stats);

        const interactions = posts.map(post => ({
          id: post._id,
          type: 'post',
          postId: post._id,
          postTitle: post.title,
          createdAt: new Date(post.metadata.publishedAt)
        }));
        
        if (!isMounted) return;
        setUserInteractions(interactions);

      } catch (err) {
        console.error('获取用户数据失败:', err);
        if (!isMounted) return;
        setError(err.message || '获取用户数据失败');
        
        if (retryCount < 3) {
          const retryDelay = 1000 * Math.pow(2, retryCount);
          setTimeout(() => {
            if (isMounted) {
              setRetryCount(prev => prev + 1);
            }
          }, retryDelay);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (userId && currentUser) {
      fetchUserData();
    }

    return () => {
      isMounted = false;
    };
  }, [userId, currentUser, retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <div className="mt-4 text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <div className="space-x-4">
            {retryCount < 3 && (
              <button
                onClick={() => setRetryCount(prev => prev + 1)}
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                重试
              </button>
            )}
            <Link
              to="/home"
              className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentUser = currentUser?.uid === userId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 封面图片 */}
      <div className="relative h-64 bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden">
        {coverImage && (
          <img
            src={coverImage}
            alt="封面"
            className="w-full h-full object-cover"
          />
        )}
        {isCurrentUser && (
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg hover:bg-white transition-colors duration-200 flex items-center space-x-2"
            disabled={uploading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{uploading ? '上传中...' : '更换封面'}</span>
          </button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />
      </div>

      {/* 用户信息头部 */}
      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start space-x-6">
            {/* 用户头像 */}
            <div className="relative flex-shrink-0">
              <img
                src={currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email || 'default'}`}
                alt="用户头像"
                className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
              />
              {isCurrentUser && (
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors duration-200"
                  disabled={uploading}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* 用户信息 */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentUser?.displayName || '用户'}
                  </h1>
                  <p className="mt-1 text-gray-500">
                    {currentUser?.email}
                  </p>
                </div>
                {isCurrentUser && (
                  <Link
                    to="/settings"
                    className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    编辑资料
                  </Link>
                )}
              </div>
              
              {/* 统计数据 */}
              <div className="mt-6 flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">{userStats.postCount}</div>
                  <div className="text-sm text-gray-500">文章</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">{userStats.likeCount}</div>
                  <div className="text-sm text-gray-500">获赞</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">{userStats.commentCount}</div>
                  <div className="text-sm text-gray-500">评论</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 内容标签页 */}
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'posts'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                文章
              </button>
              <button
                onClick={() => setActiveTab('interactions')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'interactions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                动态
              </button>
            </nav>
          </div>

          {/* 文章列表 */}
          {activeTab === 'posts' && (
            <div className="mt-6 space-y-6">
              {userPosts.length > 0 ? (
                userPosts.map(post => (
                  <article key={post._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                    <Link to={`/post/${post._id}`} className="block">
                      <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200">
                        {post.title}
                      </h2>
                      <p className="mt-2 text-gray-500 line-clamp-2">{post.summary}</p>
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <span>{formatDistanceToNow(new Date(post.metadata.publishedAt), { addSuffix: true, locale: zhCN })}</span>
                        <span className="mx-2">·</span>
                        <span>{post.viewCount || 0} 次阅读</span>
                        <span className="mx-2">·</span>
                        <span>{post.likeCount || 0} 次点赞</span>
                      </div>
                    </Link>
                  </article>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-gray-500">暂无文章</p>
                  {isCurrentUser && (
                    <Link
                      to="/new-post"
                      className="mt-4 inline-flex items-center px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      写文章
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 动态列表 */}
          {activeTab === 'interactions' && (
            <div className="mt-6 space-y-4">
              {userInteractions.length > 0 ? (
                userInteractions.map(interaction => (
                  <div key={interaction.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center text-sm text-gray-500">
                      <span>发布了文章</span>
                      <span className="mx-2">·</span>
                      <span>{formatDistanceToNow(interaction.createdAt, { addSuffix: true, locale: zhCN })}</span>
                    </div>
                    <Link
                      to={`/post/${interaction.postId}`}
                      className="mt-2 block text-gray-900 hover:text-indigo-600 transition-colors duration-200"
                    >
                      {interaction.postTitle}
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-gray-500">暂无动态</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}