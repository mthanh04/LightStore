import React, { useEffect, useState, useCallback } from 'react';
import {
  ShoppingCartIcon, ChevronLeftIcon, ChevronRightIcon,
  XMarkIcon, CubeIcon, MapPinIcon, PhoneIcon, UserIcon,
} from '@heroicons/react/24/outline';
import { getAllOrders, getOrderById, updateOrderStatus, type Order } from '../../services/orderService';

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('vi-VN') + '₫';

const STATUS_LABEL: Record<Order['status'], string> = {
  Pending:    'Chờ xử lý',
  Processing: 'Đang xử lý',
  Shipped:    'Đang giao',
  Delivered:  'Đã giao',
  Cancelled:  'Đã hủy',
};
const STATUS_CLS: Record<Order['status'], string> = {
  Pending:    'bg-[#FEF9C3] text-[#E87400] border-[#E87400]/30',
  Processing: 'bg-[#DBEAFE] text-[#003399] border-[#003399]/30',
  Shipped:    'bg-[#E0E7FF] text-[#4338CA] border-[#4338CA]/30',
  Delivered:  'bg-[#DCFCE7] text-[#0A8A00] border-[#0A8A00]/30',
  Cancelled:  'bg-[#FEE2E2] text-[#CC0008] border-[#CC0008]/30',
};

// ── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }: { msg: string; type: 'success' | 'error' }) => (
  <div className={`fixed top-5 right-5 z-[100] px-4 py-3 rounded-[4px] text-white text-[14px] shadow-lg ${type === 'success' ? 'bg-[#0A8A00]' : 'bg-[#CC0008]'}`}
    style={{ fontFamily: 'Roboto, sans-serif' }}>
    {type === 'success' ? '✓' : '✕'} {msg}
  </div>
);

// ── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <>{[1,2,3,4,5,6,7,8].map(i => (
    <tr key={i} className="border-b border-[#DFDFDF]">
      {[100, 150, 120, 90, 100, 70].map((w,j) => (
        <td key={j} className="px-4 py-3">
          <div className="h-4 bg-[#DFDFDF] rounded animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  ))}</>
);

// ── Order Detail Modal ────────────────────────────────────────────────────────
interface DetailModalProps {
  orderId: string | null;
  onClose: () => void;
  onStatusChange: (id: string, status: Order['status']) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ orderId, onClose, onStatusChange }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setOrder(null);
    getOrderById(orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (!orderId) return null;

  const handleStatus = async (newStatus: Order['status']) => {
    if (!order) return;
    setUpdating(true);
    try {
      await onStatusChange(order._id, newStatus);
      setOrder(prev => prev ? { ...prev, status: newStatus } : prev);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative bg-white rounded-[8px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl"
        style={{ boxShadow: '0 8px 24px rgba(17,17,17,0.14)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DFDFDF] shrink-0">
          <div>
            <h3 className="text-[18px] font-bold text-[#111111]" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Chi tiết đơn hàng
            </h3>
            {order && (
              <code className="text-[13px] text-[#003399] font-mono">
                #{order._id.slice(-8).toUpperCase()}
              </code>
            )}
          </div>
          <button onClick={onClose} className="text-[#767676] hover:text-[#111111] cursor-pointer p-1">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 bg-[#F0F0F0] animate-pulse rounded-[6px]" />
              ))}
            </div>
          ) : order ? (
            <>
              {/* Status + Update */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className={`inline-flex items-center px-3 py-1 text-[13px] font-bold rounded-full border ${STATUS_CLS[order.status]}`}>
                  {STATUS_LABEL[order.status]}
                </span>
                {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#767676]" style={{ fontFamily: 'Roboto, sans-serif' }}>Cập nhật:</span>
                    <select
                      value={order.status}
                      disabled={updating}
                      onChange={e => handleStatus(e.target.value as Order['status'])}
                      className="h-[34px] px-3 border border-[#DFDFDF] rounded-[4px] text-[13px] text-[#111111] bg-white outline-none focus:border-[#003399] cursor-pointer disabled:opacity-50"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      <option value="Pending">Chờ xử lý</option>
                      <option value="Processing">Đang xử lý</option>
                      <option value="Shipped">Đang giao</option>
                      <option value="Delivered">Đã giao</option>
                      <option value="Cancelled">Đã hủy</option>
                    </select>
                    {updating && (
                      <svg className="animate-spin w-4 h-4 text-[#003399]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    )}
                  </div>
                )}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shipping info */}
                <div className="bg-[#F7F8FA] rounded-[8px] p-4 space-y-2">
                  <p className="text-[11px] font-bold text-[#767676] uppercase tracking-wide" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Thông tin giao hàng
                  </p>
                  <div className="flex items-start gap-2">
                    <UserIcon className="w-4 h-4 text-[#484848] mt-0.5 shrink-0" />
                    <span className="text-[14px] font-bold text-[#111111]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {order.shippingAddress.fullName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-[#484848] shrink-0" />
                    <span className="text-[13px] text-[#484848]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {order.shippingAddress.phone}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-4 h-4 text-[#484848] mt-0.5 shrink-0" />
                    <span className="text-[13px] text-[#484848]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {order.shippingAddress.address}
                    </span>
                  </div>
                </div>

                {/* Order meta */}
                <div className="bg-[#F7F8FA] rounded-[8px] p-4 space-y-2">
                  <p className="text-[11px] font-bold text-[#767676] uppercase tracking-wide" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Thông tin đơn hàng
                  </p>
                  {order.user && (
                    <div className="flex justify-between text-[13px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <span className="text-[#767676]">Khách hàng</span>
                      <span className="font-bold text-[#111111]">{order.user.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[13px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <span className="text-[#767676]">Ngày đặt</span>
                    <span className="font-bold text-[#111111]">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between text-[13px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <span className="text-[#767676]">Số sản phẩm</span>
                    <span className="font-bold text-[#111111]">{order.orderItems.length}</span>
                  </div>
                  <div className="flex justify-between text-[14px] font-bold border-t border-[#DFDFDF] pt-2 mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <span className="text-[#484848]">Tổng tiền</span>
                    <span className="text-[#003399]">{fmt(order.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Order items */}
              <div>
                <p className="text-[11px] font-bold text-[#767676] uppercase tracking-wide mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Sản phẩm đã đặt ({order.orderItems.length})
                </p>
                <div className="space-y-3">
                  {order.orderItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[#F7F8FA] rounded-[8px]">
                      <div className="w-12 h-12 rounded-[6px] border border-[#DFDFDF] overflow-hidden bg-white shrink-0">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          : <CubeIcon className="w-6 h-6 text-[#DFDFDF] m-3" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-[#111111] truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {item.name}
                        </p>
                        <p className="text-[12px] text-[#767676]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {fmt(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-[14px] font-bold text-[#111111] shrink-0" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {fmt(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-[#767676] py-10">Không thể tải đơn hàng</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-[#DFDFDF] shrink-0">
          <button
            onClick={onClose}
            className="h-[40px] px-6 bg-[#003399] text-white rounded-[4px] text-[14px] font-bold hover:bg-[#002B80] transition-all cursor-pointer"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Orders Page ──────────────────────────────────────────────────────────
const LIMIT = 10;

const Orders: React.FC = () => {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]           = useState(1);
  const [updating, setUpdating]   = useState<string | null>(null);
  const [detailId, setDetailId]   = useState<string | null>(null);
  const [toast, setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOrders(page, LIMIT, statusFilter);
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

  // Ellipsis pagination
  const pageNumbers = Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
    .filter(n => n === 1 || n === pagination.totalPages || Math.abs(n - page) <= 1)
    .reduce<(number | '...')[]>((acc, n, i, arr) => {
      if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...');
      acc.push(n);
      return acc;
    }, []);

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <DetailModal
        orderId={detailId}
        onClose={() => setDetailId(null)}
        onStatusChange={handleStatusChange}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Đơn hàng
          </h1>
          <p className="text-[14px] text-[#767676] mt-0.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {loading ? '...' : `${pagination.totalItems} đơn hàng`}
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#DFDFDF] rounded-[4px] shadow-sm">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-[#DFDFDF] flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-[40px] px-3 border border-[#DFDFDF] rounded-[4px] text-[14px] text-[#111111] bg-white outline-none focus:border-[#003399] cursor-pointer"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Chờ xử lý</option>
            <option value="Processing">Đang xử lý</option>
            <option value="Shipped">Đang giao</option>
            <option value="Delivered">Đã giao</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
          <span className="ml-auto text-[13px] text-[#767676]" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {loading ? '' : `Trang ${page}/${pagination.totalPages}`}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F5] border-b border-[#DFDFDF]">
                {['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái', 'Ngày đặt', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-[12px] font-bold text-[#484848] uppercase tracking-wide whitespace-nowrap"
                    style={{ fontFamily: 'Roboto, sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRow /> : orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-[#767676]">
                    <ShoppingCartIcon className="w-10 h-10 opacity-30" />
                    <p className="text-[14px]" style={{ fontFamily: 'Roboto, sans-serif' }}>Chưa có đơn hàng nào</p>
                  </div>
                </td></tr>
              ) : orders.map(o => (
                <tr key={o._id} className="border-b border-[#DFDFDF] hover:bg-[#F5F5F5] transition-colors group">
                  {/* Mã đơn */}
                  <td className="px-4 py-3">
                    <code className="text-[13px] text-[#003399] bg-[#003399]/10 px-2 py-0.5 rounded-[4px] font-bold"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      #{o._id.slice(-6).toUpperCase()}
                    </code>
                    <div className="text-[11px] text-[#767676] mt-0.5 font-mono">{o.orderItems.length} sản phẩm</div>
                  </td>

                  {/* Khách hàng */}
                  <td className="px-4 py-3">
                    <p className="text-[14px] font-bold text-[#111111]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {o.shippingAddress.fullName}
                    </p>
                    <p className="text-[12px] text-[#767676]">{o.shippingAddress.phone}</p>
                  </td>

                  {/* Tổng tiền */}
                  <td className="px-4 py-3 text-[15px] font-bold text-[#111111] whitespace-nowrap"
                    style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {fmt(o.totalPrice)}
                  </td>

                  {/* Trạng thái */}
                  <td className="px-4 py-3">
                    <select
                      disabled={updating === o._id || o.status === 'Cancelled'}
                      value={o.status}
                      onChange={e => handleStatusChange(o._id, e.target.value as Order['status'])}
                      className={`h-[30px] pl-2 pr-6 border rounded-[4px] text-[12px] font-bold outline-none cursor-pointer appearance-none bg-no-repeat bg-right disabled:opacity-50 ${STATUS_CLS[o.status]}`}
                      style={{
                        fontFamily: 'Roboto, sans-serif',
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

                  {/* Ngày đặt */}
                  <td className="px-4 py-3 text-[13px] text-[#767676] whitespace-nowrap"
                    style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {new Date(o.createdAt).toLocaleString('vi-VN')}
                  </td>

                  {/* Xem chi tiết */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDetailId(o._id)}
                      className="h-[30px] px-3 border border-[#003399] text-[#003399] rounded-[4px] text-[12px] font-bold hover:bg-[#003399] hover:text-white transition-all cursor-pointer whitespace-nowrap opacity-0 group-hover:opacity-100"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#DFDFDF]">
            <p className="text-[13px] text-[#767676]" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Trang {page} / {pagination.totalPages} ({pagination.totalItems} đơn hàng)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-[4px] border border-[#DFDFDF] text-[#484848] hover:border-[#003399] hover:text-[#003399] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              {pageNumbers.map((n, i) =>
                n === '...' ? (
                  <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-[#767676] text-[13px]">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-[4px] text-[13px] font-bold transition-all cursor-pointer ${
                      n === page
                        ? 'bg-[#003399] text-white'
                        : 'border border-[#DFDFDF] text-[#484848] hover:border-[#003399] hover:text-[#003399]'
                    }`}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {n}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-[4px] border border-[#DFDFDF] text-[#484848] hover:border-[#003399] hover:text-[#003399] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
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
