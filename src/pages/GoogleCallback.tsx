import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const savedState = sessionStorage.getItem('google_state');

    const handleCallback = async () => {
      if (!code) {
        setErrorMsg('未收到 Google 授權碼，請重新嘗試');
        setStatus('error');
        return;
      }

      if (state !== savedState) {
        setErrorMsg('安全驗證失敗（state 不符），請重新登入');
        setStatus('error');
        return;
      }

      sessionStorage.removeItem('google_state');

      try {
        const res = await fetch(`${BASE_URL}/auth/google/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: '登入失敗' }));
          throw new Error(err.detail || 'Google 登入失敗');
        }

        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        navigate('/schedule', { replace: true });
      } catch (err: any) {
        setErrorMsg(err.message || 'Google 登入發生錯誤');
        setStatus('error');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        {status === 'loading' ? (
          <>
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" className="w-10 h-10 animate-pulse">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Google 登入處理中</h2>
              <p className="text-on-surface-variant mt-2">請稍候，正在驗證您的 Google 帳號...</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-error-container/20 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-error text-4xl">error</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-on-surface">登入失敗</h2>
              <p className="text-on-surface-variant mt-2">{errorMsg}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-all"
            >
              回到登入頁
            </button>
          </>
        )}
      </div>
    </div>
  );
}
