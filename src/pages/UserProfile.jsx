import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { generateCovers, generateArticleCover } from '../utils/coverGenerator'
import EditProfileModal from '../components/EditProfileModal'

// 默认封面图列表
const DEFAULT_COVERS = [
  '/covers/geometric-1.jpg',
  '/covers/geometric-2.jpg',
  '/covers/geometric-3.jpg'
]

export default function UserProfile() {
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState([])
  const [coverImage, setCoverImage] = useState(DEFAULT_COVERS[0])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isChangingCover, setIsChangingCover] = useState(false)
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    joinDate: '',
    bio: '这里是个人简介...',
    displayName: '',
    website: '',
    location: ''
  })
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUserStats(prev => ({
        ...prev,
        joinDate: new Date(currentUser.metadata.creationTime).toLocaleDateString('zh-CN')
      }))
      
      setPosts([
      {
        id: 1,
          title: '示例文章1',
          excerpt: '这是一篇示例文章的摘要...',
          createdAt: '2024-03-20',
          views: 123,
          coverImage: generateArticleCover(1)
        },
        {
          id: 2,
          title: '示例文章2',
          excerpt: '这是另一篇示例文章的摘要...',
          createdAt: '2024-03-19',
          views: 456,
          coverImage: '/article-covers/2.jpg'
        }
      ])
    }
  }, [currentUser])

  useEffect(() => {
    async function loadCovers() {
      const covers = await generateCovers();
      setCoverImage(covers[0]); // 设置默认封面
    }
    loadCovers();
  }, []);

  const handleSaveProfile = useCallback((formData) => {
    setUserStats(prev => ({
      ...prev,
      ...formData
    }));
    // TODO: 将更新保存到数据库
  }, []);

  const handleChangeCover = useCallback(async () => {
    setIsChangingCover(true);
    try {
      const covers = await generateCovers();
      const currentIndex = DEFAULT_COVERS.indexOf(coverImage);
      const nextIndex = (currentIndex + 1) % covers.length;
      setCoverImage(covers[nextIndex]);
    } finally {
      setIsChangingCover(false);
    }
  }, [coverImage]);

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    setUploadingCover(true);
    try {
      // 创建预览URL
      const previewUrl = URL.createObjectURL(file);
      setCoverImage(previewUrl);
      
      // TODO: 实际项目中，这里应该上传到服务器
      // const uploadedUrl = await uploadImage(file);
      // setCoverImage(uploadedUrl);
    } catch (error) {
      console.error('封面上传失败:', error);
      alert('封面上传失败，请重试');
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 返回首页按钮 */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          to="/home"
          className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 text-gray-700 hover:text-indigo-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>返回首页</span>
        </Link>
      </div>

      {/* 装饰性几何图形 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-100/30 rounded-full transform translate-x-1/2 -translate-y-1/2 blur-3xl"/>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary-200/20 rounded-full transform -translate-x-1/2 translate-y-1/2 blur-3xl"/>
        <svg className="absolute top-1/4 right-1/4 text-primary-200/20 w-64 h-64" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="1"/>
        </svg>
      </div>

      {/* 主要内容 */}
      <div className="relative">
        {/* 封面图 */}
        <div className="relative h-80 overflow-hidden">
          <img 
            src={coverImage} 
            alt="Profile Cover" 
            className="w-full h-full object-cover transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"/>
          
          {/* 更换封面按钮组 */}
          <div className="absolute top-4 right-4 flex gap-2">
            {/* 生成封面按钮 */}
            <button
              onClick={handleChangeCover}
              disabled={isChangingCover}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-all border border-white/20"
            >
              {isChangingCover ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <span>随机生成</span>
                </>
              )}
            </button>

            {/* 上传封面按钮 */}
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-all border border-white/20 cursor-pointer">
              {uploadingCover ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>上传中...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>上传封面</span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleCoverUpload}
                disabled={uploadingCover}
              />
            </label>
          </div>
        </div>

        {/* 个人信息卡片 */}
        <div className="max-w-7xl mx-auto px-4 transform -translate-y-32">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-primary-100">
            <div className="p-8">
              <div className="flex items-start gap-8">
                {/* 头像区域 */}
                <div className="flex-shrink-0">
                  <div className="w-40 h-40 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden">
                    <span className="text-6xl text-primary-600">
                      {currentUser?.email?.[0].toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* 用户信息 */}
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {userStats.displayName || currentUser?.email}
                      </h1>
                      <p className="text-gray-600 mb-2">加入时间：{userStats.joinDate}</p>
                      {userStats.location && (
                        <p className="text-gray-600 mb-2">
                          <span className="inline-block mr-2">📍</span>
                          {userStats.location}
                        </p>
                      )}
                      {userStats.website && (
                        <a 
                          href={userStats.website}
                      target="_blank"
                      rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
                        >
                          🔗 {userStats.website}
                        </a>
                      )}
                      <p className="text-gray-700 max-w-2xl mt-4">{userStats.bio}</p>
                </div>
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-xl transition-all duration-200 border border-gray-200 shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      编辑资料
                    </button>
            </div>
            
            {/* 统计数据 */}
                  <div className="flex gap-8 mt-8">
              <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{posts.length}</div>
                      <div className="text-sm text-gray-600">文章</div>
              </div>
              <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{userStats.totalViews}</div>
                      <div className="text-sm text-gray-600">阅读</div>
              </div>
              <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">0</div>
                      <div className="text-sm text-gray-600">获赞</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 文章列表 */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">我的文章</h2>
              <Link 
                to="/new-post"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-xl transition-all duration-200 border border-gray-200 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
                写新文章
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map(post => (
                <Link key={post.id} to={`/posts/${post.id}`}>
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-primary-50">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={post.coverImage} 
                        alt={post.title}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-4">{post.excerpt}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>发布于 {post.createdAt}</span>
                        <span>{post.views} 次阅读</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {posts.length === 0 && (
              <div className="text-center py-16 bg-white/80 backdrop-blur-xl rounded-2xl">
                <div className="text-6xl mb-4">✍️</div>
                <p className="text-gray-600 mb-6">开始创作您的第一篇文章吧</p>
                <Link 
                  to="/new-post"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-primary-100 text-gray-900 rounded-xl hover:bg-primary-200 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  开始写作
                </Link>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* 编辑资料模态框 */}
        <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userStats={userStats}
          onSave={handleSaveProfile}
        />
    </div>
  )
}