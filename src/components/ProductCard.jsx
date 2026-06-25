import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, onProductClick, isFavorite, onToggleFavorite }) {
  // Safe extraction of properties
  const {
    id,
    name,
    code,
    selling_price,
    gender_type,
    sizes = [],
    primary_image_url,
    effective_price,
  } = product;

  const imageUrl = product.primary_image || primary_image_url || product.primary_image?.image_url || '/assets/images/no-image.png';

  // Calculate discount
  const isDiscounted = effective_price && Number(effective_price) < Number(selling_price);
  const discountPercent = isDiscounted 
    ? Math.round(((selling_price - effective_price) / selling_price) * 100)
    : 0;

  // Check if out of stock
  const totalQuantity = sizes.reduce((acc, s) => acc + (s.available_quantity || s.quantity || 0), 0);
  const isOutOfStock = totalQuantity <= 0;

  // Mapping gender types to Arabic labels
  const genderLabels = {
    boys: 'ولادي 👦',
    girls: 'بناتي 👧',
    boys_girls: 'ولادي بناتي 👦👧',
    accessories: 'اكسسوار 🎒',
  };
  const genderLabel = genderLabels[gender_type] || '';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price) + ' د.ع';
  };

  return (
    <div 
      onClick={() => onProductClick(product)}
      className="group relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
    >
      
      {/* Product Image Panel */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <img 
          src={imageUrl} 
          alt={name} 
          loading="lazy"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=300&auto=format&fit=crop'; }}
        />
        
        {/* Floating Badges */}
        {isDiscounted && (
          <span className="absolute top-3 right-3 bg-red-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
            خصم {discountPercent}%
          </span>
        )}

        {isOutOfStock ? (
          <span className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center text-white font-bold text-sm">
            نفذت الكمية 🚫
          </span>
        ) : genderLabel && (
          <span className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm backdrop-blur-sm">
            {genderLabel}
          </span>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(id);
          }}
          className={`absolute top-3 left-3 p-1.5 rounded-full shadow-sm transition-colors ${
            isFavorite 
              ? 'bg-rose-500 text-white hover:bg-rose-600' 
              : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Info Panel */}
      <div className="flex flex-col flex-1 p-4">
        
        {/* Code & Name */}
        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
          {code || 'PROD-N/A'}
        </span>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base line-clamp-2 min-h-[40px] mb-2 leading-snug">
          {name}
        </h3>

        {/* Sizing display */}
        {!isOutOfStock && sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {sizes.slice(0, 3).map((size) => (
              <span 
                key={size.id} 
                className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded"
              >
                {size.size_name}
              </span>
            ))}
            {sizes.length > 3 && (
              <span className="text-[10px] font-semibold text-slate-400 px-1">
                +{sizes.length - 3} قياس
              </span>
            )}
          </div>
        )}

        {/* Price and Add button */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-700/50">
          <div className="flex flex-col">
            {isDiscounted ? (
              <>
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(selling_price)}
                </span>
                <span className="text-base font-bold text-primary">
                  {formatPrice(effective_price)}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-slate-800 dark:text-white">
                {formatPrice(selling_price)}
              </span>
            )}
          </div>

          {!isOutOfStock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="p-2 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md shadow-primary/10 transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
