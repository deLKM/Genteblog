import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/home');
    } catch (err) {
      console.error('登录错误:', err);
      // 根据错误类型显示不同的错误信息
      switch (err.code) {
        case 'auth/invalid-credential':
          setError('邮箱或密码错误');
          break;
        case 'auth/user-not-found':
          setError('用户不存在');
          break;
        case 'auth/wrong-password':
          setError('密码错误');
          break;
        default:
          setError('登录失败: ' + err.message);
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 relative overflow-hidden">
      {/* 装饰性几何图形 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"/>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"/>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-100/30 rotate-45 transform -translate-x-1/2 -translate-y-1/2"/>
        <svg className="absolute top-0 right-0 text-primary-200/20 w-32 h-32 m-8" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8"/>
        </svg>
        <svg className="absolute bottom-0 left-0 text-primary-200/20 w-24 h-24 m-8" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="8"/>
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-primary-100">
          {/* 顶部装饰条 */}
          <div className="h-2 bg-gradient-to-r from-primary-400 to-primary-600"/>
          
          <div className="px-8 pt-6 pb-8">
            {/* Logo区域 */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Genteblog</h1>
              <p className="text-gray-700">欢迎回来，请登录您的账户</p>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 邮箱输入框 */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  邮箱地址
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-primary-200 rounded-full shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="请输入邮箱"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-primary-400">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 密码输入框 */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                  密码
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-primary-200 rounded-full shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="请输入密码"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-primary-400">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 记住我和忘记密码 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-primary-300 rounded transition-colors duration-200"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    记住我
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-gray-700 hover:text-primary-500 transition-colors duration-200">
                    忘记密码？
                  </a>
                </div>
              </div>

              {/* 登录按钮 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-6 border border-transparent rounded-full shadow-sm text-sm font-medium text-gray-900 bg-primary-200 hover:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {loading ? '登录中...' : '登录'}
              </button>

              {/* 注册链接 */}
              <div className="text-center mt-4">
                <span className="text-gray-700">还没有账户？</span>
                <Link to="/signup" className="ml-1 font-medium text-gray-900 hover:text-primary-500 transition-colors duration-200">
                  立即注册
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* 底部文字 */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>通过登录，即表示您同意我们的</p>
          <div className="mt-1">
            <a href="#" className="text-gray-700 hover:text-primary-500 transition-colors duration-200">服务条款</a>
            <span className="mx-2">和</span>
            <a href="#" className="text-gray-700 hover:text-primary-500 transition-colors duration-200">隐私政策</a>
          </div>
        </div>
      </div>
    </div>
  );
} 