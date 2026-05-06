import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { getDashboardStats, type AdminStats } from '../services/adminService';
import { BanknotesIcon, ShoppingCartIcon, UsersIcon, CubeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const fmt = (n: number) => n.toLocaleString('vi-VN');

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Doanh thu (VNĐ)', value: stats ? fmt(stats.totalRevenue) : '0', icon: BanknotesIcon, color: '#003399', bg: '#E0E7FF' },
    { label: 'Đơn hàng', value: stats?.totalOrders || 0, icon: ShoppingCartIcon, color: '#0A8A00', bg: '#DCFCE7' },
    { label: 'Khách hàng', value: stats?.totalUsers || 0, icon: UsersIcon, color: '#E87400', bg: '#FEF9C3' },
    { label: 'Sản phẩm', value: stats?.totalProducts || 0, icon: CubeIcon, color: '#CC0008', bg: '#FEE2E2' },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1
          className="text-[28px] font-bold text-[#111111] leading-tight"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Xin chào, {user?.name} 👋
        </h1>
        <p className="text-[14px] text-[#767676] mt-0.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Đây là tổng quan hoạt động của LightStore.
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-[#DFDFDF] rounded-[4px]" />)}
          </div>
          <div className="h-64 bg-[#DFDFDF] rounded-[4px]" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {cards.map((c, i) => (
              <div key={i} className="bg-white p-5 border border-[#DFDFDF] rounded-[4px] shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-[4px] flex items-center justify-center shrink-0" style={{ backgroundColor: c.bg }}>
                    <c.icon className="w-5 h-5" style={{ color: c.color }} />
                  </div>
                  <span className="text-[14px] font-bold text-[#484848]" style={{ fontFamily: 'Roboto, sans-serif' }}>{c.label}</span>
                </div>
                <div className="text-[24px] font-bold text-[#111111] mt-auto" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {c.value}
                </div>
              </div>
            ))}
          </div>

          {/* Low Stock Products */}
          {stats && stats.lowStockProducts.length > 0 && (
            <div className="bg-white border border-[#DFDFDF] rounded-[4px] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#DFDFDF] flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-[#111111]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Sản phẩm sắp hết hàng
                </h3>
                <Link to="/admin/products" className="text-[13px] font-bold text-[#003399] hover:underline" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Xem tất cả
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#F5F5F5] border-b border-[#DFDFDF]">
                      <th className="px-4 py-3 text-[12px] font-bold text-[#484848] uppercase">Sản phẩm</th>
                      <th className="px-4 py-3 text-[12px] font-bold text-[#484848] uppercase">Giá</th>
                      <th className="px-4 py-3 text-[12px] font-bold text-[#484848] uppercase">Tồn kho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowStockProducts.map(p => (
                      <tr key={p._id} className="border-b border-[#DFDFDF] hover:bg-[#F5F5F5] transition-colors">
                        <td className="px-4 py-3 text-[14px] font-bold text-[#111111]" style={{ fontFamily: 'Roboto, sans-serif' }}>{p.name}</td>
                        <td className="px-4 py-3 text-[14px] text-[#484848]" style={{ fontFamily: 'Roboto, sans-serif' }}>{fmt(p.price)}₫</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-[2px] ${p.stock === 0 ? 'bg-[#FEE2E2] text-[#CC0008]' : 'bg-[#FEF9C3] text-[#E87400]'}`}>
                            {p.stock === 0 ? 'Hết hàng' : `Còn ${p.stock}`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
