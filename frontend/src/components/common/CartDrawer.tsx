import React from 'react';
import { Link } from 'react-router-dom';
import {
  XMarkIcon,
  TrashIcon,
  ShoppingBagIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '../../store/cartStore';

const fmt = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const CartDrawer: React.FC = () => {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQty, totalPrice, totalItems } =
    useCartStore();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[150] transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-[160] flex flex-col shadow-overlay transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5 text-[#D946EF]" />
            <h2
              className="text-[18px] font-[700] text-[#171717]"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Giỏ hàng
            </h2>
            {totalItems > 0 && (
              <span className="bg-[#D946EF] text-white text-[11px] font-[700] rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] text-[#525252] transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FDF4FF] flex items-center justify-center">
                <ShoppingBagIcon className="w-8 h-8 text-[#D946EF] opacity-60" />
              </div>
              <p
                className="text-[15px] text-[#525252]"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Giỏ hàng đang trống
              </p>
              <button
                onClick={closeDrawer}
                className="text-[14px] text-[#D946EF] font-[600] hover:underline cursor-pointer"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Tiếp tục mua sắm →
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                className="flex gap-3 bg-[#FAFAFA] rounded-[12px] p-3 border border-[#E5E5E5]"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-[8px] overflow-hidden bg-[#F5F5F5] shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">💡</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[13px] font-[700] text-[#171717] line-clamp-2 leading-tight"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {item.name}
                  </p>
                  <p
                    className="text-[14px] font-[700] text-[#D946EF] mt-1"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {fmt(item.price)}
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 rounded-full border border-[#D4D4D4] flex items-center justify-center text-[#525252] hover:border-[#D946EF] hover:text-[#D946EF] disabled:opacity-30 transition-colors cursor-pointer"
                    >
                      <MinusIcon className="w-3 h-3" />
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
                      className="w-7 h-7 rounded-full border border-[#D4D4D4] flex items-center justify-center text-[#525252] hover:border-[#D946EF] hover:text-[#D946EF] disabled:opacity-30 transition-colors cursor-pointer"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item._id)}
                  className="self-start w-7 h-7 flex items-center justify-center text-[#A3A3A3] hover:text-[#EF4444] transition-colors cursor-pointer rounded-full hover:bg-[#FEE2E2]"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-[#E5E5E5] space-y-3">
            <div className="flex items-center justify-between">
              <span
                className="text-[15px] text-[#525252]"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Tổng cộng
              </span>
              <span
                className="text-[20px] font-[800] text-[#171717]"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {fmt(totalPrice)}
              </span>
            </div>
            <Link
              to="/checkout"
              onClick={closeDrawer}
              className="block w-full h-[50px] bg-[#D946EF] hover:bg-[#C026D3] text-white text-[15px] font-[700] rounded-full flex items-center justify-center gap-2 transition-all duration-200 shadow-medium hover:shadow-large"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Đặt hàng ngay
            </Link>
            <Link
              to="/cart"
              onClick={closeDrawer}
              className="block w-full h-[42px] border-2 border-[#D946EF] text-[#D946EF] text-[14px] font-[700] rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[#FDF4FF]"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Xem giỏ hàng
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
