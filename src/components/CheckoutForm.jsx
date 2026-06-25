import React, { useState } from 'react';
import { CreditCard, Truck, User, Phone, MapPin, NotepadText, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CheckoutForm({ cartItems, onBackToCart, onSubmitOrder, isLoading }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_phone2: '',
    customer_address: '',
    notes: '',
    governorate: 'بغداد' // Fallback/default governorate
  });

  const [errors, setErrors] = useState({});

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Custom delivery fee: Baghdad: 3000, rest of Iraq: 5000
  const deliveryFee = formData.governorate === 'بغداد' ? 3000 : 5000;
  const finalTotal = totalAmount + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validatePhone = (phone) => {
    // Regex for Iraqi phone number (must be 11 digits starting with 07 or +9647 or 7)
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 10) return false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.customer_name.trim()) newErrors.customer_name = 'الاسم الكامل مطلوب';
    
    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'رقم الهاتف الأول مطلوب';
    } else if (!validatePhone(formData.customer_phone)) {
      newErrors.customer_phone = 'رقم الهاتف غير صالح، يرجى كتابة رقم عراقي صحيح';
    }

    if (formData.customer_phone2 && !validatePhone(formData.customer_phone2)) {
      newErrors.customer_phone2 = 'رقم الهاتف الثاني غير صالح';
    }

    if (!formData.customer_address.trim()) newErrors.customer_address = 'العنوان التفصيلي مطلوب';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare address with governorate
    const fullAddress = `${formData.governorate} - ${formData.customer_address}`;

    onSubmitOrder({
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_phone2: formData.customer_phone2 || null,
      customer_address: fullAddress,
      notes: formData.notes || null,
      items: cartItems.map(item => ({
        product_id: item.product_id,
        size_id: item.size_id,
        quantity: item.quantity
      }))
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price) + ' د.ع';
  };

  const iraqiGovernorates = [
    'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'بابل', 'الأنبار', 
    'ديالى', 'كركوك', 'صلاح الدين', 'المثنى', 'ميسان', 'ذي قار', 'الواسـط', 
    'دهوك', 'السليمانية', 'القادسية'
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in" style={{ direction: 'rtl' }}>
      
      {/* Back button */}
      <button 
        onClick={onBackToCart}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-6 font-semibold transition-colors"
      >
        <ArrowRight size={18} />
        <span>العودة لسلة المشتريات</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Form panel */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b pb-4 border-slate-100 dark:border-slate-750">
              <Truck className="text-primary" size={22} />
              <span>معلومات الشحن والتوصيل</span>
            </h2>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                الاسم الكامل للزبون:
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  placeholder="اكتب اسم المستلم الثلاثي..."
                  className={`w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-10 py-3 rounded-2xl border ${errors.customer_name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-sm`}
                />
                <User size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.customer_name && <span className="text-xs text-red-500">{errors.customer_name}</span>}
            </div>

            {/* Phones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone 1 */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  رقم الهاتف (الأساسي):
                </label>
                <div className="relative">
                  <input 
                    type="tel" 
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    placeholder="مثال: 07700000000"
                    className={`w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-10 py-3 rounded-2xl border ${errors.customer_phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-sm`}
                  />
                  <Phone size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                {errors.customer_phone && <span className="text-xs text-red-500">{errors.customer_phone}</span>}
              </div>

              {/* Phone 2 */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  رقم هاتف ثانٍ (اختياري):
                </label>
                <div className="relative">
                  <input 
                    type="tel" 
                    name="customer_phone2"
                    value={formData.customer_phone2}
                    onChange={handleInputChange}
                    placeholder="مثال: 07800000000"
                    className={`w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-10 py-3 rounded-2xl border ${errors.customer_phone2 ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-sm`}
                  />
                  <Phone size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                {errors.customer_phone2 && <span className="text-xs text-red-500">{errors.customer_phone2}</span>}
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Governorate Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  المحافظة:
                </label>
                <select 
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-sm"
                >
                  {iraqiGovernorates.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              {/* Detailed Address (Street, District) */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  العنوان بالتفصيل (الحي، الزقاق، الدار، أو علامة مميزة):
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="customer_address"
                    value={formData.customer_address}
                    onChange={handleInputChange}
                    placeholder="مثال: الكرادة، قرب ساحة الحرية، عمارة الرافدين..."
                    className={`w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-10 py-3 rounded-2xl border ${errors.customer_address ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-sm`}
                  />
                  <MapPin size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                {errors.customer_address && <span className="text-xs text-red-500">{errors.customer_address}</span>}
              </div>

            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                ملاحظات حول التوصيل (اختياري):
              </label>
              <div className="relative">
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="اكتب ملاحظاتك للمندوب، مثل: يرجى الاتصال قبل الوصول بنصف ساعة..."
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-sm"
                ></textarea>
                <NotepadText size={18} className="absolute right-3.5 top-4 text-slate-400" />
              </div>
            </div>

          </div>
        </form>

        {/* Order Summary Side Panel */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg border-b pb-3 border-slate-100 dark:border-slate-750">
              ملخص الطلبية
            </h3>

            {/* Items summary list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 justify-between items-center text-xs">
                  <div className="flex-1">
                    <p className="font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{item.product?.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">القياس: {item.size?.size_name} × {item.quantity}</p>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="border-t pt-4 border-slate-100 dark:border-slate-750 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>مجموع المنتجات:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>تكلفة التوصيل ({formData.governorate}):</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-slate-800 dark:text-white font-extrabold text-base border-t border-dashed pt-3 mt-2">
                <span>المبلغ الإجمالي المستحق:</span>
                <span className="text-xl text-primary">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Guarantee / Safe badge */}
            <div className="bg-slate-50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
              <ShieldCheck className="text-emerald-500 flex-shrink-0" size={20} />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                <strong>الدفع عند الاستلام:</strong> نحن نوفر خدمة الدفع عند استلام المنتجات وفحصها لضمان مطابقة الجودة التامة.
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || cartItems.length === 0}
              className={`w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${
                isLoading 
                  ? 'bg-slate-300 dark:bg-slate-750 cursor-wait'
                  : 'bg-primary hover:bg-primary-dark shadow-primary/10 hover:scale-[1.01]'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>تأكيد وشراء الطلب الآن</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
