import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isLogin = location.pathname === '/';

  if (isLogin) return null;

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#faf5f9]/80 dark:bg-stone-900/80 backdrop-blur-xl shadow-[0_12px_32px_rgba(133,73,92,0.08)] tonal-shift-no-border">
      <div className="flex justify-between items-center px-8 py-4 max-w-full mx-auto">
        <Link to="/schedule" className="text-2xl font-bold text-[#00684f] dark:text-[#89f0cb] tracking-tighter font-headline">
          JosieFitness
        </Link>
        <div className="hidden md:flex items-center gap-8 font-headline font-medium text-lg tracking-tight">
          <Link to="/" className="text-stone-500 hover:text-[#00684f] transition-colors duration-300">
            首頁
          </Link>
          <Link
            to="/schedule"
            className={`${
              location.pathname === '/schedule'
                ? 'text-[#00684f] font-bold border-b-2 border-[#00684f] pb-1'
                : 'text-stone-500 hover:text-[#00684f]'
            } transition-colors duration-300`}
          >
            所有課程
          </Link>
          <Link
            to="/cart"
            className={`${
              location.pathname === '/cart'
                ? 'text-[#00684f] font-bold border-b-2 border-[#00684f] pb-1'
                : 'text-stone-500 hover:text-[#00684f]'
            } transition-colors duration-300`}
          >
            我的購物車
          </Link>
          <Link to="#" className="text-stone-500 hover:text-[#00684f] transition-colors duration-300">
            個人檔案
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/cart" className="material-symbols-outlined text-stone-500 hover:text-[#00684f] p-2 scale-95 active:scale-90 transition-transform">
            shopping_cart
          </Link>
          <button className="material-symbols-outlined text-stone-500 hover:text-[#00684f] p-2 scale-95 active:scale-90 transition-transform">
            account_circle
          </button>
          <Link to="/schedule" className="hidden md:block bg-primary text-on-primary px-6 py-2 rounded-xl font-bold tracking-tight scale-95 active:scale-90 transition-transform macaron-glow">
            立即預約
          </Link>
        </div>
      </div>
    </nav>
  );
}
