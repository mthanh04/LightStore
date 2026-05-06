import React, { useEffect, useState, useCallback } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from '../../services/categoryService';

// ── Helpers ────────────────────────────────────────────────────
const Toast = ({ msg, type }: { msg: string; type: 'success' | 'error' }) => (
  <div
    className={`fixed top-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 rounded-[4px] text-white text-[14px] shadow-lg transition-all duration-300 ${
      type === 'success' ? 'bg-[#0A8A00]' : 'bg-[#CC0008]'
    }`}
    style={{ fontFamily: 'Roboto, sans-serif' }}
  >
    {type === 'success' ? '✓' : '✕'} {msg}
  </div>
);

const LoadingRow = () => (
  <>
    {[1, 2, 3, 4].map((i) => (
      <tr key={i} className="border-b border-[#DFDFDF]">
        {[1, 2, 3, 4].map((j) => (
          <td key={j} className="px-4 py-3">
            <div className="h-4 bg-[#DFDFDF] rounded animate-pulse" style={{ width: `${60 + j * 10}%` }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// ── Modal Form ──────────────────────────────────────────────────
interface CategoryModalProps {
  open: boolean;
  initial?: Category | null;
  onClose: () => void;
  onSaved: (cat: Category) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ open, initial, onClose, onSaved }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(initial?.name ?? '');
    setError('');
  }, [initial, open]);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) { setError('Tên danh mục không được để trống'); return; }
    setSaving(true);
    try {
      const saved = initial
        ? await updateCategory(initial._id, name.trim())
        : await createCategory(name.trim());
      onSaved(saved);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-[8px] w-full max-w-md shadow-xl"
        style={{ boxShadow: '0 8px 24px rgba(17,17,17,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DFDFDF]">
          <h3
            className="text-[18px] font-bold text-[#111111]"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {initial ? 'Sửa danh mục' : 'Thêm danh mục'}
          </h3>
          <button
            onClick={onClose}
            className="text-[#767676] hover:text-[#111111] transition-colors text-[20px] leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <label
            htmlFor="cat-name"
            className="block text-[13px] font-semibold text-[#111111] mb-1.5"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Tên danh mục <span className="text-[#CC0008]">*</span>
          </label>
          <input
            id="cat-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Ví dụ: Đèn chùm"
            className={`w-full h-[44px] px-[14px] border rounded-[4px] text-[16px] text-[#111111] placeholder:text-[#767676] outline-none transition-all ${
              error
                ? 'border-[#CC0008] focus:border-[#CC0008]'
                : 'border-[#DFDFDF] focus:border-[#003399]'
            }`}
            style={{ fontFamily: 'Roboto, sans-serif' }}
            autoFocus
          />
          {error && (
            <p className="mt-1.5 text-[12px] text-[#CC0008]" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#DFDFDF]">
          <button
            onClick={onClose}
            disabled={saving}
            className="h-[44px] px-5 border-2 border-[#003399] text-[#003399] rounded-[4px] text-[15px] font-bold hover:bg-[#003399] hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-[44px] px-6 bg-[#003399] text-white rounded-[4px] text-[15px] font-bold hover:bg-[#002B80] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {saving && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saving ? 'Đang lưu...' : initial ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Confirm Delete Dialog ───────────────────────────────────────
interface ConfirmDeleteProps {
  open: boolean;
  target: Category | null;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({ open, target, onClose, onConfirm, deleting }) => {
  if (!open || !target) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-[8px] w-full max-w-sm shadow-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
            <TrashIcon className="w-5 h-5 text-[#CC0008]" />
          </div>
          <h3 className="text-[17px] font-bold text-[#111111]" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Xóa danh mục
          </h3>
        </div>
        <p className="text-[14px] text-[#484848] mb-5" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Bạn có chắc muốn xóa danh mục{' '}
          <span className="font-bold text-[#111111]">"{target.name}"</span>?{' '}
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="h-[44px] px-5 border-2 border-[#DFDFDF] text-[#484848] rounded-[4px] text-[14px] font-bold hover:border-[#003399] hover:text-[#003399] transition-all disabled:opacity-50 cursor-pointer"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="h-[44px] px-6 bg-[#CC0008] text-white rounded-[4px] text-[14px] font-bold hover:bg-[#a80006] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {deleting && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────
const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');

  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<Category | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      showToast('Không thể tải danh mục', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => { setEditing(null); setModalOpen(true); };
  const handleEdit = (cat: Category) => { setEditing(cat); setModalOpen(true); };
  const handleDeleteClick = (cat: Category) => { setDeleteTarget(cat); setDeleteOpen(true); };

  const handleSaved = (saved: Category) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    showToast(editing ? 'Cập nhật thành công!' : 'Thêm danh mục thành công!', 'success');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget._id);
      setCategories((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      showToast('Đã xóa danh mục!', 'success');
      setDeleteOpen(false);
    } catch {
      showToast('Xóa danh mục thất bại', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Modals */}
      <CategoryModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
      <ConfirmDelete
        open={deleteOpen}
        target={deleteTarget}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-[28px] font-bold text-[#111111] leading-tight"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Danh mục sản phẩm
          </h1>
          <p className="text-[14px] text-[#767676] mt-0.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Quản lý các danh mục đèn trong hệ thống
          </p>
        </div>
        <button
          onClick={handleAdd}
          id="btn-add-category"
          className="flex items-center gap-2 h-[44px] px-5 bg-[#003399] text-white rounded-[4px] text-[15px] font-bold hover:bg-[#002B80] transition-all cursor-pointer"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          <PlusIcon className="w-4 h-4" />
          Thêm danh mục
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-[#DFDFDF] rounded-[4px]" style={{ boxShadow: '0 1px 3px rgba(17,17,17,0.06)' }}>
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#DFDFDF]">
          <div className="relative flex-1 max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767676]" />
            <input
              type="text"
              placeholder="Tìm danh mục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[40px] pl-9 pr-3 border border-[#DFDFDF] rounded-[4px] text-[14px] text-[#111111] placeholder:text-[#767676] outline-none focus:border-[#003399] transition-colors"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            />
          </div>
          <span className="text-[13px] text-[#767676] ml-auto" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {loading ? '—' : `${filtered.length} danh mục`}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F5] border-b border-[#DFDFDF]">
                {['#', 'Tên danh mục', 'Slug', 'Ngày tạo', 'Thao tác'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[12px] font-bold text-[#484848] uppercase tracking-wide"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingRow />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-[#767676]">
                      <TagIcon className="w-10 h-10 opacity-30" />
                      <p className="text-[14px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {search ? 'Không tìm thấy danh mục phù hợp' : 'Chưa có danh mục nào'}
                      </p>
                      {!search && (
                        <button
                          onClick={handleAdd}
                          className="text-[#003399] font-semibold text-[13px] hover:underline cursor-pointer"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          + Thêm danh mục đầu tiên
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((cat, idx) => (
                  <tr
                    key={cat._id}
                    className="border-b border-[#DFDFDF] hover:bg-[#F5F5F5] transition-colors"
                  >
                    <td className="px-4 py-3 text-[13px] text-[#767676] w-10">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[4px] bg-[#003399]/10 flex items-center justify-center shrink-0">
                          <TagIcon className="w-4 h-4 text-[#003399]" />
                        </div>
                        <span
                          className="text-[15px] font-bold text-[#111111]"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code
                        className="text-[13px] text-[#484848] bg-[#F5F5F5] px-2 py-0.5 rounded-[4px]"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {cat.slug}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#767676]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {cat.createdAt
                        ? new Date(cat.createdAt).toLocaleDateString('vi-VN')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          title="Sửa"
                          className="w-8 h-8 flex items-center justify-center rounded-[4px] text-[#003399] hover:bg-[#003399]/10 transition-colors cursor-pointer"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cat)}
                          title="Xóa"
                          className="w-8 h-8 flex items-center justify-center rounded-[4px] text-[#CC0008] hover:bg-[#CC0008]/10 transition-colors cursor-pointer"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;
