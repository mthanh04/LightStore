import React, { useEffect, useState, useCallback } from 'react';
import { UsersIcon, ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getUsers, updateUserRole, type User } from '../../services/adminService';

const SkeletonRow = () => (
  <>{[1,2,3,4,5].map(i => (
    <tr key={i} className="border-b border-[#DFDFDF]">
      {[250, 150, 100, 120].map((w,j) => (
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

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
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
      const res = await getUsers(page, 10, search, roleFilter);
      setUsers(res.data);
      setPagination(res.pagination);
    } catch {
      showToast('Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (id: string, newRole: 'admin' | 'user') => {
    setUpdating(id);
    try {
      const updated = await updateUserRole(id, newRole);
      setUsers(prev => prev.map(u => u._id === id ? updated : u));
      showToast('Cập nhật quyền thành công', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Cập nhật quyền thất bại';
      showToast(msg, 'error');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#111111] leading-tight" style={{ fontFamily: 'Noto Sans, sans-serif' }}>Người dùng</h1>
        <p className="text-[14px] text-[#767676] mt-0.5" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          Quản lý {loading ? '...' : pagination.totalItems} tài khoản
        </p>
      </div>

      <div className="bg-white border border-[#DFDFDF] rounded-[4px] shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-[#DFDFDF]">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767676]" />
            <input type="text" placeholder="Tìm tên/email..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-[40px] pl-9 pr-3 w-64 border border-[#DFDFDF] rounded-[4px] text-[14px] outline-none focus:border-[#003399]"
              style={{ fontFamily: 'Noto Sans, sans-serif' }} />
          </div>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="h-[40px] px-3 border border-[#DFDFDF] rounded-[4px] text-[14px] text-[#111111] bg-white outline-none focus:border-[#003399] cursor-pointer"
            style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            <option value="">Tất cả quyền</option>
            <option value="user">Khách hàng (User)</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F5] border-b border-[#DFDFDF]">
                {['Tài khoản', 'Email', 'Quyền (Role)', 'Ngày tham gia'].map(h => (
                  <th key={h} className="px-4 py-3 text-[12px] font-bold text-[#484848] uppercase tracking-wide whitespace-nowrap"
                    style={{ fontFamily: 'Noto Sans, sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRow /> : users.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-[#767676]">
                    <UsersIcon className="w-10 h-10 opacity-30" />
                    <p className="text-[14px]" style={{ fontFamily: 'Noto Sans, sans-serif' }}>Không tìm thấy người dùng nào</p>
                  </div>
                </td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="border-b border-[#DFDFDF] hover:bg-[#F5F5F5] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#003399] text-white flex items-center justify-center font-bold text-[14px]">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[14px] font-bold text-[#111111]" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[14px] text-[#484848]" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      disabled={updating === u._id}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value as 'admin'|'user')}
                      className={`h-[30px] pl-2 pr-6 border rounded-[4px] text-[12px] font-bold outline-none cursor-pointer appearance-none bg-no-repeat bg-right disabled:opacity-50
                        ${u.role === 'admin' ? 'bg-[#FFDA1A] border-[#FFDA1A]/50 text-[#111111]' : 'bg-[#F5F5F5] border-[#DFDFDF] text-[#484848]'}
                      `}
                      style={{
                        fontFamily: 'Noto Sans, sans-serif',
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundSize: '14px',
                        backgroundPosition: 'calc(100% - 6px) center',
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#767676]" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
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

export default Users;
