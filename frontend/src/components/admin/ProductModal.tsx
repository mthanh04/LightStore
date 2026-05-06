import React, { useState, useRef } from 'react';
import { XMarkIcon, PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getCategories, type Category } from '../../services/categoryService';
import { createProduct, updateProduct, type Product, type Specification } from '../../services/productService';

interface ProductModalProps {
  open: boolean;
  initial?: Product | null;
  onClose: () => void;
  onSaved: (p: Product) => void;
}

interface FormState {
  name: string;
  price: string;
  description: string;
  category: string;
  stock: string;
  brand: string;
  warranty: string;
  usage: string;
  importantInfo: string;
  weight: string;
  dimensions: string;
}

const EMPTY: FormState = {
  name: '', price: '', description: '', category: '', stock: '0',
  brand: '', warranty: '', usage: '', importantInfo: '', weight: '', dimensions: '',
};

const inputCls = (err?: boolean) =>
  `w-full h-[44px] px-[14px] border rounded-[4px] text-[15px] text-[#111111] placeholder:text-[#767676] outline-none transition-all ${
    err ? 'border-[#CC0008]' : 'border-[#DFDFDF] focus:border-[#003399]'
  }`;

const textareaCls =
  'w-full px-[14px] py-[10px] border border-[#DFDFDF] rounded-[4px] text-[15px] text-[#111111] placeholder:text-[#767676] outline-none focus:border-[#003399] resize-none transition-all';

const labelCls = 'block text-[13px] font-semibold text-[#111111] mb-1 mt-3';

// ── Section header ────────────────────────────────────────────────────────────
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mt-5 mb-1">
    <div className="h-px flex-1 bg-[#DFDFDF]" />
    <span
      className="text-[11px] font-bold text-[#767676] uppercase tracking-widest whitespace-nowrap"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      {children}
    </span>
    <div className="h-px flex-1 bg-[#DFDFDF]" />
  </div>
);

