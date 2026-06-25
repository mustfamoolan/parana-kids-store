import React from 'react';

export default function HeroSection({ settings }) {
  // Try to find a active banner from settings or use a gorgeous fallback
  const bannerImage = settings?.dashboard_banner || settings?.banner_image;
  const isBannerEnabled = settings?.show_dashboard_banner !== false;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-pink-100 dark:from-slate-950 dark:to-rose-950/20 rounded-2xl md:rounded-3xl p-6 sm:p-10 lg:p-16 mb-8 shadow-sm">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none"></div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 z-10">
        
        {/* Left/Text Side */}
        <div className="flex-1 text-center md:text-right space-y-4 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider">
            ✨ خصومات الصيف الكبرى
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 dark:text-white leading-tight">
            عالم من <span className="bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">الأناقة والجمال</span> لأطفالك
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            اكتشفوا تشكيلاتنا الحصرية والراقية من ملابس الأطفال (ولادي، بناتي واكسسوارات) بجودة متميزة وأسعار تنافسية تلائم رغباتكم.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
            <button className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:scale-105">
              تسوق الآن
            </button>
            <button className="px-6 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
              تصفح العروض
            </button>
          </div>
        </div>

        {/* Right/Banner Image Side */}
        <div className="flex-1 w-full max-w-md md:max-w-none flex justify-center">
          {isBannerEnabled && bannerImage ? (
            <img 
              src={bannerImage} 
              alt="Promo Banner" 
              className="w-full h-auto max-h-[300px] object-cover rounded-2xl shadow-xl border-4 border-white dark:border-slate-800 transform hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <div className="relative w-full h-[220px] sm:h-[280px] bg-gradient-to-tr from-primary to-rose-400 rounded-2xl shadow-xl flex items-center justify-center text-white overflow-hidden p-6">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-black"></div>
              <div className="text-center space-y-2 z-10">
                <span className="text-4xl">👶👧</span>
                <h3 className="text-2xl font-bold">بارانا كيدز</h3>
                <p className="text-xs text-white/80">أفضل ماركات ملابس الأطفال العالمية</p>
                <div className="mt-3 inline-block px-3 py-1 rounded bg-white/20 text-xs font-mono">
                  توصيل سريع لكافة المحافظات
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
