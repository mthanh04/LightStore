import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FunnelIcon, MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { getProducts, type Product } from '../../services/productService';
import { getCategories, type Category } from '../../services/categoryService';
import ProductCard from '../../components/product/ProductCard';
import Pagination from '../../components/common/Pagination';

const SORT_OPTIONS = [
  { value: '', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: Thấp → Cao' },
  { value: 'price_desc', label: 'Giá: Cao → Thấp' },
];

const SkeletonCard = () => (
  <div className="bg-white rounded-[16px] border border-[#E5E5E5] overflow-hidden animate-pulse">
    <div className="aspect-square bg-[#F0F0F0]" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-[#F0F0F0] rounded w-1/3" />
      <div className="h-4 bg-[#F0F0F0] rounded w-3/4" />
      <div className="h-4 bg-[#F0F0F0] rounded w-1/2" />
      <div className="flex justify-between items-center pt-1">
        <div className="h-5 bg-[#F0F0F0] rounded w-1/3" />
        <div className="w-9 h-9 rounded-full bg-[#F0F0F0]" />
      </div>
    </div>
  </div>
);

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 12,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Derive filter state from URL
  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';

  const [searchInput, setSearchInput] = useState(search);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({ page, limit: 12, search, category, sort });
      setProducts(res.data);
      setPagination(res.pagination);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Sync search input with URL on initial load
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasActiveFilters = search || category || sort;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Page header */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <h1
            className="text-[32px] font-[800] text-[#171717] mb-1"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Cửa hàng
          </h1>
          <p
            className="text-[15px] text-[#525252]"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {loading ? 'Đang tải...' : `${pagination.totalItems} sản phẩm`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex gap-6">
        {/* ── Sidebar ─────────────────────────────────── */}
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-[80] md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed md:static top-0 left-0 h-full md:h-auto w-[280px] md:w-[240px] lg:w-[260px]
            bg-white md:bg-transparent z-[85] md:z-auto
            transition-transform duration-300 md:translate-x-0
            ${sidebarOpen ? 'translate-x-0 shadow-overlay' : '-translate-x-full'}
            md:shrink-0
          `}
        >
          <div className="p-5 md:p-0 space-y-6 overflow-y-auto h-full md:h-auto md:sticky md:top-24">
            {/* Mobile header */}
            <div className="flex items-center justify-between md:hidden">
              <h3
                className="text-[16px] font-[700] text-[#171717]"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Bộ lọc
              </h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5 text-[#525252]" />
              </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-[16px] border border-[#E5E5E5] p-4">
              <h4
                className="text-[12px] font-[700] text-[#171717] uppercase tracking-widest mb-3"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Tìm kiếm
              </h4>
              <form onSubmit={handleSearch} className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tên sản phẩm..."
                  className="w-full h-[38px] pl-9 pr-3 border border-[#D4D4D4] rounded-full text-[14px] placeholder-[#A3A3A3] focus:outline-none focus:border-[#D946EF] focus:ring-2 focus:ring-[#D946EF]/15 transition-all"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </form>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-[16px] border border-[#E5E5E5] p-4">
              <h4
                className="text-[12px] font-[700] text-[#171717] uppercase tracking-widest mb-3"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Danh mục
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-[8px] text-[14px] font-[600] transition-colors cursor-pointer ${
                    !category
                      ? 'bg-[#FDF4FF] text-[#D946EF]'
                      : 'text-[#525252] hover:bg-[#F5F5F5]'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => updateParam('category', cat._id)}
                    className={`w-full text-left px-3 py-2 rounded-[8px] text-[14px] font-[600] transition-colors cursor-pointer ${
                      category === cat._id
                        ? 'bg-[#FDF4FF] text-[#D946EF]'
                        : 'text-[#525252] hover:bg-[#F5F5F5]'
                    }`}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="bg-white rounded-[16px] border border-[#E5E5E5] p-4">
              <h4
                className="text-[12px] font-[700] text-[#171717] uppercase tracking-widest mb-3"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Sắp xếp
              </h4>
              <div className="space-y-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateParam('sort', opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-[8px] text-[14px] font-[600] transition-colors cursor-pointer ${
                      sort === opt.value
                        ? 'bg-[#FDF4FF] text-[#D946EF]'
                        : 'text-[#525252] hover:bg-[#F5F5F5]'
                    }`}
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 h-[38px] border-2 border-[#EF4444] text-[#EF4444] rounded-full text-[13px] font-[700] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                <XMarkIcon className="w-4 h-4" />
                Xóa bộ lọc
              </button>
            )}
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex items-center gap-2 h-[38px] px-4 border border-[#D4D4D4] rounded-full text-[14px] font-[600] text-[#525252] hover:border-[#D946EF] hover:text-[#D946EF] transition-colors cursor-pointer"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              Bộ lọc
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-[#D946EF] text-white text-[10px] font-[800] flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <FunnelIcon className="w-4 h-4 text-[#A3A3A3] hidden md:block" />
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="h-[38px] pl-3 pr-8 border border-[#D4D4D4] rounded-full text-[14px] text-[#525252] bg-white focus:outline-none focus:border-[#D946EF] cursor-pointer appearance-none"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {search && (
                <span className="inline-flex items-center gap-1 h-[28px] px-3 bg-[#FDF4FF] border border-[#F5D0FE] rounded-full text-[12px] font-[600] text-[#D946EF]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}>
                  🔍 {search}
                  <button onClick={() => updateParam('search', '')} className="cursor-pointer ml-0.5">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-1 h-[28px] px-3 bg-[#FDF4FF] border border-[#F5D0FE] rounded-full text-[12px] font-[600] text-[#D946EF]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {categories.find(c => c._id === category)?.name || 'Danh mục'}
                  <button onClick={() => updateParam('category', '')} className="cursor-pointer ml-0.5">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3
                className="text-[20px] font-[700] text-[#171717] mb-2"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Không tìm thấy sản phẩm
              </h3>
              <p
                className="text-[14px] text-[#525252] mb-6"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
              </p>
              <button
                onClick={clearFilters}
                className="h-[42px] px-6 bg-[#D946EF] text-white rounded-full text-[14px] font-[700] hover:bg-[#C026D3] transition-colors cursor-pointer"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(p) => updateParam('page', String(p))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
