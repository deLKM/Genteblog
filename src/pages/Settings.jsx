import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Settings() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    bio: '',
    website: '',
    location: '',
    photoURL: currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email || 'default'}`
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setMessage({
        type: 'error',
        content: '请选择图片文件'
      });
      return;
    }

    // 验证文件大小（最大 2MB）
    if (file.size > 2 * 1024 * 1024) {
      setMessage({
        type: 'error',
        content: '图片大小不能超过 2MB'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const storage = getStorage();
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${currentUser.uid}_${Date.now()}.${fileExt}`;
      const storageRef = ref(storage, fileName);

      // 上传文件
      await uploadBytes(storageRef, file);
      
      // 获取下载链接
      const downloadURL = await getDownloadURL(storageRef);

      // 更新用户头像
      await updateProfile(currentUser, {
        photoURL: downloadURL
      });

      // 更新本地状态
      setFormData(prev => ({
        ...prev,
        photoURL: downloadURL
      }));

      setMessage({
        type: 'success',
        content: '头像已更新'
      });
    } catch (error) {
      console.error('头像上传失败:', error);
      setMessage({
        type: 'error',
        content: '头像上传失败，请重试'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      // 更新 Firebase Auth 用户信息
      await updateProfile(currentUser, {
        displayName: formData.displayName
      });

      // TODO: 在这里添加更新用户其他信息到数据库的逻辑
      // 例如：bio, website, location 等信息需要存储到 Firestore

      setMessage({
        type: 'success',
        content: '个人资料已更新'
      });
    } catch (error) {
      console.error('更新失败:', error);
      setMessage({
        type: 'error',
        content: '更新失败，请重试'
      });
    } finally {
      setLoading(false);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">账号设置</h1>

          {/* 设置选项卡 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'profile'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  个人资料
                </button>
                <button
                  onClick={() => setActiveTab('notification')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'notification'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  通知设置
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* 消息提示 */}
              {message.content && (
                <div className={`mb-4 p-4 rounded-md ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.content}
                </div>
              )}

              {activeTab === 'profile' && (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* 头像设置 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">头像</label>
                      <div className="flex items-center">
                        <div className="relative group">
                          <img
                            className="h-16 w-16 rounded-full ring-2 ring-white object-cover"
                            src={formData.photoURL}
                            alt="用户头像"
                          />
                          <div
                            className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={handleAvatarClick}
                          >
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                        <button
                          type="button"
                          onClick={handleAvatarClick}
                          disabled={loading}
                          className={`ml-4 px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                            loading
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {loading ? '上传中...' : '更换头像'}
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        支持 JPG、PNG 格式，最大 2MB
                      </p>
                    </div>

                    {/* 昵称 */}
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                        昵称
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    {/* 个人简介 */}
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                        个人简介
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows="3"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    {/* 个人网站 */}
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                        个人网站
                      </label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://"
                      />
                    </div>

                    {/* 所在地 */}
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        所在地
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                    >
                      {loading ? '保存中...' : '保存修改'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'notification' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">评论通知</h3>
                      <p className="text-sm text-gray-500">当有人评论你的文章时通知你</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-indigo-600">
                      <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">点赞通知</h3>
                      <p className="text-sm text-gray-500">当有人点赞你的文章时通知你</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-gray-200">
                      <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">关注通知</h3>
                      <p className="text-sm text-gray-500">当有人关注你时通知你</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-indigo-600">
                      <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 