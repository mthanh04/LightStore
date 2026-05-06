import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  BanknotesIcon, ShoppingCartIcon, UsersIcon, CubeIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { getDashboardStats, type AdminStats } from '../services/adminService';

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmtVND = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'T';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toLocaleString('vi-VN');
};
const fmtFull = (n: number) => n.toLocaleString('vi-VN') + '₫';

// ── Color palette ────────────────────────────────────────────────────────────
const DONUT_COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#14B8A6'];
const CAT_COLORS   = ['#6366F1', '#F59E0B', '#22C55E', '#14B8A6', '#EC4899', '#F97316'];

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[8px] p-3 shadow-lg text-[13px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <p className="font-bold text-[#111111] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {fmtFull(p.value)}
        </p>
      ))}
    </div>
  );
};

// ── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-[#F0F0F0] animate-pulse rounded-[8px] ${className}`} />
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  trend?: number;
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}
const StatCard: React.FC<StatCardProps> = ({ label, value, trend, Icon, iconBg, iconColor }) => {
  const isUp = trend !== undefined && trend >= 0;
  return (
    <div className="bg-white rounded-[12px] p-5 shadow-sm border border-[#F0F0F0] flex items-center gap-4">
      <div className="w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
        <Icon className="w-6 h-6" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[#767676] font-medium truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>{label}</p>
        <p className="text-[22px] font-[800] text-[#111111] leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>{value}</p>
        {trend !== undefined && (
          <p className={`text-[12px] font-bold flex items-center gap-0.5 mt-0.5 ${isUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {isUp ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" /> : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
            {Math.abs(trend)}% so với kỳ trước
          </p>
        )}
      </div>
    </div>
  );
};

// ── Section Card wrapper ──────────────────────────────────────────────────────
const Card = ({ title, link, linkText, children, className = '' }: {
  title: string; link?: string; linkText?: string; children: React.ReactNode; className?: string;
}) => (
  <div className={`bg-white rounded-[12px] shadow-sm border border-[#F0F0F0] overflow-hidden ${className}`}>
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0F0]">
      <h3 className="text-[15px] font-[700] text-[#111111]" style={{ fontFamily: 'Roboto, sans-serif' }}>{title}</h3>
      {link && (
        <Link to={link} className="text-[13px] font-bold text-[#6366F1] hover:underline" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {linkText ?? 'Xem tất cả'}
        </Link>
      )}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ── Custom Donut Label ─────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderDonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Roboto, sans-serif' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh mỗi 60s (real-time feel)
  useEffect(() => {
    const timer = setInterval(load, 60_000);
    return () => clearInterval(timer);
  }, [load]);

  if (loading || !stats) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  // ── Derived chart data ────────────────────────────────────────────────────
  const orderStatusData = [
    { name: 'Đã giao',      value: stats.ordersByStatus.Delivered,  count: `${stats.ordersByStatus.Delivered} đơn` },
    { name: 'Đang giao',    value: stats.ordersByStatus.Shipped,    count: `${stats.ordersByStatus.Shipped} đơn` },
    { name: 'Chờ xác nhận', value: stats.ordersByStatus.Pending,    count: `${stats.ordersByStatus.Pending} đơn` },
    { name: 'Đã hủy',       value: stats.ordersByStatus.Cancelled,  count: `${stats.ordersByStatus.Cancelled} đơn` },
    { name: 'Xử lý',        value: stats.ordersByStatus.Processing, count: `${stats.ordersByStatus.Processing} đơn` },
  ].filter(d => d.value > 0);

  const catTotal = stats.revenueByCategory.reduce((s, c) => s + c.revenue, 0);
  const catData = stats.revenueByCategory.slice(0, 6).map(c => ({
    name: c.name,
    value: c.revenue,
    pct: catTotal > 0 ? ((c.revenue / catTotal) * 100).toFixed(0) : '0',
  }));

  // Thinned daily data for X-axis readability
  const dailyData = stats.dailyRevenue.filter((_, i) => i % 3 === 0 || i === stats.dailyRevenue.length - 1);

  return (
    <div className="p-6 lg:p-8 bg-[#F7F8FA] min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-[800] text-[#111111]" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Tổng quan
          </h1>
          <p className="text-[13px] text-[#767676] mt-0.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Dữ liệu kinh doanh LightStore — cập nhật mỗi 60 giây
          </p>
        </div>
        <button
          onClick={load}
          className="h-[36px] px-4 text-[13px] font-bold text-[#6366F1] border border-[#6366F1] rounded-[8px] hover:bg-[#6366F1]/5 transition-colors cursor-pointer"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          ↻ Làm mới
        </button>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Tổng doanh thu"
          value={fmtFull(stats.totalRevenue)}
          trend={stats.revenueTrend}
          Icon={BanknotesIcon}
          iconBg="#EEF2FF"
          iconColor="#6366F1"
        />
        <StatCard
          label="Đơn hàng"
          value={stats.totalOrders.toLocaleString()}
          trend={stats.ordersTrend}
          Icon={ShoppingCartIcon}
          iconBg="#F0FDF4"
          iconColor="#22C55E"
        />
        <StatCard
          label="Khách hàng"
          value={stats.totalUsers.toLocaleString()}
          trend={stats.usersTrend}
          Icon={UsersIcon}
          iconBg="#FFFBEB"
          iconColor="#F59E0B"
        />
        <StatCard
          label="Sản phẩm bán chạy"
          value={stats.topProducts[0]?.quantity ?? 0}
          Icon={CubeIcon}
          iconBg="#FFF1F2"
          iconColor="#EF4444"
        />
      </div>

      {/* ── Row 2: Doanh thu theo ngày + Tỷ lệ đơn hàng ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Line chart */}
        <Card title="Doanh thu (30 ngày gần nhất)" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.dailyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fontFamily: 'Roboto, sans-serif', fill: '#767676' }}
                interval={4}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={fmtVND}
                tick={{ fontSize: 11, fontFamily: 'Roboto, sans-serif', fill: '#767676' }}
                tickLine={false}
                axisLine={false}
                width={52}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#6366F1"
                strokeWidth={2.5}
                fill="url(#revGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#6366F1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Donut — order status */}
        <Card title="Tỷ lệ đơn theo trạng thái">
          {orderStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={72}
                    dataKey="value"
                    labelLine={false}
                    label={renderDonutLabel}
                  >
                    {orderStatusData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} đơn`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-1">
                {orderStatusData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="text-[#484848]">{d.name}</span>
                    </div>
                    <span className="font-bold text-[#111111]">{d.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-[#767676] text-[13px] py-8">Chưa có đơn hàng</p>
          )}
        </Card>
      </div>

      {/* ── Row 3: Doanh thu theo danh mục + Top SP + Khách mới ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue by category donut */}
        <Card title="Doanh thu theo danh mục">
          {catData.length > 0 ? (
            <>
              <div className="flex justify-center">
                <PieChart width={200} height={180}>
                  <Pie
                    data={catData}
                    cx={100}
                    cy={90}
                    innerRadius={50}
                    outerRadius={82}
                    dataKey="value"
                    labelLine={false}
                    label={renderDonutLabel}
                  >
                    {catData.map((_, i) => (
                      <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [fmtFull(v), 'Doanh thu']} />
                </PieChart>
              </div>
              <div className="space-y-1.5 mt-1">
                {catData.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                      <span className="text-[#484848] truncate max-w-[110px]">{c.name}</span>
                    </div>
                    <span className="font-bold text-[#111111] shrink-0">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-[#767676] text-[13px] py-8">Chưa có dữ liệu</p>
          )}
        </Card>

        {/* Top products */}
        <Card title="Top sản phẩm bán chạy" link="/admin/products" linkText="Xem tất cả">
          {stats.topProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="text-[13px] font-[800] text-[#6366F1] w-4 shrink-0">{i + 1}</span>
                  <div className="w-10 h-10 rounded-[6px] border border-[#F0F0F0] overflow-hidden bg-[#F5F5F5] shrink-0">
                    {p.image
                      ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      : <CubeIcon className="w-5 h-5 text-[#DFDFDF] m-2.5" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#111111] truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>{p.name}</p>
                    <p className="text-[11px] text-[#767676]">{p.quantity} đã bán</p>
                  </div>
                  <span className="text-[13px] font-[800] text-[#6366F1] shrink-0" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {fmtVND(p.revenue)}₫
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#767676] text-[13px] py-8">Chưa có đơn hàng</p>
          )}
        </Card>

        {/* Recent users */}
        <Card title="Khách hàng mới" link="/admin/users" linkText="Xem tất cả">
          {stats.recentUsers.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsers.map((u) => {
                const initials = u.name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
                const hue = u._id.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % 360;
                return (
                  <div key={u._id} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                      style={{ backgroundColor: `hsl(${hue},60%,55%)`, fontFamily: 'Roboto, sans-serif' }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-[#111111] truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>{u.name}</p>
                      <p className="text-[11px] text-[#767676] truncate">{u.email}</p>
                    </div>
                    <span className="text-[11px] text-[#767676] shrink-0">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-[#767676] text-[13px] py-8">Chưa có khách hàng</p>
          )}
        </Card>
      </div>

      {/* ── Row 4: Doanh thu theo tháng (bar) ─────────────────────────────── */}
      <Card title="Doanh thu theo tháng">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={stats.monthlyRevenue}
            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            barGap={3}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fontFamily: 'Roboto, sans-serif', fill: '#767676' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={fmtVND}
              tick={{ fontSize: 11, fontFamily: 'Roboto, sans-serif', fill: '#767676' }}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <Tooltip content={<RevenueTooltip />} />
            <Legend
              formatter={(value) => (
                <span style={{ fontSize: 12, fontFamily: 'Roboto, sans-serif', color: '#484848' }}>
                  {value === 'current' ? 'Năm nay' : 'Năm trước'}
                </span>
              )}
            />
            <Bar dataKey="current" name="current" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Bar dataKey="prev"    name="prev"    fill="#E0E7FF" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Row 5: Sản phẩm sắp hết hàng ─────────────────────────────────── */}
      {stats.lowStockProducts.length > 0 && (
        <Card title="Sản phẩm sắp hết hàng" link="/admin/products" className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F0F0F0]">
                  {['Sản phẩm', 'Giá', 'Tồn kho'].map(h => (
                    <th key={h} className="pb-3 text-[11px] font-bold text-[#767676] uppercase tracking-wide pr-4"
                      style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.map(p => (
                  <tr key={p._id} className="border-b border-[#F0F0F0] last:border-0">
                    <td className="py-3 text-[13px] font-bold text-[#111111] pr-4" style={{ fontFamily: 'Roboto, sans-serif' }}>{p.name}</td>
                    <td className="py-3 text-[13px] text-[#484848] pr-4" style={{ fontFamily: 'Roboto, sans-serif' }}>{p.price.toLocaleString('vi-VN')}₫</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-[4px] ${
                        p.stock === 0 ? 'bg-[#FEE2E2] text-[#EF4444]' : 'bg-[#FFFBEB] text-[#F59E0B]'
                      }`}>
                        {p.stock === 0 ? 'Hết hàng' : `Còn ${p.stock}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
