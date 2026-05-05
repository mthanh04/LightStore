import React, { useEffect, useState, useCallback } from 'react';
import { ShoppingCartIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getAllOrders, updateOrderStatus, type Order } from '../../services/orderService';

const fmt = (n: number) => n.toLocaleString('vi-VN') + '₫';

const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const map: Record<Order['status'], { color: string; bg: string; text: string }> = {
    Pending: { bg: '#FEF9C3', color: '#E87400', text: 'Chờ xử lý' },
    Processing: { bg: '#DBEAFE', color: '#003399', text: 'Đang xử lý' },
    Shipped: { bg: '#E0E7FF', color: '#4338CA', text: 'Đang giao' },
    Delivered: { bg: '#DCFCE7', color: '#0A8A00', text: 'Đã giao' },
    Cancelled: { bg: '#FEE2E2', color: '#CC0008', text: 'Đã hủy' },
  };
  const m = map[status] || map.Pending;
  return (
    <span className="inline-flex items-center px-2 py-1 text-[11px] font-bold rounded-[4px]"
      style={{ backgroundColor: m.bg, color: m.color, fontFamily: 'Noto Sans, sans-serif' }}>
      {m.text}
    </span>
  );
};

const SkeletonRow = () => (
  <>{[1,2,3,4,5].map(i => (
    <tr key={i} className="border-b border-[#DFDFDF]">
      {[100, 150, 120, 80, 150].map((w,j) => (
        <td key={j} className="px-4 py-3">
          <div className="h-4 bg-[#DFDFDF] rounded animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  ))}</>
);

const Toast = ({ msg, type }: { msg: string; type: 'success' | 'error' }) => (
  <div className={`fixed top-5 right-5 z-[100] px-4 py-3 rounded-[4px] text-white text-[14px] shadow-lg ${type === 'success' ? 'bg-[#0A8A00]' : 'bg-[#CC0008]'}`}
    style={{ fontFamily: 'Noto Sans, sans-serif' }}>
    {type === 'success' ? '✓' : '✕'} {msg}
  </div>
);

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);
  
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOrders(page, 10, statusFilter);
      setOrders(res.data);
      setPagination(res.pagination);
    } catch {
      showToast('Không thể tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, newStatus: Order['status']) => {
    setUpdating(id);
    try {
      const updated = await updateOrderStatus(id, newStatus);
      setOrders(prev => prev.map(o => o._id === id ? updated : o));
      showToast('Đã cập nhật trạng thái', 'success');
    } catch {
      showToast('Cập nhật thất bại', 'error');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#111111] leading-tight" style={{ fontFamily: 'Noto Sans, sans-serif' }}>Đơn hàng</h1>
        <p className="text-[14px] text-[#767676] mt-0.5" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          Quản lý {loading ? '...' : pagination.totalItems} đơn hàng
        </p>
      </div>

      <div className="bg-white border border-[#DFDFDF] rounded-[4px] shadow-sm">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-[#DFDFDF]">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-[40px] px-3 border border-[#DFDFDF] rounded-[4px] text-[14px] text-[#111111] bg-white outline-none focus:border-[#003399] cursor-pointer"
            style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Chờ xử lý</option>
            <option value="Processing">Đang xử lý</option>
            <option value="Shipped">Đang giao</option>
            <option value="Delivered">Đã giao</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F5] border-b border-[#DFDFDF]">
                {['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái', 'Ngày đặt'].map(h => (
                  <th key={h} className="px-4 py-3 text-[12px] font-bold text-[#484848] uppercase tracking-wide whitespace-nowrap"
                    style={{ fontFamily: 'Noto Sans, sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRow /> : orders.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-[#767676]">
                    <ShoppingCartIcon className="w-10 h-10 opacity-30" />
                    <p className="text-[14px]" style={{ fontFamily: 'Noto Sans, sans-serif' }}>Chưa có đơn hàng nào</p>
                  </div>
                </td></tr>
              ) : orders.map(o => (
                <tr key={o._id} className="border-b border-[#DFDFDF] hover:bg-[#F5F5F5] transition-colors">
                  <td className="px-4 py-3">
                    <code className="text-[13px] text-[#003399] bg-[#003399]/10 px-2 py-0.5 rounded-[4px] font-bold"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      #{o._id.slice(-6).toUpperCase()}
                    </code>
                    <div className="text-[11px] text-[#767676] mt-1 font-mono">{o.orderItems.length} sản phẩm</div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[14px] font-bold text-[#111111]" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                      {o.shippingAddress.fullName}
                    </p>
                    <p className="text-[12px] text-[#767676]" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                      {o.shippingAddress.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[15px] font-bold text-[#111111]" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                    {fmt(o.totalPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      disabled={updating === o._id}
                      value={o.status}
                      onChange={(e) => handleStatusChange(o._id, e.target.value as Order['status'])}
                      className={`h-[30px] pl-2 pr-6 border rounded-[4px] text-[12px] font-bold outline-none cursor-pointer appearance-none bg-no-repeat bg-right disabled:opacity-50
                        ${o.status === 'Pending' ? 'bg-[#FEF9C3] text-[#E87400] border-[#E87400]/30' : ''}
                        ${o.status === 'Processing' ? 'bg-[#DBEAFE] text-[#003399] border-[#003399]/30' : ''}
                        ${o.status === 'Shipped' ? 'bg-[#E0E7FF] text-[#4338CA] border-[#4338CA]/30' : ''}
                        ${o.status === 'Delivered' ? 'bg-[#DCFCE7] text-[#0A8A00] border-[#0A8A00]/30' : ''}
                        ${o.status === 'Cancelled' ? 'bg-[#FEE2E2] text-[#CC0008] border-[#CC0008]/30' : ''}
                      `}
                      style={{
                        fontFamily: 'Noto Sans, sans-serif',
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundSize: '14px',
                        backgroundPosition: 'calc(100% - 6px) center',
                      }}
                    >
                      <option value="Pending">Chờ xử lý</option>
                      <option value="Processing">Đang xử lý</option>
                      <option value="Shipped">Đang giao</option>
                      <option value="Delivered">Đã giao</option>
                      <option value="Cancelled">Đã hủy</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#767676]" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                    {new Date(o.createdAt).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#DFDFDF]">
            <p className="text-[13px] text-[#767676]" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              Trang {pagination.currentPage} / {pagination.totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-[4px] border border-[#DFDFDF] text-[#484848] hover:border-[#003399] hover:text-[#003399] disabled:opacity-40 transition-all cursor-pointer">
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-[4px] border border-[#DFDFDF] text-[#484848] hover:border-[#003399] hover:text-[#003399] disabled:opacity-40 transition-all cursor-pointer">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
