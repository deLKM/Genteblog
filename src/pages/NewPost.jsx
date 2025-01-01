import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MdEditor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';
import 'react-markdown-editor-lite/lib/index.css';
import '../styles/animations.css';
import { savePost } from '../services/postService';

// 初始化 Markdown 解析器
const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
});

export default function NewPost() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    coverImage: null
  });
  const [message, setMessage] = useState({ type: '', content: '' });
  const [previewMode, setPreviewMode] = useState(false);

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
    }
  }, [authLoading, currentUser, navigate]);

  // 如果正在检查认证状态，显示加载动画
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      content: value || ''
    }));
  }, []);

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({
          type: 'error',
          content: '图片大小不能超过 2MB'
        });
        return;
      }
      setFormData(prev => ({
        ...prev,
        coverImage: file
      }));
    }
  };

  const handleSave = async (isDraft = true) => {
    if (!formData.title.trim()) {
      setMessage({
        type: 'error',
        content: '请输入文章标题'
      });
      return;
    }

    if (!formData.content.trim()) {
      setMessage({
        type: 'error',
        content: '请输入文章内容'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const savedPost = await savePost(formData, currentUser.uid, isDraft);
      
      setMessage({
        type: 'success',
        content: isDraft ? '草稿已保存' : '文章已发布'
      });
      
      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        navigate(isDraft ? '/drafts' : `/post/${savedPost.id}`);
      }, 1500);
    } catch (error) {
      console.error('保存失败:', error);
      setMessage({
        type: 'error',
        content: '保存失败，请重试'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = ({ text }) => {
    setFormData(prev => ({
      ...prev,
      content: text
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-50/50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 -right-4 w-72 h-72 bg-purple-50/50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-pink-50/50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80008012_1px,transparent_1px),linear-gradient(to_bottom,#80008012_1px,transparent_1px)] bg-[size:14px_14px]"></div>
      </div>

      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* 返回按钮 */}
            <Link
              to="/home"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回首页
            </Link>

            {/* 操作按钮 */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {previewMode ? '编辑模式' : '预览模式'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSave(true)}
                className={`inline-flex items-center px-4 py-2 text-gray-700 hover:text-indigo-600 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {loading ? '保存中...' : '保存草稿'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSave(false)}
                className={`inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {loading ? '发布中...' : '发布文章'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* 消息提示 */}
        {message.content && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}>
            {message.content}
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
          {/* 标题输入 */}
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="输入文章标题..."
            className="w-full px-6 py-4 text-2xl font-medium text-gray-900 bg-transparent border-0 border-b border-gray-100 rounded-t-xl focus:ring-0 focus:border-indigo-200"
            required
          />

          {/* 分类和标签 */}
          <div className="grid grid-cols-2 gap-6 px-6 py-4 border-b border-gray-100">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                分类
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="输入分类"
                required
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                标签
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="使用逗号分隔多个标签"
              />
            </div>
          </div>

          {/* Markdown 编辑器 */}
          <div className="border-b border-gray-100">
            <MdEditor
              value={formData.content}
              renderHTML={text => mdParser.render(text)}
              onChange={handleEditorChange}
              style={{ height: '600px' }}
              config={{
                view: {
                  menu: true,
                  md: true,
                  html: previewMode
                },
                canView: {
                  menu: true,
                  md: true,
                  html: true,
                  fullScreen: true,
                  hideMenu: true
                }
              }}
              placeholder="使用 Markdown 格式编写文章..."
            />
          </div>

          {/* 封面图片上传 */}
          <div className="px-6 py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              封面图片
            </label>
            <div className="flex items-center space-x-4">
              {formData.coverImage && (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(formData.coverImage)}
                    alt="封面预览"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, coverImage: null }))}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <label className="flex-1 flex items-center justify-center h-20 px-4 border border-gray-200 border-dashed rounded-lg hover:border-indigo-500 cursor-pointer transition-colors">
                <div className="text-center">
                  <svg className="mx-auto h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-1 text-xs text-gray-500">建议尺寸 1200x600，最大 2MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 