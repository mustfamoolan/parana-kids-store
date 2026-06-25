import React from 'react';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderSuccess({ order, onGoToShop }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price) + ' د.ع';
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="relative w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500 animate-bounce">
          <CheckCircle2 size={56} strokeWidth={1.5} />
          <span className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-20"></span>
        </div>
      </div>

      {/* Success messages */}
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-slate-800 dark:text-white font-cairo">
          تم تسجيل طلبك بنجاح! 🎉
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          شكراً لتسوقك من متجر بارانا كيدز. سنقوم بتجهيز طلبيتك وإرسالها لك في أسرع وقت.
        </p>
      </div>

      {/* Order details card */}
      {order && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm text-right space-y-3">
          <h3 className="font-bold text-slate-800 dark:text-white border-b pb-2 text-sm">تفاصيل الطلبية:</h3>
          
          <div className="flex justify-between text-xs text-slate-500">
            <span>رقم الطلب:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              #{order.order_number || order.id}
            </span>
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span>اسم المستلم:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {order.customer_name}
            </span>
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span>رقم الهاتف:</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">
              {order.customer_phone}
            </span>
          </div>

          <div className="flex justify-between text-xs text-slate-500 border-t pt-2 border-dashed">
            <span>المجموع الكلي:</span>
            <span className="font-bold text-primary text-sm">
              {formatPrice(order.total_amount || order.price)}
            </span>
          </div>
        </div>
      )}

      {/* Instructions advice */}
      <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl text-xs text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-800/80">
        💡 <strong>تنويه:</strong> سيقوم مندوب شركة التوصيل (الوسيط) بالاتصال بك على رقم هاتفك المسجل لتأكيد العنوان والتوصيل. يرجى إبقاء الهاتف متاحاً.
      </div>

      {/* Action buttons */}
      <button
        onClick={onGoToShop}
        className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
      >
        <ShoppingBag size={18} />
        <span>العودة للمتجر ومتابعة التسوق</span>
      </button>

    </div>
  );
}
