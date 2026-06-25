import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  onCheckoutClick 
}) {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price) + ' د.ع';
  };

  return (
    <div className="fixed inset-0 z-[110] overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white dark:bg-slate-800 shadow-2xl border-r border-slate-200 dark:border-slate-700/50 flex flex-col animate-slide-in">
          
          {/* Header */}
          <div className="px-4 py-6 sm:px-6 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-primary" size={22} />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">سلة المشتريات</h2>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
                {cartItems.length} منتجات
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-700">
                  <ShoppingBag size={40} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 text-lg">سلة المشتريات فارغة</h3>
                  <p className="text-slate-400 text-sm mt-1">تصفح متجرنا وأضف ملابس أطفالك المفضلة هنا!</p>
                </div>
                <button 
                  onClick={onClose}
                  className="px-6 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm transition-all"
                >
                  الذهاب للتسوق
                </button>
              </div>
            ) : (
              cartItems.map((item, index) => {
                const maxAvailable = item.size?.available_quantity || item.size?.quantity || 99;
                const imageUrl = item.product?.primary_image_url || item.product?.primary_image?.image_url || '/assets/images/no-image.png';

                return (
                  <div 
                    key={`${item.product_id}-${item.size_id}-${index}`}
                    className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 animate-fade-in"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-800">
                      <img 
                        src={imageUrl} 
                        alt={item.product?.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=200'; }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">
                          {item.product?.name || 'منتج غير معروف'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase">
                            {item.product?.code}
                          </span>
                          <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded">
                            قياس: {item.size?.size_name || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Selector and Price */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 scale-90 -translate-x-2">
                          <button 
                            disabled={item.quantity <= 1}
                            onClick={() => onUpdateQty(item.product_id, item.size_id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-700 dark:text-white">
                            {item.quantity}
                          </span>
                          <button 
                            disabled={item.quantity >= maxAvailable}
                            onClick={() => onUpdateQty(item.product_id, item.size_id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                        
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button 
                      onClick={() => onRemoveItem(item.product_id, item.size_id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700/50 px-4 py-6 sm:px-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 text-sm font-semibold">المجموع الكلي:</span>
                <span className="text-2xl font-black text-primary">{formatPrice(totalAmount)}</span>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                * الأسعار شاملة لضريبة المبيعات. أجور التوصيل تُحتسب في شاشة الدفع.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onCheckoutClick}
                  className="flex-1 py-3 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <span>الذهاب للدفع</span>
                  <ArrowRight size={16} className="rotate-180" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
