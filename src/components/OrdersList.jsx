import React, { useEffect, useState } from 'react';
import { Package, ArrowRight, Calendar, Info, Clock, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../services/api';

export default function OrdersList({ onBackToShop }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      if (data.success && data.data) {
        // Handle pagination data if nested
        setOrders(Array.isArray(data.data) ? data.data : data.data.data || []);
      } else {
        setError('فشل في تحميل الطلبات من السيرفر');
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'قيد المراجعة', class: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400', icon: <Clock size={12} /> },
      confirmed: { text: 'تم التأكيد', class: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400', icon: <CheckCircle size={12} /> },
      delivered: { text: 'تم التوصيل', class: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400', icon: <CheckCircle size={12} /> },
      completed: { text: 'مكتمل', class: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400', icon: <CheckCircle size={12} /> },
      cancelled: { text: 'ملغي', class: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400', icon: <XCircle size={12} /> },
    };

    const current = statusMap[status] || { text: status, class: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: <Info size={12} /> };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${current.class}`}>
        {current.icon}
        <span>{current.text}</span>
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price) + ' د.ع';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in" style={{ direction: 'rtl' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Package className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-cairo">طلباتي السابقة</h1>
        </div>
        <button 
          onClick={onBackToShop}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-semibold transition-colors"
        >
          <ArrowRight size={16} />
          <span>العودة للمتجر</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-slate-400 text-sm mt-3">جاري تحميل طلباتك...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 p-4 rounded-2xl text-sm text-center">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-300 dark:text-slate-700">
            <Package size={32} />
          </div>
          <div>
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-lg">لا يوجد أي طلبات سابقة</h3>
            <p className="text-slate-400 text-sm mt-1">لم تقم بإرسال أي طلبات بعد من هذا الحساب.</p>
          </div>
          <button 
            onClick={onBackToShop}
            className="px-6 py-2 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md shadow-primary/10 transition-all"
          >
            ابدأ التسوق الآن
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div 
              key={order.id}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-slate-100 dark:border-slate-750">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
                    رقم الطلب: #{order.order_number || order.id}
                  </span>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar size={14} />
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-750">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-3">
                      {/* Product thumbnail */}
                      <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-900 overflow-hidden flex-shrink-0">
                        {item.product?.primary_image_url || item.product?.primary_image?.image_url ? (
                          <img 
                            src={item.product?.primary_image_url || item.product?.primary_image?.image_url} 
                            alt={item.product_name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">👶</div>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.product_name || 'منتج غير معروف'}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          كود: {item.product_code} | قياس: {item.size_name}
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatPrice(item.unit_price)} × {item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-baseline pt-2 mt-2 border-t border-slate-100 dark:border-slate-750">
                <span className="text-xs text-slate-500 font-semibold">المبلغ الإجمالي المستحصل:</span>
                <span className="text-base sm:text-lg font-black text-primary">
                  {formatPrice(order.total_amount)}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
