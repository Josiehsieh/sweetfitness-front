import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lineLoading, setLineLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (tab === 'login') {
        res = await authApi.login(email, password);
      } else {
        if (!name.trim()) { setError('請輸入姓名'); setLoading(false); return; }
        res = await authApi.register(name, email, password);
      }
      localStorage.setItem('token', res.access_token);
      navigate('/schedule');
    } catch (err: any) {
      setError(err.message || '登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleLineLogin = async () => {
    setLineLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/auth/line/url`);
      if (!res.ok) throw new Error('LINE 登入暫時無法使用');
      const { url, state } = await res.json();
      sessionStorage.setItem('line_state', state);
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
      setLineLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/auth/google/url`);
      if (!res.ok) throw new Error('Google 登入暫時無法使用');
      const { url, state } = await res.json();
      sessionStorage.setItem('google_state', state);
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 gap-12 lg:gap-24 min-h-screen">
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-container/30 rounded-full blur-[100px] z-0"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary-container/20 rounded-full blur-[100px] z-0"></div>

      {/* Brand Section */}
      <div className="w-full max-w-md text-center lg:text-left space-y-6 z-10">
        <div className="inline-flex items-center justify-center lg:justify-start mb-4">
          <img src="/logo.png" alt="JosieFitness" className="h-28 w-auto object-contain" />
        </div>
        <div className="space-y-4">
          <h2 className="font-headline text-4xl lg:text-5xl font-bold leading-tight text-on-surface">
            讓健身像品嚐<br />
            <span className="text-secondary">馬卡龍</span>一樣愉悅
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-sm mx-auto lg:mx-0">
            尋找屬於你的運動風味，從瑜珈、皮拉提斯到核心訓練，在溫柔的氛圍中蛻變。
          </p>
        </div>
        <div className="hidden lg:grid grid-cols-2 gap-4 mt-12">
          <div className="h-48 rounded-lg overflow-hidden macaron-glow transform -rotate-2">
            <img alt="Yoga session" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnBSr3A9H8vqbtEd5yhHqOv3nhv3pnqUV2JyOEbey-Y5Sz09as8Bk3GPYfpRvR2fmqHQpvc8Z7GaokWDoAQGHrvApBEDQHy3vUiut91r7qS9PerYZdHZhAMbBoA4Qx2GQvrhNeEfQt6iYt7P9rsoPDpaC33lMPMuAoYDD8yIA9I8xwHgCFpwbo4xkNd-7-R9kiAO3HQb9_n1kMn-0Iu4f_2KW4wsOpHakKrbPkXHH0-3HhUdhnJNH7u2K1OUwTVq2rhIb59AH_mHc" />
          </div>
          <div className="h-48 rounded-lg overflow-hidden macaron-glow transform rotate-3 mt-8">
            <img alt="Macaron aesthetic gym" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_6lauIo_yaeWt3WsariyShDmM6jXFoKWwb-0GlKYvtt4fnBid5eMwjKS9dsbzT6JIwojIZaOvNQj0OSOn6_V1H1j0YzUEnCD9VSf6oHlGiiui7jZJonA5uReYJhsICeFtRKgOwH9uEfraB76dGTVTbUJHrpgWEcd8C8t5iDJKptrrzOveDfyiilrfnXcNnwTv3_9I9U7Ab9uikNoauSvkxiSowSYVBwBnYICj3Dy7Oxk-fwInEmj1KYX__RK4w2T1Mo0GmMoEp8s" />
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[480px] bg-surface-container-lowest p-8 lg:p-12 rounded-xl macaron-glow flex flex-col gap-6 z-10">
        {/* Tab */}
        <div className="flex bg-surface-container-low rounded-xl p-1">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${tab === 'login' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant'}`}
          >
            登入
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${tab === 'register' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant'}`}
          >
            免費註冊
          </button>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-1 gap-3">
          {/* LINE */}
          <button
            onClick={handleLineLogin}
            disabled={lineLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-[#06C755] text-white font-medium hover:opacity-90 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.141h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
            <span>{lineLoading ? '跳轉中...' : '使用 LINE 帳號登入'}</span>
          </button>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-white border border-outline-variant/30 text-on-surface font-medium hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{googleLoading ? '跳轉中...' : '使用 Gmail 帳號登入'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant/20"></div>
          </div>
          <span className="relative bg-surface-container-lowest px-4 text-sm text-on-surface-variant">或使用電子郵件</span>
        </div>

        {/* Email Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant ml-2">姓名</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">person</span>
                <input
                  className="w-full pl-12 pr-4 py-4 rounded-md bg-surface-container-low border-none focus:ring-2 focus:ring-primary-container text-on-surface placeholder:text-outline/50 transition-all outline-none"
                  placeholder="您的姓名"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant ml-2">電子郵件</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">mail</span>
              <input
                className="w-full pl-12 pr-4 py-4 rounded-md bg-surface-container-low border-none focus:ring-2 focus:ring-primary-container text-on-surface placeholder:text-outline/50 transition-all outline-none"
                placeholder="example@sweet.com"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant ml-2">密碼</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">lock</span>
              <input
                className="w-full pl-12 pr-12 py-4 rounded-md bg-surface-container-low border-none focus:ring-2 focus:ring-primary-container text-on-surface placeholder:text-outline/50 transition-all outline-none"
                placeholder="請輸入密碼"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline cursor-pointer"
                type="button"
                onClick={() => setShowPw(v => !v)}
              >
                <span className="material-symbols-outlined">{showPw ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-error-container/20 text-error rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-lg macaron-glow hover:opacity-90 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? '處理中...' : tab === 'login' ? '立即登入' : '建立帳號'}
          </button>
        </form>
      </div>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <span className="absolute top-20 left-[-5%] text-[20rem] font-bold text-on-surface opacity-[0.02] leading-none select-none">甘</span>
        <span className="absolute bottom-20 right-[-5%] text-[20rem] font-bold text-on-surface opacity-[0.02] leading-none select-none">味</span>
      </div>
    </div>
  );
}
