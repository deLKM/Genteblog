import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPublishedPosts } from '../services/postService';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

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

  // 检查用户登录状态
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);

        // 检查用户ID是否有效
        if (!userId || !currentUser) {
          throw new Error('无效的用户ID或未登录');
        }

        console.log('开始获取用户数据:', userId);

        // 获取用户的已发布文章
        const posts = await getPublishedPosts(userId);
        console.log('获取到的文章:', posts);

        if (!isMounted) return;

        if (!Array.isArray(posts)) {
          throw new Error('获取文章数据失败');
        }

        setUserPosts(posts);

        // 计算用户统计数据
        const stats = {
          postCount: posts.length,
          likeCount: posts.reduce((sum, post) => sum + (post.likeCount || 0), 0),
          commentCount: posts.reduce((sum, post) => sum + (post.commentCount || 0), 0)
        };
        console.log('计算的统计数据:', stats);
        
        if (!isMounted) return;
        setUserStats(stats);

        // 获取用户互动记录
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
        
        // 如果失败次数小于3次，尝试重试
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

  // 显示加载状态
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

  // 显示错误信息
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <div className="space-x-4">
            {retryCount < 3 && (
              <button
                onClick={() => setRetryCount(prev => prev + 1)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                重试
              </button>
            )}
            <Link
              to="/home"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 用户信息头部 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start space-x-6">
            {/* 用户头像 */}
            <div className="flex-shrink-0">
              <img
                src={currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email || 'default'}`}
                alt="用户头像"
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>

            {/* 用户信息 */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentUser?.displayName || '用户'}
              </h1>
              <p className="mt-1 text-gray-500">
                {currentUser?.email}
              </p>
              
              {/* 统计数据 */}
              <div className="mt-4 flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-900">{userStats.postCount}</div>
                  <div className="text-sm text-gray-500">文章</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-900">{userStats.likeCount}</div>
                  <div className="text-sm text-gray-500">获赞</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-900">{userStats.commentCount}</div>
                  <div className="text-sm text-gray-500">评论</div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            {currentUser?.uid === userId && (
              <div className="flex-shrink-0">
                <Link
                  to="/settings"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  编辑资料
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 内容标签页 */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              文章
            </button>
            <button
              onClick={() => setActiveTab('interactions')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
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
                <article key={post._id} className="bg-white rounded-lg shadow p-6">
                  <Link to={`/post/${post._id}`} className="block">
                    <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600">
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
              <div className="text-center text-gray-500 py-12">
                暂无文章
              </div>
            )}
          </div>
        )}

        {/* 动态列表 */}
        {activeTab === 'interactions' && (
          <div className="mt-6 space-y-4">
            {userInteractions.length > 0 ? (
              userInteractions.map(interaction => (
                <div key={interaction.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>
                      发布了文章
                    </span>
                    <span className="mx-2">·</span>
                    <span>
                      {formatDistanceToNow(interaction.createdAt, { addSuffix: true, locale: zhCN })}
                    </span>
                  </div>
                  <Link
                    to={`/post/${interaction.postId}`}
                    className="mt-2 block text-gray-900 hover:text-indigo-600"
                  >
                    {interaction.postTitle}
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-12">
                暂无动态
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}