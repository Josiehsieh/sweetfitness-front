import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { coursesApi, bookingsApi, discountsApi, type Course, type Discount } from '../api';

export default function Cart() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedIds: number[] = location.state?.selectedIds || [];

  const [courses, setCourses] = useState<Course[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [cartIds, setCartIds] = useState<number[]>(selectedIds);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allCourses, allDiscounts] = await Promise.all([
          coursesApi.list(),
          discountsApi.list(),
        ]);
        setCourses(allCourses.filter(c => cartIds.includes(c.id)));
        setDiscounts(allDiscounts);
      } catch {
        setCourses([]);
      }
    };
    fetchData();
  }, [cartIds.join(',')]);

  const removeFromCart = (id: number) => {
    setCartIds(prev => prev.filter(x => x !== id));
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const applicableDiscount = discounts
    .filter(d => d.min_quantity <= courses.length)
    .sort((a, b) => b.min_quantity - a.min_quantity)[0];

  const subtotal = courses.reduce((sum, c) => sum + c.price, 0);
  const discountRate = applicableDiscount ? applicableDiscount.discount_rate : 1;
  const discountAmount = Math.round(subtotal * (1 - discountRate));
  const total = subtotal - discountAmount;

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    if (courses.length === 0) return;

    setLoading(true);
    setError('');
    try {
      await bookingsApi.create(courses.map(c => c.id));
      setShowModal(true);
    } catch (err: any) {
      setError(err.message || '訂單送出失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex-1">
      <header className="mb-12 relative">
        <span className="absolute -top-10 -left-6 text-9xl opacity-[0.03] font-bold pointer-events-none select-none text-primary">CART</span>
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tighter mb-4 font-headline">確認您的課表</h1>
        <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
          挑選心儀的課程，就像在精緻甜點店挑選馬卡龍。每一堂課都是為您的身心健康精心調配的完美風味。
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-8 space-y-6">
          {courses.length === 0 ? (
            <div className="text-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 block">shopping_basket</span>
              購物車是空的，請回到<Link to="/schedule" className="text-primary font-bold underline">課表</Link>選課
            </div>
          ) : (
            courses.map(course => (
              <div key={course.id} className="bg-surface-container-lowest p-6 rounded-lg flex flex-col md:flex-row gap-6 transition-transform hover:scale-[1.01] relative overflow-hidden">
                <div className="w-full md:w-48 h-32 rounded-xl bg-primary-container overflow-hidden shrink-0">
                  {course.image_url ? (
                    <img alt={course.name} className="w-full h-full object-cover" src={course.image_url} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-4xl">self_improvement</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-on-surface font-headline">{course.name}</h3>
                      <button onClick={() => removeFromCart(course.id)} className="text-secondary hover:text-secondary-dim transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                    <p className="text-on-surface-variant mt-1">{course.date} {course.start_time} | 教練：{course.instructor}</p>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    {course.tag && (
                      <span className="px-4 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-sm font-semibold">{course.tag}</span>
                    )}
                    <span className="text-2xl font-bold text-primary ml-auto">NT$ {course.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Payment Info */}
          <div className="bg-primary-container/20 p-8 rounded-lg border-2 border-dashed border-primary/30">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-4xl">payments</span>
              <div>
                <h3 className="text-xl font-bold text-primary mb-2 font-headline">匯款資訊 (Bank Transfer)</h3>
                <div className="space-y-2 text-on-surface font-medium">
                  <p>銀行代碼：<span className="font-bold text-on-primary-container">822 (中國信託)</span></p>
                  <p>匯款帳號：<span className="font-bold text-on-primary-container">9015-4033-XXXX-XXXX</span></p>
                  <p>戶名：<span className="font-bold text-on-primary-container">甘味健康事業有限公司</span></p>
                </div>
                <div className="mt-4 p-4 bg-surface-container-lowest rounded-xl text-sm leading-relaxed text-on-surface-variant">
                  <span className="font-bold text-secondary">※ 匯款完畢後之操作：</span><br />
                  請於「個人檔案 &gt; 我的訂單」中填寫您的帳號末五碼，我們將在 24 小時內為您開通課程權限。
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Checkout Summary */}
        <aside className="lg:col-span-4 sticky top-28 space-y-6">
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_rgba(133,73,92,0.08)]">
            <h2 className="text-2xl font-bold text-on-surface mb-6 font-headline">結帳金額總計</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-on-surface-variant">
                <span>課程小計 ({courses.length} 堂)</span>
                <span className="font-medium">NT$ {subtotal.toLocaleString()}</span>
              </div>
              {applicableDiscount && (
                <div className="flex justify-between items-center text-secondary">
                  <span className="flex items-center gap-1 text-sm">
                    <span className="material-symbols-outlined text-sm">redeem</span>
                    {applicableDiscount.name} ({Math.round((1 - discountRate) * 100)}折)
                  </span>
                  <span className="font-medium">- NT$ {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-4 border-t border-surface-container-highest flex justify-between items-center">
                <span className="text-xl font-bold text-on-surface">應付總額</span>
                <span className="text-3xl font-extrabold text-primary">NT$ {total.toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error-container/20 text-error rounded-lg text-sm font-medium">{error}</div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading || courses.length === 0}
              className="w-full bg-primary text-on-primary py-4 rounded-xl text-xl font-bold tracking-tight shadow-[0_12px_32px_rgba(0,104,79,0.2)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '送出中...' : '確認訂單並送出'}
            </button>
            <p className="text-center text-xs text-on-surface-variant mt-6 px-4">
              點擊送出即代表您同意本平台的《課程服務條款》與《隱私權政策》。
            </p>
          </div>

          <div className="bg-tertiary-container/30 p-6 rounded-xl flex items-center gap-4">
            <span className="material-symbols-outlined text-tertiary text-4xl">contact_support</span>
            <div>
              <h4 className="font-bold text-on-tertiary-container font-headline">需要協助？</h4>
              <p className="text-sm text-on-tertiary-container/80">加入 Line 客服 @sweetfitness<br />服務時間：10:00 - 22:00</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-surface-container-lowest w-full max-w-lg p-10 rounded-xl text-center shadow-2xl">
            <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-4xl font-extrabold text-primary mb-4 tracking-tight font-headline">感 謝 訂 購 ！</h2>
            <p className="text-on-surface-variant mb-8 text-lg leading-relaxed">
              您的預訂就像新鮮出爐的甜點一樣令人期待。請於匯款完成後，前往會員中心回報末五碼，讓我們能盡快為您準備專屬的健身饗宴。
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowModal(false)} className="bg-surface-container-high text-on-surface-variant py-3 rounded-xl font-bold cursor-pointer hover:bg-surface-variant transition-colors">查看訂單</button>
              <Link to="/schedule" className="bg-primary text-on-primary py-3 rounded-xl font-bold cursor-pointer hover:bg-primary-dim transition-colors text-center">繼續選課</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
