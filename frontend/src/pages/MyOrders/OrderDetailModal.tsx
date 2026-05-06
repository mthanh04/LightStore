import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Order } from '../../services/orderService';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onCancel?: (id: string) => void;
}

const fmt = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  Pending:    { bg: '#FEF9C3', color: '#854D0E', label: 'Chờ xử lý' },
  Processing: { bg: '#DBEAFE', color: '#1E40AF', label: 'Đang xử lý' },
  Shipped:    { bg: '#EDE9FE', color: '#5B21B6', label: 'Đang giao' },
  Delivered:  { bg: '#DCFCE7', color: '#166534', label: 'Đã giao' },
  Cancelled:  { bg: '#FEE2E2', color: '#991B1B', label: 'Đã hủy' },
};

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onCancel }) => {
  if (!order) return null;

  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.Pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <div 
        className="bg-white rounded-[20px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-[20px] font-[800] text-[#171717]">
            Chi tiết đơn hàng
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-[#525252]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F5F5F5] p-4 rounded-[12px]">
            <div>
              <p className="text-[13px] text-[#A3A3A3] mb-1">Mã đơn hàng</p>
              <p className="text-[15px] font-[700] text-[#D946EF]">#{order._id.slice(-8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#A3A3A3] mb-1">Ngày đặt</p>
              <p className="text-[15px] font-[600] text-[#171717]">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#A3A3A3] mb-1">Trạng thái</p>
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-[700]"
                style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="text-[16px] font-[700] text-[#171717] mb-3">Thông tin nhận hàng</h3>
            <div className="bg-white border border-[#E5E5E5] p-4 rounded-[12px]">
              <p className="text-[15px] font-[600] text-[#171717] mb-1">{order.shippingAddress.fullName}</p>
              <p className="text-[14px] text-[#525252] mb-1">SĐT: {order.shippingAddress.phone}</p>
              <p className="text-[14px] text-[#525252]">Địa chỉ: {order.shippingAddress.address}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-[16px] font-[700] text-[#171717] mb-3">Sản phẩm ({order.orderItems.length})</h3>
            <div className="border border-[#E5E5E5] rounded-[12px] divide-y divide-[#E5E5E5]">
              {order.orderItems.map(item => (
                <div key={item._id} className="flex gap-4 p-4">
                  <div className="w-16 h-16 rounded-[8px] bg-[#F5F5F5] overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">💡</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-[600] text-[#171717] line-clamp-2 mb-1">{item.name}</p>
                    <p className="text-[14px] text-[#525252]">x{item.quantity}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-[700] text-[#171717]">{fmt(item.price)}</p>
                    <p className="text-[13px] font-[600] text-[#D946EF] mt-1">Tổng: {fmt(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-[#E5E5E5] pt-4 space-y-2">
            <div className="flex justify-between text-[15px] text-[#525252]">
              <span>Tạm tính</span>
              <span className="font-[600]">{fmt(order.totalPrice)}</span>
            </div>
            <div className="flex justify-between text-[15px] text-[#525252]">
              <span>Phí vận chuyển</span>
              <span className="font-[600]">{fmt(30000)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#E5E5E5]">
              <span className="text-[18px] font-[700] text-[#171717]">Tổng cộng</span>
              <span className="text-[22px] font-[800] text-[#D946EF]">{fmt(order.totalPrice + 30000)}</span>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-[#E5E5E5] px-6 py-4 flex justify-end gap-3 rounded-b-[20px]">
          {order.status === 'Pending' && onCancel && (
            <button 
              onClick={() => {
                if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
                  onCancel(order._id);
                }
              }}
              className="px-6 py-2.5 bg-white text-[#EF4444] border border-[#EF4444] font-[700] rounded-full hover:bg-[#FEF2F2] transition-colors"
            >
              Hủy đơn hàng
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-[#171717] text-white font-[700] rounded-full hover:bg-[#262626] transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
