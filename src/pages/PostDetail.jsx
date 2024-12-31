import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { marked } from 'marked'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-json'

function PostDetail() {
  const { id } = useParams()
  const [post] = useState({
    id: 1,
    title: 'Default title',
    content: 'Default content',
    author: {
      id: 1,
      name: '张三',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      bio: 'Default bio'
    },
    category: 'Default category',
    tags: ['Default tag'],
    likes: 128,
    comments: [
      {
        id: 1,
        author: {
          name: '李四',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy'
        },
        content: 'Default comment',
        date: '2024-03-20 14:30'
      }
    ],
    date: '2024-03-20'
  })

  useEffect(() => {
    // 配置 marked
    marked.setOptions({
      highlight: function(code, lang) {
        if (Prism.languages[lang]) {
          return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
      }
    });
    
    // 渲染完成后执行代码高亮
    Prism.highlightAll();
  }, [post.content]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,#f3f4f6_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
        <div className="absolute -left-64 top-1/3 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl"></div>
        <div className="absolute -right-64 bottom-1/3 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full px-4">
        <div className="max-w-[800px] mx-auto py-8">
          {/* 返回按钮 */}
          <Link 
            to="/"
            className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>

          {/* 文章头部 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <div className="flex items-center justify-between mb-6">
              <Link to={`/user/${post.author.id}`} className="flex items-center group">
                <img
                  className="h-12 w-12 rounded-full ring-2 ring-white group-hover:ring-indigo-200 transition-all"
                  src={post.author.avatar}
                  alt={post.author.name}
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {post.author.name}
                  </p>
                  <p className="text-xs text-gray-500">{post.author.bio}</p>
                </div>
              </Link>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors">
                关注作者
              </button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{post.date}</span>
              <span>阅读 {Math.floor(Math.random() * 1000)}</span>
              <div className="flex items-center">
                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {post.category}
                </span>
              </div>
            </div>
          </div>

          {/* 文章内容 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-6">
            <div 
              className="prose prose-indigo prose-img:rounded-lg prose-pre:bg-gray-800 prose-pre:shadow-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: marked(post.content)
              }} 
            />
          </div>

          {/* 文章操作 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                  <svg className="h-6 w-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                  <svg className="h-6 w-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{post.comments.length}</span>
                </button>
              </div>
              <div className="flex space-x-2">
                <button className="text-gray-500 hover:text-indigo-600 transition-colors p-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button className="text-gray-500 hover:text-indigo-600 transition-colors p-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 评论区 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">评论 ({post.comments.length})</h3>
            
            {/* 评论输入框 */}
            <div className="mb-6">
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="3"
                placeholder="写下你的评论..."
              ></textarea>
              <div className="mt-2 flex justify-end">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                  发表评论
                </button>
              </div>
            </div>

            {/* 评论列表 */}
            <div className="space-y-4">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex space-x-3">
                  <img
                    className="h-8 w-8 rounded-full ring-2 ring-white"
                    src={comment.author.avatar}
                    alt={comment.author.name}
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-500">{comment.date}</span>
                      </div>
                      <p className="text-gray-600">{comment.content}</p>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <button className="hover:text-indigo-600 transition-colors">回复</button>
                      <button className="hover:text-indigo-600 transition-colors">点赞</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostDetail 