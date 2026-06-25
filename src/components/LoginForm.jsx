import React, { useState, useEffect } from 'react';
import { LogIn, Shield, Chrome } from 'lucide-react';

export default function LoginForm({ onLoginSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [demoName, setDemoName] = useState('أبو أحمد');
  const [demoEmail, setDemoEmail] = useState('demo.customer@example.com');
  const [error, setError] = useState('');

  // Helper to decode JWT payload locally
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode JWT token:', e);
      return null;
    }
  };

  // Callback after successful Google Auth
  const handleCredentialResponse = async (response) => {
    setLoading(true);
    setError('');
    try {
      const payload = decodeJwt(response.credential);
      if (!payload) {
        setError('فشل في فك تشفير تفاصيل الحساب من جوجل');
        setLoading(false);
        return;
      }

      const googlePayload = {
        name: payload.name || 'عميل جديد',
        email: payload.email,
        google_id: payload.sub,
        profile_image: payload.picture || ''
      };

      await submitLoginToApi(googlePayload);
    } catch (err) {
      console.error('Google Sign In callback error:', err);
      setError('حدث خطأ أثناء معالجة تسجيل دخول جوجل');
      setLoading(false);
    }
  };

  // Load Google Auth SDK dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          // This is a test Web Client ID from Google. For production, the user can replace this with their client ID.
          client_id: "870634620603-n378epom9bspv6c1f1hld8oc0qf8g07f.apps.googleusercontent.com",
          callback: handleCredentialResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 350, text: "continue_with" }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const submitLoginToApi = async (payload) => {
    try {
      const BASE_URL = 'https://parana-kids-main-sbv4op.laravel.cloud/api';
      const res = await fetch(`${BASE_URL}/customer/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success && data.token) {
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'فشل تسجيل الدخول من الباك إند');
      }
    } catch (err) {
      console.error('Login API error:', err);
      setError('فشل الاتصال بالباك إند، يرجى التحقق من الشبكة');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    if (!demoName.trim() || !demoEmail.trim()) {
      setError('يرجى ملء جميع الحقول التجريبية');
      return;
    }

    setLoading(true);
    setError('');

    const mockPayload = {
      name: demoName,
      email: demoEmail,
      google_id: `demo_${Date.now()}`,
      profile_image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(demoName)}`
    };

    await submitLoginToApi(mockPayload);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" style={{ direction: 'rtl' }}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Banner header */}
        <div className="bg-gradient-to-tr from-primary to-rose-505 p-6 bg-gradient-to-r from-primary to-rose-500 text-white text-center space-y-2">
          <span className="text-3xl">🧸</span>
          <h2 className="text-xl font-bold font-cairo">تسجيل الدخول في بارانا كيدز</h2>
          <p className="text-white/80 text-xs">سجل دخولك لتتمكن من إتمام عملية الحجز ومتابعة طلباتك</p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs p-3 rounded-xl border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Social login integration */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 self-start">تسجيل الدخول المباشر:</label>
            <div id="google-signin-btn" className="w-full flex justify-center"></div>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs">أو حساب تجريبي (دخول بدون جوجل)</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          {/* Demo account inputs */}
          <form onSubmit={handleDemoSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">الاسم الكامل:</label>
              <input
                type="text"
                value={demoName}
                onChange={(e) => setDemoName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary/50"
                placeholder="مثال: أحمد علي..."
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">البريد الإلكتروني:</label>
              <input
                type="email"
                value={demoEmail}
                onChange={(e) => setDemoEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary/50"
                placeholder="example@gmail.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>دخول سريع (جهاز التجريب)</span>
                </>
              )}
            </button>
          </form>

          {/* Cancel button */}
          <button
            onClick={onCancel}
            className="w-full py-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-semibold text-sm transition-colors"
          >
            إلغاء
          </button>
        </div>

        {/* Shield Security badge */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-400 text-[10px]">
          <Shield size={14} className="text-primary/70" />
          <span>نحن نحمي خصوصيتك وأمان بياناتك 100%</span>
        </div>

      </div>
    </div>
  );
}
