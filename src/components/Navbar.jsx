import React, { useState } from 'react';
import { ShoppingBag, Search, Sun, Moon, LogIn, User, LogOut, Package } from 'lucide-react';

export default function Navbar({ 
  cartCount, 
  onCartToggle, 
  onSearch, 
  searchQuery, 
  darkMode, 
  onThemeToggle, 
  user, 
  onLogoutClick, 
  onLoginClick,
  onOrdersClick 
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <span className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-rose-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary/20">
              P
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent hidden sm:block">
              بارانا كيدز
            </span>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث بكود المنتج أو القياس..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-10 py-2 rounded-full border border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-sm font-cairo"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={18} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            
            {/* Theme toggle */}
            <button 
              onClick={onThemeToggle}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Cart Button */}
            <button 
              onClick={onCartToggle}
              className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            <div className="relative">
              {user ? (
                <div>
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                  >
                    {user.profile_image ? (
                      <img 
                        src={user.profile_image} 
                        alt={user.name} 
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <User size={16} />
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden md:block max-w-[100px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-400">مرحباً بك</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOrdersClick();
                        }}
                        className="w-full text-right px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Package size={16} />
                        طلباتي
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogoutClick();
                        }}
                        className="w-full text-right px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all text-sm font-semibold focus:outline-none"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">دخول</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </nav>
  );
}
