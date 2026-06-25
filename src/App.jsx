import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import CartDrawer from './components/CartDrawer';
import CheckoutForm from './components/CheckoutForm';
import LoginForm from './components/LoginForm';
import OrderSuccess from './components/OrderSuccess';
import OrdersList from './components/OrdersList';
import { api } from './services/api';
import { Filter, SlidersHorizontal, AlertCircle, ShoppingBag } from 'lucide-react';

export default function App() {
  // Navigation & View States
  const [activeView, setActiveView] = useState('shop'); // shop, checkout, orders, success
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  
  // Data States
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [user, setUser] = useState(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [genderType, setGenderType] = useState('');
  const [hasDiscount, setHasDiscount] = useState('');
  
  // Pagination & Loading States
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Cart State (Persisted in LocalStorage)
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('shop_cart_items');
    return saved ? JSON.parse(saved) : [];
  });

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark_mode');
    return saved === 'true';
  });

  // Favorites State
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('shop_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Apply dark mode styling on change
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dark_mode', darkMode);
  }, [darkMode]);

  // Sync cart items to localStorage
  useEffect(() => {
    localStorage.setItem('shop_cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync favorites to localStorage
  useEffect(() => {
    localStorage.setItem('shop_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Load User, Settings and Initial Products + Telegram Mini App integration
  useEffect(() => {
    // 1. Initialize Telegram WebApp if running inside Telegram
    if (window.Telegram?.WebApp) {
      try {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();

        // Automatically log in the Telegram user if not already logged in
        if (!api.isLoggedIn() && tg.initDataUnsafe?.user) {
          const tgUser = tg.initDataUnsafe.user;
          const name = tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '');
          const email = `${tgUser.id}@telegram.com`;
          const telegramPayload = {
            name: name || 'مستخدم تيليجرام',
            email: email,
            google_id: `telegram_${tgUser.id}`,
            profile_image: tgUser.photo_url || ''
          };

          setLoading(true);
          api.loginWithGoogle(telegramPayload)
            .then(data => {
              if (data.success && data.user) {
                setUser(data.user);
              }
            })
            .catch(err => console.error('Telegram auto-login failed:', err))
            .finally(() => setLoading(false));
        }
      } catch (err) {
        console.error('Error setting up Telegram WebApp:', err);
      }
    }

    // 2. Check if user token exists
    if (api.isLoggedIn()) {
      setUser(api.getUser());
    }

    // 3. Fetch store settings
    api.getSettings()
      .then(res => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  // Fetch products when filters or page change
  useEffect(() => {
    if (activeView !== 'shop') return;
    
    // Debounce search input to avoid spamming the API
    const delayDebounceFn = setTimeout(() => {
      loadProducts(true);
    }, searchQuery ? 400 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, genderType, hasDiscount, activeView]);

  const loadProducts = async (reset = false) => {
    setLoading(true);
    setError('');
    
    const targetPage = reset ? 1 : page;
    try {
      const data = await api.getProducts({
        search: searchQuery,
        gender_type: genderType,
        has_discount: hasDiscount,
        page: targetPage
      });

      if (data.success && data.data) {
        const list = Array.isArray(data.data) ? data.data : data.data.data || [];
        const meta = data.data.meta || data.data; // support different pagination styles
        
        if (reset) {
          setProducts(list);
        } else {
          setProducts(prev => [...prev, ...list]);
        }
        
        setPage(targetPage + 1);
        setHasMore(data.data.next_page_url !== null && list.length > 0);
      } else {
        setError('فشل في جلب المنتجات من السيرفر.');
      }
    } catch (err) {
      console.error(err);
      setError('خطأ في الاتصال بالشبكة. يرجى التحقق من الباك إند.');
    } finally {
      setLoading(false);
    }
  };

  // Add Item to Cart
  const handleAddToCart = (product, size, qty) => {
    setCartItems(prev => {
      // Check if item with same product and size is already in cart
      const existingIdx = prev.findIndex(item => item.product_id === product.id && item.size_id === size.id);
      
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + qty;
        const maxQty = size.available_quantity || size.quantity || 99;
        
        updated[existingIdx].quantity = Math.min(newQty, maxQty);
        return updated;
      } else {
        return [...prev, {
          product_id: product.id,
          size_id: size.id,
          quantity: qty,
          price: product.effective_price || product.selling_price,
          product: product,
          size: size
        }];
      }
    });

    setSelectedProduct(null); // Close modal
    setIsCartOpen(true); // Open cart drawer to show items
  };

  // Quick add from product list (opens modal if there are sizes, otherwise adds first size)
  const handleQuickAdd = (product) => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedProduct(product);
    }
  };

  // Update Item Quantity in Cart
  const handleUpdateCartQty = (productId, sizeId, newQty) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product_id === productId && item.size_id === sizeId) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  // Remove Item from Cart
  const handleRemoveCartItem = (productId, sizeId) => {
    setCartItems(prev => prev.filter(item => !(item.product_id === productId && item.size_id === sizeId)));
  };

  // Toggle favorite
  const handleToggleFavorite = (id) => {
    setFavorites(prev => {
      if (prev.includes(id)) {
        return prev.filter(favId => favId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Order Submission
  const handleSubmitOrder = async (orderPayload) => {
    setCheckoutLoading(true);
    try {
      const res = await api.createOrder(orderPayload);
      if (res.success) {
        setLastOrder(res.data);
        setCartItems([]); // Clear cart
        setActiveView('success');
      } else {
        alert(res.message || 'فشل في إتمام الطلب، يرجى التحقق من تعبئة البيانات.');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الاتصال بالسيرفر لإتمام الطلب.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActiveView('shop');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 text-slate-800 dark:text-slate-100 flex flex-col font-cairo">
      
      {/* Navbar component */}
      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        darkMode={darkMode}
        onThemeToggle={() => setDarkMode(!darkMode)}
        user={user}
        onLoginClick={() => setShowLoginModal(true)}
        onLogoutClick={handleLogout}
        onOrdersClick={() => setActiveView('orders')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* SHOP VIEW */}
        {activeView === 'shop' && (
          <div className="space-y-6">
            
            {/* Hero promo Section */}
            <HeroSection 
              settings={settings} 
              onShopNow={() => {
                setSearchQuery('');
                setGenderType('');
                setHasDiscount('');
                setPage(1);
              }}
              onBrowseOffers={() => {
                setHasDiscount('1');
                setPage(1);
              }}
            />

            {/* Filters panel */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-primary" />
                <span className="font-bold text-sm">تصفية المنتجات حسب:</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Gender Type Select */}
                <select
                  value={genderType}
                  onChange={(e) => { setGenderType(e.target.value); setPage(1); }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold focus:outline-none border-none"
                >
                  <option value="">كل التصنيفات (ولادي وبناتي)</option>
                  <option value="boys">ولادي فقط 👦</option>
                  <option value="girls">بناتي فقط 👧</option>
                  <option value="boys_girls">ولادي وبناتي مشترك 👦👧</option>
                  <option value="accessories">اكسسوارات 🎒</option>
                </select>

                {/* Has Discount Select */}
                <select
                  value={hasDiscount}
                  onChange={(e) => { setHasDiscount(e.target.value); setPage(1); }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold focus:outline-none border-none"
                >
                  <option value="">كل المنتجات</option>
                  <option value="1">العروض والتخفيضات فقط 🏷️</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 border border-red-200 dark:border-red-800">
                <AlertCircle size={20} />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            {/* Products Grid */}
            {products.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-stretch">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleQuickAdd}
                      onProductClick={setSelectedProduct}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center pt-8">
                    <button
                      onClick={() => loadProducts(false)}
                      disabled={loading}
                      className="px-8 py-3 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold text-sm transition-all hover:scale-105 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {loading ? 'جاري التحميل...' : 'تحميل المزيد من الملابس'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 p-6 space-y-4">
                  <span className="text-4xl">🔎</span>
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 text-lg">لم نجد أي منتجات تطابق البحث</h3>
                  <p className="text-slate-400 text-sm">جرب البحث بكلمات مختلفة أو تعديل فلاتر التصفية.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setGenderType(''); setHasDiscount(''); }}
                    className="px-6 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors"
                  >
                    إعادة تعيين الفلاتر
                  </button>
                </div>
              )
            )}

            {/* Secondary loading indicator */}
            {loading && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <p className="text-slate-400 text-sm mt-3">جاري تحميل تشكيلة الملابس...</p>
              </div>
            )}
          </div>
        )}

        {/* CHECKOUT VIEW */}
        {activeView === 'checkout' && (
          <CheckoutForm
            cartItems={cartItems}
            onBackToCart={() => setActiveView('shop')}
            onSubmitOrder={handleSubmitOrder}
            isLoading={checkoutLoading}
          />
        )}

        {/* ORDER SUCCESS VIEW */}
        {activeView === 'success' && (
          <OrderSuccess
            order={lastOrder}
            onGoToShop={() => setActiveView('shop')}
          />
        )}

        {/* ORDERS LIST VIEW */}
        {activeView === 'orders' && (
          <OrdersList
            onBackToShop={() => setActiveView('shop')}
          />
        )}

      </main>

      {/* Cart Drawer sliding sidebar */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutClick={() => {
          setIsCartOpen(false);
          if (api.isLoggedIn()) {
            setActiveView('checkout');
          } else {
            setShowLoginModal(true);
          }
        }}
      />

      {/* Product Details overlay Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Login Popup Modal */}
      {showLoginModal && (
        <LoginForm
          onLoginSuccess={(userData) => {
            setUser(userData);
            setShowLoginModal(false);
            if (cartItems.length > 0) {
              setActiveView('checkout');
            }
          }}
          onCancel={() => setShowLoginModal(false)}
        />
      )}

      {/* Footer Branding */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors py-6 text-center text-xs text-slate-400 mt-12">
        <p className="font-semibold text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} بارانا كيدز - جميع الحقوق محفوظة.</p>
        <p className="mt-1">صمم بأرقى معايير واجهات المستخدم لمتاجر الويب الحديثة.</p>
      </footer>

    </div>
  );
}
