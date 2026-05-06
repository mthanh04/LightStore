import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { getMyOrders } from '../../services/checkoutService';
import { cancelOrder, type Order } from '../../services/orderService';
import OrderDetailModal from './OrderDetailModal';

const fmt = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const STATUS_MAP: Record<Order['status'], { bg: string; color: string; label: string }> = {
  Pending:    { bg: '#FEF9C3', color: '#854D0E', label: 'Chờ xử lý' },
  Processing: { bg: '#DBEAFE', color: '#1E40AF', label: 'Đang xử lý' },
  Shipped:    { bg: '#EDE9FE', color: '#5B21B6', label: 'Đang giao' },
  Delivered:  { bg: '#DCFCE7', color: '#166534', label: 'Đã giao' },
  Cancelled:  { bg: '#FEE2E2', color: '#991B1B', label: 'Đã hủy' },
};

const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.Pending;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-[700]"
      style={{ backgroundColor: s.bg, color: s.color, fontFamily: 'Roboto, sans-serif' }}
    >
      {s.label}
    </span>
  );
};

const SkeletonRow = () => (
  <>
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-[16px] border border-[#E5E5E5] p-5 animate-pulse">
        <div className="flex justify-between mb-3">
          <div className="h-4 bg-[#F0F0F0] rounded w-1/4" />
          <div className="h-6 bg-[#F0F0F0] rounded-full w-20" />
        </div>
        <div className="h-3 bg-[#F0F0F0] rounded w-1/3 mb-2" />
        <div className="h-3 bg-[#F0F0F0] rounded w-1/2" />
      </div>
    ))}
  </>
);

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalItems: 0, limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyOrders(page, 10);
      setOrders(res.data);
      setPagination(res.pagination || {
        currentPage: 1, totalPages: 1, totalItems: res.data.length, limit: 10
      });
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleCancelOrder = async (id: string) => {
    try {
      const updatedOrder = await cancelOrder(id);
      setOrders(orders.map(o => o._id === id ? updatedOrder : o));
      setSelectedOrder(updatedOrder);
      alert('Đã hủy đơn hàng thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Hủy đơn hàng thất bại');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-[28px] md:text-[32px] font-[800] text-[#171717]"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Đơn hàng của tôi
        </h1>
        <p className="text-[15px] text-[#525252] mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {loading ? '...' : `${pagination.totalItems} đơn hàng`}
        </p>
      </div>

      {/* Order list */}
      <div className="space-y-4">
        {loading ? (
          <SkeletonRow />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-[#FDF4FF] flex items-center justify-center mb-5">
              <ClipboardDocumentListIcon className="w-10 h-10 text-[#D946EF] opacity-50" />
            </div>
            <h3
              className="text-[20px] font-[700] text-[#171717] mb-2"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Chưa có đơn hàng nào
            </h3>
            <p className="text-[14px] text-[#525252] mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Hãy mua sắm và đặt hàng ngay!
            </p>
            <Link
              to="/shop"
              className="h-[44px] px-8 bg-[#D946EF] text-white rounded-full font-[700] hover:bg-[#C026D3] transition-all shadow-medium flex items-center"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Đi mua sắm ngay
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white rounded-[16px] border border-[#E5E5E5] p-5 hover:border-[#D946EF] hover:shadow-medium transition-all cursor-pointer"
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <div>
                  <code
                    className="text-[14px] font-[700] text-[#D946EF] bg-[#FDF4FF] px-2 py-0.5 rounded-[6px]"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    #{order._id.slice(-8).toUpperCase()}
                  </code>
                  <span
                    className="text-[13px] text-[#A3A3A3] ml-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Items preview */}
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {order.orderItems.slice(0, 4).map((item) => (
                  <div
                    key={item._id}
                    className="w-12 h-12 rounded-[8px] overflow-hidden bg-[#F5F5F5] shrink-0"
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">💡</div>
                    )}
                  </div>
                ))}
                {order.orderItems.length > 4 && (
                  <div className="w-12 h-12 rounded-[8px] bg-[#F5F5F5] shrink-0 flex items-center justify-center text-[12px] font-[700] text-[#525252]">
                    +{order.orderItems.length - 4}
                  </div>
                )}
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <div>
                  <p className="text-[13px] text-[#A3A3A3]">
                    {order.orderItems.length} sản phẩm · Giao đến:{' '}
                    <span className="text-[#525252] font-[600]">
                      {order.shippingAddress.fullName}
                    </span>
                  </p>
                </div>
                <p
                  className="text-[17px] font-[800] text-[#171717]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {fmt(order.totalPrice + 30000)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#E5E5E5] text-[#525252] hover:border-[#D946EF] hover:text-[#D946EF] disabled:opacity-30 transition-all cursor-pointer"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className="text-[14px] text-[#525252]" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#E5E5E5] text-[#525252] hover:border-[#D946EF] hover:text-[#D946EF] disabled:opacity-30 transition-all cursor-pointer"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onCancel={handleCancelOrder}
        />
      )}
    </div>
  );
};

export default MyOrders;
