import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  ShoppingBagIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { createOrder } from '../../services/checkoutService';
import { useToast } from '../../components/common/Toast';

const fmt = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

interface FormData {
  fullName: string;
  phone: string;
  address: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  address?: string;
}

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [form, setForm] = useState<FormData>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const shipping = 30000;
  const grandTotal = totalPrice + shipping;

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <ShoppingBagIcon className="w-16 h-16 text-[#D946EF] opacity-40 mb-4" />
        <h2
          className="text-[22px] font-[800] text-[#171717] mb-2"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Giỏ hàng trống
        </h2>
        <p className="text-[14px] text-[#525252] mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Vui lòng thêm sản phẩm trước khi đặt hàng.
        </p>
        <Link
          to="/shop"
          className="h-[44px] px-8 bg-[#D946EF] text-white rounded-full font-[700] hover:bg-[#C026D3] transition-all flex items-center"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Đi mua sắm
        </Link>
      </div>
    );
  }

  // ── Success screen ──────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-6 animate-slide-up">
          <CheckCircleIcon className="w-12 h-12 text-[#22C55E]" />
        </div>
        <h2
          className="text-[28px] font-[800] text-[#171717] mb-2"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Đặt hàng thành công! 🎉
        </h2>
        <p className="text-[15px] text-[#525252] mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Cảm ơn bạn đã tin tưởng LightStore.
        </p>
        {orderId && (
          <p className="text-[13px] text-[#A3A3A3] mb-8" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Mã đơn hàng:{' '}
            <code className="font-[700] text-[#D946EF]">#{orderId.slice(-8).toUpperCase()}</code>
          </p>
        )}
        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            to="/orders"
            className="h-[50px] px-8 bg-[#D946EF] text-white rounded-full font-[700] hover:bg-[#C026D3] transition-all shadow-medium flex items-center gap-2"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Xem đơn hàng của tôi
          </Link>
          <Link
            to="/shop"
            className="h-[50px] px-8 border-2 border-[#D946EF] text-[#D946EF] rounded-full font-[700] hover:bg-[#FDF4FF] transition-all flex items-center"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  // ── Validation ─────────────────────────────────────────
  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.fullName.trim()) errs.fullName = 'Vui lòng nhập họ tên';
    if (!form.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{9,11}$/.test(form.phone.trim())) errs.phone = 'Số điện thoại không hợp lệ';
    if (!form.address.trim()) errs.address = 'Vui lòng nhập địa chỉ giao hàng';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const order = await createOrder({
        orderItems: items.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        },
      });
      clearCart();
      setOrderId(order._id);
      setSuccess(true);
      showToast('Đặt hàng thành công!', 'success');
    } catch {
      showToast('Đặt hàng thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full h-[44px] pl-10 pr-4 border rounded-[12px] text-[15px] placeholder-[#A3A3A3] transition-all focus:outline-none
    ${errors[field]
      ? 'border-[#EF4444] bg-[#FEF2F2] focus:ring-2 focus:ring-[#EF4444]/15'
      : 'border-[#D4D4D4] bg-white focus:border-[#D946EF] focus:ring-2 focus:ring-[#D946EF]/15'
    }`;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <h1
        className="text-[28px] md:text-[32px] font-[800] text-[#171717] mb-8"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        Đặt hàng
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Shipping form ── */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-[16px] border border-[#E5E5E5] p-6">
            <h2
              className="text-[18px] font-[700] text-[#171717] mb-1 flex items-center gap-2"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <MapPinIcon className="w-5 h-5 text-[#D946EF]" />
              Thông tin giao hàng
            </h2>
            {user?.phone || user?.address ? (
              <p className="text-[12px] text-[#A3A3A3] mb-5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Đã điền từ hồ sơ của bạn.{' '}
                <Link to="/profile" className="text-[#D946EF] hover:underline font-[600]">Cập nhật hồ sơ</Link>
              </p>
            ) : (
              <p className="text-[12px] text-[#A3A3A3] mb-5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <Link to="/profile" className="text-[#D946EF] hover:underline font-[600]">Lưu thông tin giao hàng</Link>{' '}
                vào hồ sơ để tự động điền lần sau.
              </p>
            )}

            {/* Full name */}
            <div className="mb-4">
              <label
                className="block text-[13px] font-[600] text-[#171717] mb-1.5"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Họ và tên *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className={inputClass('fullName')}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
              {errors.fullName && (
                <p className="text-[12px] text-[#EF4444] mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label
                className="block text-[13px] font-[600] text-[#171717] mb-1.5"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Số điện thoại *
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                <input
                  type="tel"
                  placeholder="0912 345 678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass('phone')}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
              {errors.phone && (
                <p className="text-[12px] text-[#EF4444] mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label
                className="block text-[13px] font-[600] text-[#171717] mb-1.5"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Địa chỉ giao hàng *
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-3.5 w-4 h-4 text-[#A3A3A3]" />
                <textarea
                  rows={3}
                  placeholder="123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={`w-full pl-10 pr-4 pt-2.5 pb-2.5 border rounded-[12px] text-[15px] placeholder-[#A3A3A3] transition-all focus:outline-none resize-none ${
                    errors.address
                      ? 'border-[#EF4444] bg-[#FEF2F2] focus:ring-2 focus:ring-[#EF4444]/15'
                      : 'border-[#D4D4D4] bg-white focus:border-[#D946EF] focus:ring-2 focus:ring-[#D946EF]/15'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
              {errors.address && (
                <p className="text-[12px] text-[#EF4444] mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {errors.address}
                </p>
              )}
            </div>
          </div>

          {/* Payment method (static) */}
          <div className="bg-white rounded-[16px] border border-[#E5E5E5] p-6">
            <h2
              className="text-[18px] font-[700] text-[#171717] mb-4"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Phương thức thanh toán
            </h2>
            <div className="flex items-center gap-3 p-3 bg-[#FDF4FF] border-2 border-[#D946EF] rounded-[12px]">
              <div className="w-5 h-5 rounded-full border-2 border-[#D946EF] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D946EF]" />
              </div>
              <span className="text-[14px] font-[700] text-[#171717]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Thanh toán khi nhận hàng (COD)
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-[54px] bg-[#D946EF] hover:bg-[#C026D3] text-white text-[16px] font-[700] rounded-full flex items-center justify-center gap-2 shadow-medium hover:shadow-large transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Xác nhận đặt hàng
              </>
            )}
          </button>
        </form>

        {/* ── Order summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[16px] border border-[#E5E5E5] p-5 sticky top-24">
            <h2
              className="text-[18px] font-[700] text-[#171717] mb-4 flex items-center gap-2"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <ShoppingBagIcon className="w-5 h-5 text-[#D946EF]" />
              Đơn hàng ({items.length})
            </h2>

            {/* Items list */}
            <div className="space-y-3 mb-4 max-h-[280px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item._id} className="flex gap-3">
                  <div className="w-12 h-12 rounded-[8px] overflow-hidden bg-[#F5F5F5] shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">💡</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[13px] font-[700] text-[#171717] line-clamp-1"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      {item.name}
                    </p>
                    <p className="text-[12px] text-[#525252]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      x{item.quantity} · {fmt(item.price)}
                    </p>
                  </div>
                  <span
                    className="text-[13px] font-[700] text-[#171717] shrink-0"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {fmt(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-[#E5E5E5] pt-4 space-y-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              <div className="flex justify-between text-[14px] text-[#525252]">
                <span>Tạm tính</span>
                <span className="font-[600]">{fmt(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-[14px] text-[#525252]">
                <span>Phí vận chuyển</span>
                <span className="font-[600]">{fmt(shipping)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5E5E5]">
                <span className="text-[16px] font-[700] text-[#171717]">Tổng cộng</span>
                <span
                  className="text-[20px] font-[800] text-[#D946EF]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {fmt(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
