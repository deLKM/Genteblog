import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import UserMenu from '../components/UserMenu'
import CategoryTabs from '../components/CategoryTabs'
import ActionButtons from '../components/ActionButtons'
import { useAuth } from '../contexts/AuthContext'

function PostList() {
  const { currentUser } = useAuth()
  const [posts] = useState([
    {
      id: 1,
      title: 'Default title',
      excerpt: 'Default content',
      author: {
        id: 1,
        name: 'Default name',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
      },
      category: 'Default category',
      tags: ['Default tag'],
      likes: 128,
      comments: 32,
      date: '2024-03-20'
    },
    {
      id: 2,
      title: 'Default title',
      excerpt: 'Default content',
      author: {
        id: 2,
        name: 'Default name',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy'
      },
      category: 'CSS',
      tags: ['TailwindCSS', 'UI设计'],
      likes: 96,
      comments: 18,
      date: '2024-03-19'
    }
  ])

  const categories = [
    '全部', '最热门'
  ]

  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [filteredPosts, setFilteredPosts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [layoutMode, setLayoutMode] = useState('vertical')
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const sidebarRef = useRef(null)
  const isResizing = useRef(false)

  // 搜索建议
  const searchSuggestions = [
    { type: 'recent', text: 'Default text' },
    { type: 'recent', text: 'Default text' },
    { type: 'hot', text: 'Default text' },
    { type: 'hot', text: 'Default text' },
  ]

  // 添加视图类型状态
  const [viewType, setViewType] = useState('home') // 'home', 'explore', 'trending'

  // 获取不同视图的文章
  useEffect(() => {
    // 模拟不同视图的数据获取
    const fetchPosts = () => {
      switch (viewType) {
        case 'explore':
          // 这里应该从API获取发现页的文章
          setFilteredPosts(posts.filter(post => post.isRecommended))
          break
        case 'trending':
          // 这里应该从API获取趋势文章
          setFilteredPosts(posts.sort((a, b) => b.likes - a.likes))
          break
        default:
          // 首页视图
          if (selectedCategory === '全部') {
            setFilteredPosts(posts)
          } else {
            setFilteredPosts(posts.filter(post => post.category === selectedCategory))
          }
      }
    }

    fetchPosts()
  }, [viewType, selectedCategory, posts])

  // 渲染不同视图的标题
  const renderViewTitle = () => {
    switch (viewType) {
      case 'explore':
        return '发现新内容'
      case 'trending':
        return '热门趋势'
      default:
        return '最新文章'
    }
  }

  useEffect(() => {
    // 根据选中的分类过滤文章
    if (selectedCategory === '全部') {
      setFilteredPosts(posts)
    } else {
      setFilteredPosts(posts.filter(post => post.category === selectedCategory))
    }
  }, [selectedCategory, posts])

  const renderLayoutSettings = () => (
    <div className="px-4 py-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        布局设置
      </h3>
      <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50">
        <button
          onClick={() => setLayoutMode('vertical')}
          className={`flex items-center justify-center p-2 rounded-md flex-1 ${
            layoutMode === 'vertical'
              ? 'bg-white shadow-sm text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={() => setLayoutMode('horizontal')}
          className={`flex items-center justify-center p-2 rounded-md flex-1 ${
            layoutMode === 'horizontal'
              ? 'bg-white shadow-sm text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </button>
      </div>
    </div>
  )

  // 处理侧边栏拖动调整宽度
  const handleMouseDown = (e) => {
    isResizing.current = true
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e) => {
    if (!isResizing.current) return
    
    requestAnimationFrame(() => {
      // 限制最小和最大宽度
      const newWidth = Math.max(200, Math.min(400, e.clientX))
      setSidebarWidth(newWidth)
      
      // 同步更新顶部栏的样式
      const header = document.querySelector('.header-container')
      if (header) {
        header.style.marginLeft = `-${newWidth}px`
        header.style.paddingLeft = `${newWidth + 24}px`
      }
    })
  }

  const handleMouseUp = () => {
    isResizing.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
      <div className="flex">
        {/* 左侧边栏 */}
        <aside 
          ref={sidebarRef}
          style={{ width: `${sidebarWidth}px` }}
          className="fixed h-screen bg-white shadow-sm overflow-y-auto transition-none"
        >
          {/* Logo 区域 */}
          <div className="p-6 border-b border-gray-100">
            <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              GenteBlog
            </Link>
          </div>
          
          <nav className="p-4">
            {/* 主要导航按钮 */}
            <div className="space-y-2 mb-8">
              <button 
                onClick={() => setViewType('home')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  viewType === 'home'
                    ? 'text-indigo-600 bg-indigo-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>首页</span>
              </button>

              <button
                onClick={() => setViewType('explore')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  viewType === 'explore'
                    ? 'text-indigo-600 bg-indigo-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>发现</span>
              </button>

              <button
                onClick={() => setViewType('trending')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  viewType === 'trending'
                    ? 'text-indigo-600 bg-indigo-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>趋势</span>
              </button>
            </div>

            {/* 分类列表 */}
            <div className="mb-8">
              <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                分类浏览
              </h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'text-indigo-600 bg-indigo-50 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{category}</span>
                    {selectedCategory === category && (
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 个人收藏区 */}
            <div className="mb-8">
              <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                个人收藏
              </h3>
              <div className="space-y-1">
                <Link 
                  to="/following" 
                  className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>关注</span>
                  </div>
                  <span className="text-xs text-gray-500">12</span>
                </Link>
                <Link 
                  to="/bookmarks" 
                  className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>收藏</span>
                  </div>
                  <span className="text-xs text-gray-500">23</span>
                </Link>
              </div>
            </div>

            {/* 设置区域 */}
            <div>
              <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                设置
              </h3>
              <div className="space-y-4">
                {/* 偏好设置按钮 */}
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>偏好设置</span>
                </button>
                
                {/* 布局设置 */}
                {renderLayoutSettings()}
              </div>
            </div>
          </nav>

          {/* 拖动调整宽度的把手 */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-500/50 transition-colors"
            onMouseDown={handleMouseDown}
          />
        </aside>

        {/* 主内容区域 */}
        <main 
          className="flex-1"
          style={{ marginLeft: `${sidebarWidth}px`, transition: 'margin-left 0ms' }}
        >
          {/* 顶部导航栏 */}
          <header className="sticky top-0 bg-white/80 backdrop-blur-sm shadow-sm z-10">
            <div 
              className="header-container flex items-center justify-between h-16 px-6 transition-none"
              style={{ 
                marginLeft: `-${sidebarWidth}px`, 
                paddingLeft: `${sidebarWidth + 24}px`
              }}
            >
              {/* 搜索栏 */}
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="搜索文章、用户或标签"
                    className="w-full bg-gray-50 border border-gray-200 rounded-full pl-12 pr-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 右侧操作区 - 简化布局 */}
              <div className="flex items-center ml-4 space-x-4">
                <Link
                  to="/new-post"
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>写文章</span>
                </Link>

                {/* 用户菜单组件 */}
                <UserMenu />
              </div>
            </div>

            {/* 搜索建议下拉框 */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 bg-white shadow-lg rounded-lg mt-1 py-2 border border-gray-100 mx-6">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            )}
          </header>

          {/* 文章列表 - 扩展内容区域 */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {renderViewTitle()}
            </h2>
            <div className={`max-w-5xl mx-auto ${
              layoutMode === 'horizontal' ? 'grid grid-cols-2 gap-6' : 'space-y-4'
            }`}>
              {filteredPosts.map(post => (
                <article
                  key={post.id}
                  className={`bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 ${
                    layoutMode === 'horizontal' ? 'flex flex-col' : ''
                  }`}
                >
                  <div className="flex items-center mb-4">
                    <Link to={`/user/${post.author.id}`} className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full ring-2 ring-white"
                        src={post.author.avatar}
                        alt={post.author.name}
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                        <p className="text-xs text-gray-500">{post.date}</p>
                      </div>
                    </Link>
                  </div>
                  <div>
                    <Link to={`/post/${post.id}`}>
                      <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center text-sm">
                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                      </span>
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex space-x-4">
                      <button className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {post.likes}
                      </button>
                      <button className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.comments}
                      </button>
                    </div>
                    <button className="text-gray-500 hover:text-indigo-600 transition-colors">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <ActionButtons
                      initialFollowed={post.isFollowed}
                      initialBookmarked={post.isBookmarked}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PostList 