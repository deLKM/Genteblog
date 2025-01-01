import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Drafts() {
  const { currentUser } = useAuth();
  const [drafts] = useState([
    {
      id: 1,
      title: '未完成的文章',
      excerpt: '这是一篇正在编写的文章...',
      lastModified: '2024-03-21 14:30',
      coverImage: 'https://source.unsplash.com/random/800x600?tech,1'
    },
    {
      id: 2,
      title: '技术探讨草稿',
      excerpt: '关于新技术的一些思考...',
      lastModified: '2024-03-20 16:45',
      coverImage: 'https://source.unsplash.com/random/800x600?tech,2'
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"/>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100/50 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"/>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-50/30 rotate-45 transform -translate-x-1/2 -translate-y-1/2"/>
      </div>

      {/* 返回首页按钮 */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          to="/home"
          className="flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg hover:bg-white transition-all duration-200 text-gray-700 hover:text-indigo-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>返回首页</span>
        </Link>
      </div>

      {/* 写新文章按钮 */}
      <div className="fixed top-6 right-0 z-50">
        <Link
          to="/new-post"
          className="flex items-center space-x-2 pl-6 pr-8 py-3 bg-indigo-600 text-white rounded-l-full shadow-lg hover:bg-indigo-700 transition-all duration-200 group"
        >
          <svg className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>写新文章</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的草稿</h1>
        </div>

        {/* 草稿列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map(draft => (
            <div key={draft.id} className="group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
              {/* 封面图片 */}
              <div className="aspect-video overflow-hidden">
                <img
                  src={draft.coverImage}
                  alt={draft.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* 内容区域 */}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
                  {draft.title}
                </h2>
                <p className="text-gray-500 mb-4 line-clamp-2">
                  {draft.excerpt}
                </p>

                {/* 底部信息 */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {formatDistanceToNow(new Date(draft.lastModified), { addSuffix: true, locale: zhCN })}
                  </span>
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                      title="编辑"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      title="删除"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* 悬浮时显示的编辑按钮 */}
              <Link
                to={`/edit/${draft.id}`}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <button className="px-6 py-3 bg-white rounded-full text-gray-900 font-medium transform scale-95 group-hover:scale-100 transition-transform duration-200">
                  继续编辑
                </button>
              </Link>
            </div>
          ))}

          {/* 空状态 */}
          {drafts.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-gray-500 mb-6">暂无草稿</p>
              <Link
                to="/new-post"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                开始写作
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 