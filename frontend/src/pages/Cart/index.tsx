import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '../../store/cartStore';

const fmt = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const Cart: React.FC = () => {
  const { items, removeItem, updateQty, totalPrice, totalItems, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-[#FDF4FF] flex items-center justify-center mb-6">
          <ShoppingBagIcon className="w-12 h-12 text-[#D946EF] opacity-60" />
        </div>
        <h2
          className="text-[24px] font-[800] text-[#171717] mb-2"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Giỏ hàng trống
        </h2>
        <p
          className="text-[15px] text-[#525252] mb-8"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Hãy thêm sản phẩm vào giỏ để tiếp tục mua sắm!
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 h-[50px] px-8 bg-[#D946EF] text-white rounded-full text-[15px] font-[700] hover:bg-[#C026D3] transition-all shadow-medium hover:shadow-large"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          <ShoppingBagIcon className="w-5 h-5" />
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  const shipping = 30000;
  const grandTotal = totalPrice + shipping;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-[28px] md:text-[32px] font-[800] text-[#171717]"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Giỏ hàng{' '}
          <span className="text-[#D946EF]">({totalItems})</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-[13px] text-[#EF4444] font-[600] hover:underline cursor-pointer"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Cart items ── */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-[16px] border border-[#E5E5E5] p-4 flex gap-4 hover:border-[#D4D4D4] transition-colors"
            >
              {/* Image */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-[12px] overflow-hidden bg-[#F5F5F5] shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">💡</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className="text-[15px] font-[700] text-[#171717] line-clamp-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {item.name}
                  </h3>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="w-7 h-7 flex items-center justify-center text-[#A3A3A3] hover:text-[#EF4444] rounded-full hover:bg-[#FEE2E2] transition-colors cursor-pointer shrink-0"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <p
                    className="text-[16px] font-[800] text-[#D946EF]"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {fmt(item.price * item.quantity)}
                  </p>

                  {/* Qty */}
                  <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-full px-2 py-1">
                    <button
                      onClick={() => updateQty(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[#525252] hover:bg-white hover:text-[#D946EF] disabled:opacity-30 transition-all cursor-pointer"
                    >
                      <MinusIcon className="w-3.5 h-3.5" />
                    </button>
                    <span
                      className="w-6 text-center text-[14px] font-[700] text-[#171717]"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item._id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[#525252] hover:bg-white hover:text-[#D946EF] disabled:opacity-30 transition-all cursor-pointer"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p
                  className="text-[12px] text-[#A3A3A3] mt-1"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Đơn giá: {fmt(item.price)} · Còn {item.stock} trong kho
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[16px] border border-[#E5E5E5] p-5 sticky top-24">
            <h2
              className="text-[18px] font-[700] text-[#171717] mb-4"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
              <div className="flex justify-between text-[14px] text-[#525252]">
                <span>Tạm tính ({totalItems} sản phẩm)</span>
                <span className="font-[600]">{fmt(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-[14px] text-[#525252]">
                <span>Phí vận chuyển</span>
                <span className="font-[600]">{fmt(shipping)}</span>
              </div>
              <div className="border-t border-[#E5E5E5] pt-3 flex justify-between">
                <span className="text-[16px] font-[700] text-[#171717]">Tổng cộng</span>
                <span
                  className="text-[20px] font-[800] text-[#D946EF]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {fmt(grandTotal)}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="flex items-center justify-center gap-2 w-full h-[50px] bg-[#D946EF] hover:bg-[#C026D3] text-white text-[15px] font-[700] rounded-full transition-all shadow-medium hover:shadow-large"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Tiến hành đặt hàng
              <ArrowRightIcon className="w-4 h-4" />
            </Link>

            <Link
              to="/shop"
              className="flex items-center justify-center mt-3 text-[14px] text-[#D946EF] font-[600] hover:underline"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
