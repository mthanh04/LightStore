import React, { useEffect, useState, useCallback } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon,
  MagnifyingGlassIcon, CubeIcon, ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { getProducts, deleteProduct, type Product } from '../../services/productService';
import { getCategories, type Category } from '../../services/categoryService';
import ProductModal from '../../components/admin/ProductModal';

const LIMIT = 8;

const fmt = (n: number) => n.toLocaleString('vi-VN') + '₫';

const Toast = ({ msg, type }: { msg: string; type: 'success' | 'error' }) => (
  <div className={`fixed top-5 right-5 z-[100] px-4 py-3 rounded-[4px] text-white text-[14px] shadow-lg ${type === 'success' ? 'bg-[#0A8A00]' : 'bg-[#CC0008]'}`}
    style={{ fontFamily: 'Noto Sans, sans-serif' }}>
    {type === 'success' ? '✓' : '✕'} {msg}
  </div>
);

const SkeletonRow = () => (
  <>{[1,2,3,4,5,6].map(i => (
    <tr key={i} className="border-b border-[#DFDFDF]">
      {[80,200,120,90,70,80].map((w,j) => (
        <td key={j} className="px-4 py-3">
          <div className="h-4 bg-[#DFDFDF] rounded animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  ))}</>
);

const StockBadge = ({ stock }: { stock: number }) => {
  if (stock === 0)  return <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-[2px] bg-[#FEE2E2] text-[#CC0008]">Hết hàng</span>;
  if (stock <= 5)   return <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-[2px] bg-[#FEF9C3] text-[#E87400]">{stock} còn lại</span>;
  return <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-[2px] bg-[#DCFCE7] text-[#0A8A00]">{stock} còn lại</span>;
};

// ── Confirm Delete ────────────────────────────────────────────────────────────
const ConfirmDelete = ({ target, onClose, onConfirm, deleting }: {
  target: Product | null; onClose: () => void; onConfirm: () => void; deleting: boolean;
}) => {
  if (!target) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-[8px] w-full max-w-sm p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
            <TrashIcon className="w-5 h-5 text-[#CC0008]" />
          </div>
          <h3 className="text-[17px] font-bold text-[#111111]" style={{ fontFamily: 'Noto Sans, sans-serif' }}>Xóa sản phẩm</h3>
        </div>
        <p className="text-[14px] text-[#484848] mb-5" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          Bạn có chắc muốn xóa <span className="font-bold text-[#111111]">"{target.name}"</span>? Hành động không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={deleting}
            className="h-[44px] px-5 border-2 border-[#DFDFDF] text-[#484848] rounded-[4px] text-[14px] font-bold hover:border-[#003399] hover:text-[#003399] transition-all cursor-pointer disabled:opacity-50"
            style={{ fontFamily: 'Noto Sans, sans-serif' }}>Hủy</button>
          <button onClick={onConfirm} disabled={deleting}
            className="h-[44px] px-6 bg-[#CC0008] text-white rounded-[4px] text-[14px] font-bold hover:bg-[#a80006] flex items-center gap-2 cursor-pointer disabled:opacity-50"
            style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            {deleting && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, limit: LIMIT });
  const [loading, setLoading]       = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filters
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [sort, setSort]           = useState('newest');
  const [page, setPage]           = useState(1);

  // Modals
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting]       = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load categories once
  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({ page, limit: LIMIT, search: search || undefined, category: catFilter || undefined, sort });
      setProducts(res.data);
      setPagination(res.pagination);
    } catch {
      showToast('Không thể tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, catFilter, sort]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 on filter change
  const applySearch = (v: string)   => { setSearch(v);    setPage(1); };
  const applyCat    = (v: string)   => { setCatFilter(v); setPage(1); };
  const applySort   = (v: string)   => { setSort(v);      setPage(1); };

  const handleAdd  = () => { setEditing(null); setModalOpen(true); };
  const handleEdit = (p: Product) => { setEditing(p); setModalOpen(true); };

  const handleSaved = (saved: Product) => {
    if (editing) {
      setProducts(prev => prev.map(p => p._id === saved._id ? saved : p));
      showToast('Cập nhật sản phẩm thành công!', 'success');
    } else {
      load(); // reload để giữ pagination đúng
      showToast('Thêm sản phẩm thành công!', 'success');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget._id);
      setProducts(prev => prev.filter(p => p._id !== deleteTarget._id));
      setPagination(prev => ({ ...prev, totalItems: prev.totalItems - 1 }));
      showToast('Đã xóa sản phẩm!', 'success');
      setDeleteTarget(null);
    } catch {
      showToast('Xóa sản phẩm thất bại', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <ProductModal open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
      <ConfirmDelete target={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} deleting={deleting} />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] leading-tight" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            Sản phẩm
          </h1>
          <p className="text-[14px] text-[#767676] mt-0.5" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            {loading ? '—' : `${pagination.totalItems} sản phẩm`}
          </p>
        </div>
        <button onClick={handleAdd} id="btn-add-product"
          className="flex items-center gap-2 h-[44px] px-5 bg-[#003399] text-white rounded-[4px] text-[15px] font-bold hover:bg-[#002B80] transition-all cursor-pointer shrink-0"
          style={{ fontFamily: 'Noto Sans, sans-serif' }}>
          <PlusIcon className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-[#DFDFDF] rounded-[4px]" style={{ boxShadow: '0 1px 3px rgba(17,17,17,0.06)' }}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-[#DFDFDF]">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767676]" />
            <input type="text" placeholder="Tìm sản phẩm..." value={search}
              onChange={(e) => applySearch(e.target.value)}
              className="h-[40px] pl-9 pr-3 w-56 border border-[#DFDFDF] rounded-[4px] text-[14px] text-[#111111] placeholder:text-[#767676] outline-none focus:border-[#003399] transition-colors"
              style={{ fontFamily: 'Noto Sans, sans-serif' }} />
          </div>
          {/* Category filter */}
          <select value={catFilter} onChange={(e) => applyCat(e.target.value)}
            className="h-[40px] px-3 border border-[#DFDFDF] rounded-[4px] text-[14px] text-[#111111] bg-white outline-none focus:border-[#003399] cursor-pointer transition-colors"
            style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          {/* Sort */}
          <select value={sort} onChange={(e) => applySort(e.target.value)}
            className="h-[40px] px-3 border border-[#DFDFDF] rounded-[4px] text-[14px] text-[#111111] bg-white outline-none focus:border-[#003399] cursor-pointer transition-colors"
            style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="name_asc">Tên A→Z</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F5] border-b border-[#DFDFDF]">
                {['Sản phẩm', 'Danh mục', 'Giá', 'Tồn kho', 'Ngày thêm', 'Thao tác'].map(h => (
                  <th key={h} className="px-4 py-3 text-[12px] font-bold text-[#484848] uppercase tracking-wide whitespace-nowrap"
                    style={{ fontFamily: 'Noto Sans, sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRow /> : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-[#767676]">
                    <CubeIcon className="w-10 h-10 opacity-30" />
                    <p className="text-[14px]" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                      {search || catFilter ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
                    </p>
                    {!search && !catFilter && (
                      <button onClick={handleAdd} className="text-[#003399] font-semibold text-[13px] hover:underline cursor-pointer"
                        style={{ fontFamily: 'Noto Sans, sans-serif' }}>+ Thêm sản phẩm đầu tiên</button>
                    )}
                  </div>
                </td></tr>
              ) : products.map((p) => {
                const cat = typeof p.category === 'object' ? p.category : null;
                const img = p.images?.[0];
                return (
                  <tr key={p._id} className="border-b border-[#DFDFDF] hover:bg-[#F5F5F5] transition-colors">
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[4px] border border-[#DFDFDF] overflow-hidden shrink-0 bg-[#F5F5F5]">
                          {img ? <img src={img} alt={p.name} className="w-full h-full object-cover" /> : <CubeIcon className="w-6 h-6 text-[#DFDFDF] m-3" />}
                        </div>
                        <span className="text-[15px] font-bold text-[#111111] line-clamp-2 max-w-[200px]"
                          style={{ fontFamily: 'Noto Sans, sans-serif' }}>{p.name}</span>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-4 py-3">
                      {cat ? (
                        <span className="px-2 py-0.5 text-[12px] font-bold bg-[#003399] text-white rounded-[2px]"
                          style={{ fontFamily: 'Noto Sans, sans-serif' }}>{cat.name}</span>
                      ) : <span className="text-[#767676]">—</span>}
                    </td>
                    {/* Price */}
                    <td className="px-4 py-3 text-[15px] font-bold text-[#111111] whitespace-nowrap"
                      style={{ fontFamily: 'Noto Sans, sans-serif' }}>{fmt(p.price)}</td>
                    {/* Stock */}
                    <td className="px-4 py-3"><StockBadge stock={p.stock} /></td>
                    {/* Date */}
                    <td className="px-4 py-3 text-[13px] text-[#767676] whitespace-nowrap"
                      style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(p)} title="Sửa"
                          className="w-8 h-8 flex items-center justify-center rounded-[4px] text-[#003399] hover:bg-[#003399]/10 transition-colors cursor-pointer">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(p)} title="Xóa"
                          className="w-8 h-8 flex items-center justify-center rounded-[4px] text-[#CC0008] hover:bg-[#CC0008]/10 transition-colors cursor-pointer">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#DFDFDF]">
            <p className="text-[13px] text-[#767676]" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              Trang {pagination.currentPage} / {pagination.totalPages} ({pagination.totalItems} sản phẩm)
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-[4px] border border-[#DFDFDF] text-[#484848] hover:border-[#003399] hover:text-[#003399] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all">
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === pagination.totalPages || Math.abs(n - page) <= 1)
                .reduce<(number | '...')[]>((acc, n, i, arr) => {
                  if (i > 0 && n - (arr[i-1] as number) > 1) acc.push('...');
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) => n === '...' ? (
                  <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-[#767676] text-[13px]">…</span>
                ) : (
                  <button key={n} onClick={() => setPage(n as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-[4px] text-[13px] font-bold transition-all cursor-pointer ${
                      n === page ? 'bg-[#003399] text-white' : 'border border-[#DFDFDF] text-[#484848] hover:border-[#003399] hover:text-[#003399]'
                    }`}
                    style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                    {n}
                  </button>
                ))}
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-[4px] border border-[#DFDFDF] text-[#484848] hover:border-[#003399] hover:text-[#003399] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
