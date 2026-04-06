import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function LineCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const savedState = sessionStorage.getItem('line_state');

    const handleCallback = async () => {
      if (!code) {
        setErrorMsg('未收到 LINE 授權碼，請重新嘗試');
        setStatus('error');
        return;
      }

      if (state !== savedState) {
        setErrorMsg('安全驗證失敗（state 不符），請重新登入');
        setStatus('error');
        return;
      }

      sessionStorage.removeItem('line_state');

      try {
        const res = await fetch(`${BASE_URL}/auth/line/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: '登入失敗' }));
          throw new Error(err.detail || 'LINE 登入失敗');
        }

        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        navigate('/schedule', { replace: true });
      } catch (err: any) {
        setErrorMsg(err.message || 'LINE 登入發生錯誤');
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
            <div className="w-20 h-20 bg-[#06C755]/10 rounded-full flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" className="w-10 h-10 fill-[#06C755] animate-pulse">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.141h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-on-surface">LINE 登入處理中</h2>
              <p className="text-on-surface-variant mt-2">請稍候，正在驗證您的 LINE 帳號...</p>
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
