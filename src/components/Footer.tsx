import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isLogin = location.pathname === '/';

  if (isLogin) {
    return (
      <footer className="relative z-10 w-full p-8 text-center text-sm text-on-surface-variant/60 flex flex-col gap-4">
        <div className="flex justify-center gap-6">
          <a className="hover:text-primary transition-colors" href="#">服務條款</a>
          <a className="hover:text-primary transition-colors" href="#">隱私政策</a>
          <a className="hover:text-primary transition-colors" href="#">常見問題</a>
        </div>
        <p>© 2024 甘味健身 Sweet Fitness. All rights reserved.</p>
        <div className="absolute bottom-12 right-12 hidden lg:block animate-bounce opacity-20">
          <span className="material-symbols-outlined text-6xl text-secondary">bakery_dining</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#f4eff4] dark:bg-stone-950 w-full py-12 px-8 tonal-shift-no-border mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto font-body text-sm text-stone-500">
        <div className="text-lg font-bold text-[#00684f] font-headline">甘味健身</div>
        <div className="flex gap-8">
          <a className="hover:text-[#00684f] transition-colors" href="#">隱私政策</a>
          <a className="hover:text-[#00684f] transition-colors" href="#">服務條款</a>
          <a className="hover:text-[#00684f] transition-colors" href="#">聯繫我們</a>
          <a className="hover:text-[#00684f] transition-colors" href="#">常見問題</a>
        </div>
        <div>© 2024 Sweet Fitness 甘味健身. All rights reserved.</div>
      </div>
    </footer>
  );
}
