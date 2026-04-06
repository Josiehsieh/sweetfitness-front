import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi, type Course } from '../api';

const CATEGORIES = [
  { key: '空中瑜珈', label: '空中瑜珈', icon: 'self_improvement' },
  { key: '皮拉提斯', label: '皮拉提斯', icon: 'fitness_center' },
  { key: '器械核心', label: '器械核心', icon: 'sports_gymnastics' },
  { key: '芭蕾伸展', label: '芭蕾伸展', icon: 'accessibility_new' },
];

function getWeekDates(offset = 0): string[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

const WEEKDAY_LABELS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

export default function Schedule() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [category, setCategory] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const weekDates = getWeekDates(weekOffset);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await coursesApi.list(category || undefined);
      setCourses(data);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedCourses = courses.filter(c => selected.has(c.id));
  const totalPrice = selectedCourses.reduce((sum, c) => sum + c.price, 0);

  const groupedByDate = weekDates.map(date => ({
    date,
    courses: courses.filter(c => c.date === date),
  }));

  const weekLabel = `${weekDates[0].replace(/-/g, '.')} - ${weekDates[6].replace(/-/g, '.')}`;

  return (
    <main className="pt-28 pb-32 px-4 md:px-8 max-w-7xl mx-auto flex-1">
      <header className="mb-12">
        <h1 className="text-5xl font-extrabold text-on-surface tracking-tight mb-4 font-headline">預約您的甜點時光</h1>
        <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          像品嚐精緻馬卡龍一樣，每一堂課都是對身體的溫柔犒賞。選擇您心儀的運動種類，開啟今日的律動。
        </p>
      </header>

      {/* Category Tabs */}
      <section className="mb-12 overflow-x-auto">
        <div className="flex gap-4 pb-4 min-w-max">
          <button
            onClick={() => setCategory('')}
            className={`flex flex-col items-center justify-center gap-3 p-6 min-w-[140px] rounded-xl shadow-sm transition-all border-none cursor-pointer ${category === '' ? 'bg-primary-container text-on-primary-container scale-105' : 'bg-surface-container-lowest hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>apps</span>
            <span className="font-bold">全部</span>
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex flex-col items-center justify-center gap-3 p-6 min-w-[140px] rounded-xl transition-all border-none cursor-pointer ${category === cat.key ? 'bg-primary-container text-on-primary-container scale-105 shadow-sm' : 'bg-surface-container-lowest hover:bg-surface-container-high'}`}
            >
              <span className="material-symbols-outlined text-3xl text-primary">{cat.icon}</span>
              <span className="font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          {/* Week Selector */}
          <div className="flex items-center justify-between bg-surface-container-low p-6 rounded-lg">
            <button
              onClick={() => setWeekOffset(o => o - 1)}
              className="material-symbols-outlined text-primary p-2 bg-white rounded-full cursor-pointer"
            >chevron_left</button>
            <div className="text-center">
              <div className="text-sm font-bold text-primary tracking-widest">本週課表</div>
              <div className="text-xl font-extrabold font-headline">{weekLabel}</div>
            </div>
            <button
              onClick={() => setWeekOffset(o => o + 1)}
              className="material-symbols-outlined text-primary p-2 bg-white rounded-full cursor-pointer"
            >chevron_right</button>
          </div>

          {loading ? (
            <div className="text-center py-20 text-on-surface-variant">載入中...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 text-on-surface-variant">本週尚無課程</div>
          ) : (
            <div className="space-y-6">
              {groupedByDate.map((group, idx) => {
                if (group.courses.length === 0) return null;
                return (
                  <div key={group.date}>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 font-headline">
                      <span className="bg-secondary-container text-on-secondary-container w-10 h-10 rounded-full flex items-center justify-center text-sm">
                        {group.date.split('-')[2]}
                      </span>
                      {WEEKDAY_LABELS[idx]}
                    </h3>
                    <div className="grid gap-4">
                      {group.courses.map(course => {
                        const full = course.current_count >= course.capacity;
                        const isSelected = selected.has(course.id);
                        return (
                          <div
                            key={course.id}
                            className="bg-surface-container-lowest p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all relative overflow-hidden"
                          >
                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${isSelected ? 'bg-primary' : 'bg-surface-container-high'}`}></div>
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div className="text-2xl font-extrabold text-on-surface">{course.start_time}</div>
                                <div className="text-xs text-stone-400 font-medium">{course.duration_mins} MIN</div>
                              </div>
                              <div className="h-10 w-px bg-surface-container-high hidden md:block"></div>
                              <div>
                                <div className="text-lg font-bold">{course.name}</div>
                                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                                  <span className="material-symbols-outlined text-sm">person</span>
                                  教練：{course.instructor}
                                </div>
                                {course.tag && (
                                  <span className="mt-1 inline-block px-2 py-0.5 bg-tertiary-container text-on-tertiary-container rounded-full text-xs font-semibold">
                                    {course.tag}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-8">
                              <div className="text-right">
                                <div className="text-primary font-bold">NT$ {course.price.toLocaleString()}</div>
                                <div className={`text-xs font-semibold ${full ? 'text-error' : 'text-secondary-dim'}`}>
                                  {full ? '已滿額' : `剩餘 ${course.capacity - course.current_count}/${course.capacity} 名額`}
                                </div>
                              </div>
                              <label className={`relative flex items-center ${full ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <input
                                  className="peer sr-only"
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={full}
                                  onChange={() => !full && toggleSelect(course.id)}
                                />
                                <div className="w-8 h-8 bg-surface-container-high rounded-full peer-checked:bg-primary flex items-center justify-center transition-all">
                                  <span className="material-symbols-outlined text-white text-lg opacity-0 peer-checked:opacity-100">check</span>
                                </div>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Checkout Summary */}
        <aside className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_12px_32px_rgba(133,73,92,0.06)]">
              <div className="flex items-center gap-2 mb-6 text-secondary">
                <span className="material-symbols-outlined">receipt_long</span>
                <h2 className="text-xl font-bold font-headline">預約清單摘要</h2>
              </div>
              {selectedCourses.length === 0 ? (
                <p className="text-on-surface-variant text-sm mb-8">尚未選擇任何課程</p>
              ) : (
                <div className="space-y-4 mb-8">
                  {selectedCourses.map(c => (
                    <div key={c.id} className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm">{c.name}</div>
                        <div className="text-xs text-stone-400">{c.date} {c.start_time}</div>
                      </div>
                      <div className="text-on-surface font-semibold text-sm">NT$ {c.price.toLocaleString()}</div>
                    </div>
                  ))}
                  <div className="h-px bg-surface-container-low w-full"></div>
                </div>
              )}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm text-on-surface-variant">
                  <span>已選課程數量</span>
                  <span>{selectedCourses.length} 堂</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="font-bold">總計金額</span>
                  <span className="text-3xl font-extrabold text-primary">NT$ {totalPrice.toLocaleString()}</span>
                </div>
              </div>
              <Link
                to="/cart"
                state={{ selectedIds: Array.from(selected) }}
                className={`block text-center w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg macaron-glow transition-all mb-4 ${selected.size === 0 ? 'opacity-40 pointer-events-none' : 'active:scale-95'}`}
              >
                加入購物車結帳
              </Link>
              <p className="text-center text-xs text-stone-400 leading-relaxed">
                點擊結帳代表您已同意 <a className="underline" href="#">預約條款</a> 與 <a className="underline" href="#">取消政策</a>。
              </p>
            </div>

            <div className="bg-tertiary-container/30 p-6 rounded-lg relative overflow-hidden group">
              <div className="relative z-10">
                <div className="text-tertiary font-bold text-sm mb-1">本月限定優惠</div>
                <div className="text-on-tertiary-container font-extrabold text-lg">購買 5 堂課享 85 折</div>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-tertiary opacity-10 rotate-12">local_offer</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Link to="/cart" state={{ selectedIds: Array.from(selected) }} className="bg-primary text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center relative">
          <span className="material-symbols-outlined">shopping_basket</span>
          {selected.size > 0 && (
            <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] w-6 h-6 rounded-full border-2 border-white flex items-center justify-center font-bold">
              {selected.size}
            </span>
          )}
        </Link>
      </div>
    </main>
  );
}
