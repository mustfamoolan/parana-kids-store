import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

export default function LoginForm({ onLoginSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
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
          client_id: "223597554792-sp690rksq17l62s37gdorv9bffjba0th.apps.googleusercontent.com",
          callback: handleCredentialResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 280, text: "continue_with" }
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
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div id="google-signin-btn" className="w-full flex justify-center scale-105 transition-transform"></div>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <span>جاري تسجيل الدخول...</span>
              </div>
            )}
          </div>

          {/* Cancel button */}
          <button
            onClick={onCancel}
            className="w-full py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-2xl transition-all"
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
