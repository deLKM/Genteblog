import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Bookmarks() {
  const { currentUser } = useAuth();
  const [bookmarks] = useState([
    {
      id: 1,
      title: '深入理解 React 18 新特性',
      excerpt: '本文将详细介绍 React 18 带来的重要更新...',
      author: {
        name: '张三',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
      },
      publishDate: '2024-03-20',
      category: 'React',
      coverImage: 'https://source.unsplash.com/random/800x600?react,1'
    },
    {
      id: 2,
      title: 'TailwindCSS 实战技巧',
      excerpt: '探索 TailwindCSS 在实际项目中的应用...',
      author: {
        name: '李四',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy'
      },
      publishDate: '2024-03-19',
      category: 'CSS',
      coverImage: 'https://source.unsplash.com/random/800x600?code,2'
    }
  ]);

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">我的收藏</h1>
          <div className="flex space-x-4">
            <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              最近收藏
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
              分类浏览
            </button>
          </div>
        </div>

        {bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map(bookmark => (
              <div key={bookmark.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={bookmark.coverImage}
                    alt={bookmark.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      className="h-8 w-8 rounded-full mr-2"
                      src={bookmark.author.avatar}
                      alt={bookmark.author.name}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{bookmark.author.name}</p>
                      <p className="text-xs text-gray-500">{bookmark.publishDate}</p>
                    </div>
                  </div>
                  <Link to={`/posts/${bookmark.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
                      {bookmark.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-4">{bookmark.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {bookmark.category}
                    </span>
                    <button className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无收藏</h3>
            <p className="mt-1 text-sm text-gray-500">浏览文章时点击收藏按钮将文章加入收藏夹</p>
            <div className="mt-6">
              <Link
                to="/home"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                浏览文章
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 