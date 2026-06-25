import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Info, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

export default function ProductDetailsModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const {
    name,
    code,
    selling_price,
    effective_price,
    sizes = [],
    images = [],
    primary_image_url
  } = product;

  // Selected state
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Compile all images
  const allImages = [
    product.primary_image || primary_image_url || product.primary_image?.image_url,
    ...sizes.map(s => s.image_url), // Support size-specific images if any
    ...images.map(img => typeof img === 'string' ? img : img.image_url)
  ].filter(Boolean); // Clean nulls

  const finalImages = allImages.length > 0 ? allImages : ['/assets/images/no-image.png'];

  // Handle auto-selecting size if only one is available
  useEffect(() => {
    const availableSizes = sizes.filter(s => (s.available_quantity || s.quantity || 0) > 0);
    if (availableSizes.length === 1) {
      setSelectedSize(availableSizes[0]);
    }
  }, [sizes]);

  // Handle changing selected size
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setQuantity(1); // Reset qty to 1
  };

  const handleQtyChange = (val) => {
    const maxQty = selectedSize ? (selectedSize.available_quantity || selectedSize.quantity || 1) : 99;
    let qty = parseInt(val) || 1;
    if (qty < 1) qty = 1;
    if (qty > maxQty) qty = maxQty;
    setQuantity(qty);
  };

  const isDiscounted = effective_price && Number(effective_price) < Number(selling_price);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price) + ' د.ع';
  };

  const handleAddClick = () => {
    if (!selectedSize) return;
    onAddToCart(product, selectedSize, quantity);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        {/* Left Side: Images */}
        <div className="md:w-1/2 p-6 flex flex-col justify-center bg-slate-50 dark:bg-slate-900/40">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
            <img 
              src={finalImages[activeImageIndex]} 
              alt={name}
              className="w-full h-full object-cover transition-all"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=400'; }}
            />
            {/* Gallery Navigation */}
            {finalImages.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIndex(prev => (prev === 0 ? finalImages.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setActiveImageIndex(prev => (prev === finalImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnails */}
          {finalImages.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto py-1">
              {finalImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    idx === activeImageIndex ? 'border-primary scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Brand/Code */}
            <div>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                كود: {code || 'PROD-N/A'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mt-2 leading-snug">
                {name}
              </h2>
            </div>

            {/* Price display */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">السعر الحالي</span>
                {isDiscounted ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-primary">
                      {formatPrice(effective_price)}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(selling_price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-black text-slate-800 dark:text-white">
                    {formatPrice(selling_price)}
                  </span>
                )}
              </div>
              {isDiscounted && (
                <span className="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-lg mr-auto">
                  توفير {Math.round(((selling_price - effective_price) / selling_price) * 100)}%
                </span>
              )}
            </div>

            {/* Sizing options */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                اختر القياس المتاح:
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const qtyAvailable = size.available_quantity || size.quantity || 0;
                  const isAvailable = qtyAvailable > 0;
                  const isSelected = selectedSize?.id === size.id;

                  return (
                    <button
                      key={size.id}
                      disabled={!isAvailable}
                      onClick={() => handleSizeSelect(size)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all flex flex-col items-center min-w-[70px] ${
                        isSelected 
                          ? 'border-primary bg-primary text-white scale-[1.03] shadow-md shadow-primary/10'
                          : isAvailable
                            ? 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                            : 'border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/20 text-slate-300 dark:text-slate-600 cursor-not-allowed line-through'
                      }`}
                    >
                      <span>{size.size_name}</span>
                      <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/90' : 'text-slate-400 dark:text-slate-500'}`}>
                        {isAvailable ? `متاح: ${qtyAvailable}` : 'نفذ'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity select */}
            {selectedSize && (
              <div className="space-y-2 animate-slide-down">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  الكمية المطلوبة:
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden w-36">
                    <button 
                      onClick={() => handleQtyChange(quantity - 1)}
                      className="w-12 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border-l dark:border-slate-700"
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQtyChange(e.target.value)}
                      className="w-12 h-10 text-center bg-transparent text-slate-800 dark:text-white font-bold text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      onClick={() => handleQtyChange(quantity + 1)}
                      className="w-12 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border-r dark:border-slate-700"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">
                    الحد الأقصى المسموح به: {selectedSize.available_quantity || selectedSize.quantity} قطع
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart Actions */}
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-700/50 flex gap-4">
            <button
              onClick={handleAddClick}
              disabled={!selectedSize}
              className={`flex-1 py-3 px-6 rounded-2xl text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
                selectedSize
                  ? 'bg-primary hover:bg-primary-dark hover:scale-[1.01] shadow-primary/15'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <ShoppingCart size={20} />
              <span>أضف إلى سلة المشتريات</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