const ProductModal: React.FC<ProductModalProps> = ({ open, initial, onClose, onSaved }) => {
  const [form, setForm]         = useState<FormState>(EMPTY);
  const [errors, setErrors]     = useState<Partial<FormState>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving]     = useState(false);
  const [apiError, setApiError] = useState('');

  // Specifications state — mảng [{key, value}]
  const [specs, setSpecs] = useState<Specification[]>([]);

  // Image state
  const [newFiles, setNewFiles]         = useState<File[]>([]);
  const [previews, setPreviews]         = useState<string[]>([]);
  const [keptImages, setKeptImages]     = useState<string[]>([]);
  const [dragOver, setDragOver]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load categories + prefill on open
  React.useEffect(() => {
    if (!open) return;
    setApiError('');
    setErrors({});
    setNewFiles([]);
    setPreviews([]);
    setKeptImages(initial?.images ?? []);

    getCategories().then(setCategories).catch(() => {});

    if (initial) {
      setForm({
        name:         initial.name,
        price:        String(initial.price),
        description:  initial.description ?? '',
        category:     typeof initial.category === 'object' ? initial.category._id : (initial.category ?? ''),
        stock:        String(initial.stock),
        brand:        initial.brand ?? '',
        warranty:     initial.warranty ?? '',
        usage:        initial.usage ?? '',
        importantInfo: initial.importantInfo ?? '',
        weight:       initial.weight ?? '',
        dimensions:   initial.dimensions ?? '',
      });
      setSpecs((initial.specifications ?? []).filter(Boolean));
    } else {
      setForm(EMPTY);
      setSpecs([]);
    }
  }, [open, initial]);

  // ── Specification helpers ───────────────────────────────────────────────────
  const addSpec = () => setSpecs(prev => [...prev, { key: '', value: '' }]);

  const updateSpec = (idx: number, field: 'key' | 'value', val: string) => {
    setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  const removeSpec = (idx: number) => {
    setSpecs(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Image helpers ───────────────────────────────────────────────────────────
  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const combined = [...newFiles, ...arr].slice(0, 10);
    setNewFiles(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (idx: number) => {
    const next = newFiles.filter((_, i) => i !== idx);
    setNewFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingImage = (url: string) => {
    setKeptImages(prev => prev.filter(u => u !== url));
  };

  const restoreExistingImage = (url: string) => {
    if (!keptImages.includes(url)) {
      setKeptImages(prev => [...prev, url]);
    }
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim())   e.name     = 'Bắt buộc';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Giá không hợp lệ';
    if (!form.category)      e.category = 'Chọn danh mục';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError('');
    try {
      const fd = new FormData();
      fd.append('name',         form.name.trim());
      fd.append('price',        form.price);
      fd.append('description',  form.description);
      fd.append('category',     form.category);
      fd.append('stock',        form.stock || '0');
      fd.append('brand',        form.brand);
      fd.append('warranty',     form.warranty);
      fd.append('usage',        form.usage);
      fd.append('importantInfo', form.importantInfo);
      fd.append('weight',       form.weight);
      fd.append('dimensions',   form.dimensions);
      // specifications gửi dạng JSON string
      fd.append('specifications', JSON.stringify(specs.filter(s => s.key.trim())));
      // Gửi danh sách ảnh cũ muốn giữ lại (chỉ khi update)
      if (initial) {
        fd.append('existingImages', JSON.stringify(keptImages));
      }
      newFiles.forEach((f) => fd.append('images', f));

      const saved = initial
        ? await updateProduct(initial._id, fd)
        : await createProduct(fd);

      onSaved(saved);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative bg-white rounded-[8px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl"
        style={{ boxShadow: '0 8px 24px rgba(17,17,17,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DFDFDF] shrink-0">
          <h3 className="text-[18px] font-bold text-[#111111]" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {initial ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h3>
          <button onClick={onClose} className="text-[#767676] hover:text-[#111111] cursor-pointer p-1">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {apiError && (
            <div className="mb-4 bg-[#FEE2E2] border border-[#FECACA] rounded-[4px] px-4 py-3 text-[13px] text-[#CC0008]"
              style={{ fontFamily: 'Roboto, sans-serif' }}>
              {apiError}
            </div>
          )}

          {/* ── Thông tin cơ bản ─────────────────────────────────────────── */}
          <SectionTitle>Thông tin cơ bản</SectionTitle>

          <label className={labelCls} htmlFor="p-name">
            Tên sản phẩm <span className="text-[#CC0008]">*</span>
          </label>
          <input id="p-name" className={inputCls(!!errors.name)} placeholder="Đèn chùm pha lê cao cấp"
            value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            style={{ fontFamily: 'Roboto, sans-serif' }} />
          {errors.name && <p className="text-[12px] text-[#CC0008] mt-1">{errors.name}</p>}

          {/* Price + Stock + Category */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls} htmlFor="p-price">
                Giá (VNĐ) <span className="text-[#CC0008]">*</span>
              </label>
              <input id="p-price" type="number" min="0" className={inputCls(!!errors.price)}
                placeholder="850000" value={form.price}
                onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                style={{ fontFamily: 'Roboto, sans-serif' }} />
              {errors.price && <p className="text-[12px] text-[#CC0008] mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className={labelCls} htmlFor="p-stock">Tồn kho</label>
              <input id="p-stock" type="number" min="0" className={inputCls()}
                placeholder="0" value={form.stock}
                onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
                style={{ fontFamily: 'Roboto, sans-serif' }} />
            </div>
            <div>
              <label className={labelCls} htmlFor="p-cat">
                Danh mục <span className="text-[#CC0008]">*</span>
              </label>
              <select id="p-cat"
                className={`${inputCls(!!errors.category)} bg-white cursor-pointer`}
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ fontFamily: 'Roboto, sans-serif' }}>
                <option value="">-- Chọn --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-[12px] text-[#CC0008] mt-1">{errors.category}</p>}
            </div>
          </div>

          <label className={labelCls} htmlFor="p-desc">Mô tả</label>
          <textarea id="p-desc" rows={3} className={textareaCls}
            placeholder="Mô tả chi tiết sản phẩm..."
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            style={{ fontFamily: 'Roboto, sans-serif' }} />

          {/* ── Chi tiết sản phẩm ────────────────────────────────────────── */}
          <SectionTitle>Chi tiết sản phẩm</SectionTitle>

          {/* Brand + Warranty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="p-brand">Thương hiệu / Xuất xứ</label>
              <input id="p-brand" className={inputCls()} placeholder="Philips, Rạng Đông..."
                value={form.brand}
                onChange={(e) => setForm(f => ({ ...f, brand: e.target.value }))}
                style={{ fontFamily: 'Roboto, sans-serif' }} />
            </div>
            <div>
              <label className={labelCls} htmlFor="p-warranty">Bảo hành</label>
              <input id="p-warranty" className={inputCls()} placeholder="12 tháng"
                value={form.warranty}
                onChange={(e) => setForm(f => ({ ...f, warranty: e.target.value }))}
                style={{ fontFamily: 'Roboto, sans-serif' }} />
            </div>
          </div>

          {/* Weight + Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="p-weight">Khối lượng</label>
              <input id="p-weight" className={inputCls()} placeholder="0.5 kg"
                value={form.weight}
                onChange={(e) => setForm(f => ({ ...f, weight: e.target.value }))}
                style={{ fontFamily: 'Roboto, sans-serif' }} />
            </div>
            <div>
              <label className={labelCls} htmlFor="p-dims">Kích thước</label>
              <input id="p-dims" className={inputCls()} placeholder="30x20x15 cm"
                value={form.dimensions}
                onChange={(e) => setForm(f => ({ ...f, dimensions: e.target.value }))}
                style={{ fontFamily: 'Roboto, sans-serif' }} />
            </div>
          </div>

          {/* ── Thông số kỹ thuật ─────────────────────────────────────────── */}
          <SectionTitle>Thông số kỹ thuật</SectionTitle>

          <div className="space-y-2">
            {specs.filter(Boolean).map((s, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  className="flex-1 h-[38px] px-3 border border-[#DFDFDF] rounded-[4px] text-[14px] text-[#111111] placeholder:text-[#A3A3A3] outline-none focus:border-[#003399] transition-all"
                  placeholder="Tên thông số (VD: Công suất)"
                  value={s.key}
                  onChange={(e) => updateSpec(idx, 'key', e.target.value)}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
                <input
                  className="flex-1 h-[38px] px-3 border border-[#DFDFDF] rounded-[4px] text-[14px] text-[#111111] placeholder:text-[#A3A3A3] outline-none focus:border-[#003399] transition-all"
                  placeholder="Giá trị (VD: 18W)"
                  value={s.value}
                  onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="w-8 h-8 flex items-center justify-center rounded-[4px] text-[#CC0008] hover:bg-[#FEE2E2] transition-colors cursor-pointer shrink-0"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSpec}
              className="flex items-center gap-1.5 h-[36px] px-3 border border-dashed border-[#003399] text-[#003399] rounded-[4px] text-[13px] font-semibold hover:bg-[#003399]/5 transition-colors cursor-pointer"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <PlusIcon className="w-4 h-4" />
              Thêm thông số
            </button>
          </div>

          {/* ── Hướng dẫn & Lưu ý ───────────────────────────────────────── */}
          <SectionTitle>Hướng dẫn &amp; Lưu ý</SectionTitle>

          <label className={labelCls} htmlFor="p-usage">Hướng dẫn sử dụng / Lắp đặt</label>
          <textarea id="p-usage" rows={3} className={textareaCls}
            placeholder="Hướng dẫn lắp đặt, sử dụng sản phẩm..."
            value={form.usage}
            onChange={(e) => setForm(f => ({ ...f, usage: e.target.value }))}
            style={{ fontFamily: 'Roboto, sans-serif' }} />

          <label className={labelCls} htmlFor="p-info">Thông tin quan trọng</label>
          <textarea id="p-info" rows={2} className={textareaCls}
            placeholder="Lưu ý khi sử dụng, cảnh báo an toàn..."
            value={form.importantInfo}
            onChange={(e) => setForm(f => ({ ...f, importantInfo: e.target.value }))}
            style={{ fontFamily: 'Roboto, sans-serif' }} />

          {/* ── Hình ảnh ─────────────────────────────────────────────────── */}
          <SectionTitle>Hình ảnh</SectionTitle>

          {/* Existing images (edit mode) */}
          {initial && initial.images.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <p className={labelCls} style={{ margin: 0 }}>Ảnh hiện tại</p>
                <span className="text-[12px] text-[#767676]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {keptImages.length}/{initial.images.length} ảnh được giữ
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {initial.images.map((url) => {
                  const kept = keptImages.includes(url);
                  return (
                    <div
                      key={url}
                      className={`relative w-20 h-20 rounded-[4px] overflow-hidden border group transition-all ${
                        kept ? 'border-[#DFDFDF]' : 'border-[#CC0008] opacity-40'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                      {kept ? (
                        <button
                          type="button"
                          title="Xóa ảnh này"
                          onClick={() => removeExistingImage(url)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-[#CC0008] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          title="Khôi phục ảnh"
                          onClick={() => restoreExistingImage(url)}
                          className="absolute inset-0 flex items-center justify-center text-white text-[11px] font-bold cursor-pointer"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          Khôi phục
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {keptImages.length < initial.images.length && (
                <p className="text-[12px] text-[#E87400] mt-1.5 flex items-center gap-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  ⚠ {initial.images.length - keptImages.length} ảnh sẽ bị xóa khi lưu
                </p>
              )}
            </div>
          )}

          {/* Upload zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-[4px] p-6 text-center cursor-pointer transition-all ${
              dragOver ? 'border-[#003399] bg-[#003399]/5' : 'border-[#DFDFDF] hover:border-[#003399] hover:bg-[#F5F5F5]'
            }`}
          >
            <PhotoIcon className="w-8 h-8 text-[#767676] mx-auto mb-2" />
            <p className="text-[14px] text-[#484848]" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Kéo thả ảnh vào đây hoặc <span className="text-[#003399] font-semibold">chọn file</span>
            </p>
            <p className="text-[12px] text-[#767676] mt-1">PNG, JPG, WebP — tối đa 10 ảnh</p>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)} />
          </div>

          {/* New file previews */}
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-[4px] overflow-hidden border border-[#DFDFDF] group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-[#CC0008] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#DFDFDF] shrink-0">
          <button onClick={onClose} disabled={saving}
            className="h-[44px] px-5 border-2 border-[#003399] text-[#003399] rounded-[4px] text-[15px] font-bold hover:bg-[#003399] hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            style={{ fontFamily: 'Roboto, sans-serif' }}>
            Hủy
          </button>
          <button onClick={handleSave} disabled={saving}
            className="h-[44px] px-6 bg-[#003399] text-white rounded-[4px] text-[15px] font-bold hover:bg-[#002B80] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            style={{ fontFamily: 'Roboto, sans-serif' }}>
            {saving && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {saving ? 'Đang lưu...' : initial ? 'Cập nhật' : 'Thêm sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
