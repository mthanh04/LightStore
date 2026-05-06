import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  TruckIcon,
  CubeIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { getProductById, getRelatedProducts, type Product } from '../../services/productService';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/common/Toast';
import ProductCard from '../../components/product/ProductCard';

const fmt = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

// ── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="aspect-square bg-[#F0F0F0] rounded-[20px]" />
      <div className="space-y-4">
        <div className="h-4 bg-[#F0F0F0] rounded w-1/4" />
        <div className="h-8 bg-[#F0F0F0] rounded w-3/4" />
        <div className="h-8 bg-[#F0F0F0] rounded w-1/3" />
        <div className="h-20 bg-[#F0F0F0] rounded" />
        <div className="h-12 bg-[#F0F0F0] rounded-full w-full" />
      </div>
    </div>
  </div>
);

// ── Tab button ────────────────────────────────────────────────────────────────
const TabBtn = ({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-5 py-3 text-[14px] font-[700] border-b-2 transition-all cursor-pointer whitespace-nowrap ${
      active
        ? 'border-[#D946EF] text-[#D946EF]'
        : 'border-transparent text-[#525252] hover:text-[#171717]'
    }`}
    style={{ fontFamily: 'Roboto, sans-serif' }}
  >
    {children}
  </button>
);

// ── Main Component ────────────────────────────────────────────────────────────
const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useToast();

  const [product, setProduct]   = useState<Product | null>(null);
  const [related, setRelated]   = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Gallery state
  const [mainIdx, setMainIdx]   = useState(0);

  // Quantity
  const [qty, setQty]           = useState(1);

  // Tab
  const [tab, setTab]           = useState<'desc' | 'specs' | 'usage' | 'info'>('desc');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setMainIdx(0);
    setQty(1);
    setTab('desc');
    Promise.all([
      getProductById(id),
      getRelatedProducts(id),
    ])
      .then(([p, rel]) => {
        setProduct(p);
        setRelated(rel);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;

    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để thêm vào giỏ hàng', 'error');
      navigate('/login');
      return;
    }

    for (let i = 0; i < qty; i++) {
      addItem({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ?? '',
        stock: product.stock,
      });
    }
    showToast(`Đã thêm ${qty} "${product.name}" vào giỏ hàng`, 'success');
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return <div className="min-h-screen bg-[#FAFAFA]"><Skeleton /></div>;

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">🔍</div>
        <h2 className="text-[22px] font-[800] text-[#171717]" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Không tìm thấy sản phẩm
        </h2>
        <button
          onClick={() => navigate('/shop')}
          className="mt-2 h-[44px] px-6 bg-[#D946EF] text-white rounded-full text-[14px] font-[700] hover:bg-[#C026D3] transition-colors cursor-pointer"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Quay lại cửa hàng
        </button>
      </div>
    );
  }

  const images    = product.images.length > 0 ? product.images : [''];
  const isOOS     = product.stock === 0;
  const category  = typeof product.category === 'object' ? product.category : null;
  const hasSpecs  = product.specifications && product.specifications.length > 0;
  const hasUsage  = !!product.usage;
  const hasInfo   = !!product.importantInfo;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-2 text-[13px]"
          style={{ fontFamily: 'Roboto, sans-serif' }}>
          <Link to="/" className="text-[#A3A3A3] hover:text-[#D946EF] transition-colors">Trang chủ</Link>
          <span className="text-[#D4D4D4]">/</span>
          <Link to="/shop" className="text-[#A3A3A3] hover:text-[#D946EF] transition-colors">Cửa hàng</Link>
          {category && (
            <>
              <span className="text-[#D4D4D4]">/</span>
              <Link
                to={`/shop?category=${category._id}`}
                className="text-[#A3A3A3] hover:text-[#D946EF] transition-colors"
              >
                {category.name}
              </Link>
            </>
          )}
          <span className="text-[#D4D4D4]">/</span>
          <span className="text-[#171717] font-[600] line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* ── Main grid: Gallery + Info ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* ── Gallery ───────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative aspect-square rounded-[20px] overflow-hidden bg-white border border-[#E5E5E5] group">
              {images[mainIdx] ? (
                <img
                  src={images[mainIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">💡</div>
              )}
              {isOOS && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white/90 text-[#EF4444] text-[14px] font-[800] px-4 py-2 rounded-full"
                    style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Hết hàng
                  </span>
                </div>
              )}
              {/* Prev / Next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setMainIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-[#171717]" />
                  </button>
                  <button
                    onClick={() => setMainIdx(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-[#171717]" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setMainIdx(i)}
                    className={`shrink-0 w-16 h-16 rounded-[10px] overflow-hidden border-2 transition-all cursor-pointer ${
                      i === mainIdx ? 'border-[#D946EF]' : 'border-[#E5E5E5] hover:border-[#D946EF]/50'
                    }`}
                  >
                    {url ? (
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#F5F5F5] text-xl">💡</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ───────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Category tag */}
            {category && (
              <Link
                to={`/shop?category=${category._id}`}
                className="self-start text-[11px] font-[700] text-[#D946EF] uppercase tracking-widest hover:underline"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {category.name}
              </Link>
            )}

            {/* Name */}
            <h1
              className="text-[28px] md:text-[32px] font-[800] text-[#171717] leading-tight"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              {product.name}
            </h1>

            {/* Stars (decorative) */}
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map(s => (
                <StarIcon key={s} className={`w-4 h-4 ${s <= 4 ? 'text-[#FACC15]' : 'text-[#E5E5E5]'}`} />
              ))}
              <span className="text-[13px] text-[#A3A3A3] ml-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                (4.0)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span
                className="text-[36px] font-[800] text-[#171717]"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {fmt(product.price)}
              </span>
            </div>

            {/* Quick info pills */}
            <div className="flex flex-wrap gap-2">
              {product.brand && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-full text-[13px] font-[600] text-[#525252]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}>
                  🏷️ {product.brand}
                </span>
              )}
              {product.warranty && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] rounded-full text-[13px] font-[600] text-[#16A34A]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <ShieldCheckIcon className="w-4 h-4" />
                  Bảo hành {product.warranty}
                </span>
              )}
              {product.weight && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-full text-[13px] font-[600] text-[#525252]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <CubeIcon className="w-4 h-4" />
                  {product.weight}
                </span>
              )}
              {product.dimensions && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-full text-[13px] font-[600] text-[#525252]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}>
                  📐 {product.dimensions}
                </span>
              )}
            </div>

            {/* Short description */}
            {product.description && (
              <p className="text-[15px] text-[#525252] leading-relaxed border-t border-[#E5E5E5] pt-4"
                style={{ fontFamily: 'Roboto, sans-serif' }}>
                {product.description}
              </p>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-[700] ${
                  isOOS
                    ? 'bg-[#FEE2E2] text-[#EF4444]'
                    : product.stock <= 5
                    ? 'bg-[#FEF9C3] text-[#CA8A04]'
                    : 'bg-[#DCFCE7] text-[#16A34A]'
                }`}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {isOOS
                  ? '● Hết hàng'
                  : product.stock <= 5
                  ? `⚠ Còn ${product.stock} sản phẩm`
                  : `● Còn hàng (${product.stock})`}
              </span>
            </div>

            {/* Quantity selector + Add to cart */}
            {!isOOS && (
              <div className="flex items-center gap-3 pt-2">
                {/* Qty */}
                <div className="flex items-center border border-[#E5E5E5] rounded-full overflow-hidden">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-12 flex items-center justify-center text-[#525252] hover:bg-[#F5F5F5] transition-colors cursor-pointer text-[20px] font-light"
                  >
                    −
                  </button>
                  <span
                    className="w-12 h-12 flex items-center justify-center text-[16px] font-[700] text-[#171717] border-x border-[#E5E5E5]"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="w-10 h-12 flex items-center justify-center text-[#525252] hover:bg-[#F5F5F5] transition-colors cursor-pointer text-[20px] font-light"
                  >
                    +
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-[#D946EF] hover:bg-[#C026D3] text-white rounded-full text-[15px] font-[700] flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  Thêm vào giỏ hàng
                </button>
              </div>
            )}

            {/* Shipping note */}
            <div className="flex items-center gap-2 text-[13px] text-[#525252] pt-1"
              style={{ fontFamily: 'Roboto, sans-serif' }}>
              <TruckIcon className="w-4 h-4 text-[#16A34A] shrink-0" />
              Miễn phí vận chuyển cho đơn từ 500.000₫
            </div>
          </div>
        </div>

        {/* ── Tabs: Mô tả / Thông số / Hướng dẫn / Lưu ý ──────────────── */}
        <div className="mt-12 bg-white rounded-[20px] border border-[#E5E5E5] overflow-hidden">
          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-[#E5E5E5]">
            <TabBtn active={tab === 'desc'} onClick={() => setTab('desc')}>
              📋 Mô tả sản phẩm
            </TabBtn>
            {hasSpecs && (
              <TabBtn active={tab === 'specs'} onClick={() => setTab('specs')}>
                ⚙ Thông số kỹ thuật
              </TabBtn>
            )}
            {hasUsage && (
              <TabBtn active={tab === 'usage'} onClick={() => setTab('usage')}>
                🔧 Hướng dẫn sử dụng
              </TabBtn>
            )}
            {hasInfo && (
              <TabBtn active={tab === 'info'} onClick={() => setTab('info')}>
                ℹ Thông tin quan trọng
              </TabBtn>
            )}
          </div>

          {/* Tab content */}
          <div className="p-6 md:p-8">
            {/* Description */}
            {tab === 'desc' && (
              <div>
                {product.description ? (
                  <p
                    className="text-[15px] text-[#525252] leading-[1.8] whitespace-pre-wrap"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {product.description}
                  </p>
                ) : (
                  <p className="text-[14px] text-[#A3A3A3] italic" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Chưa có mô tả cho sản phẩm này.
                  </p>
                )}
              </div>
            )}

            {/* Specifications */}
            {tab === 'specs' && hasSpecs && (
              <div className="overflow-hidden rounded-[12px] border border-[#E5E5E5]">
                <table className="w-full text-left">
                  <tbody>
                    {product.specifications!.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-[#FAFAFA]' : 'bg-white'}>
                        <td
                          className="px-5 py-3 text-[14px] font-[700] text-[#171717] w-[40%] border-r border-[#E5E5E5]"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          {spec.key}
                        </td>
                        <td
                          className="px-5 py-3 text-[14px] text-[#525252]"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Usage */}
            {tab === 'usage' && hasUsage && (
              <div className="flex gap-4">
                <WrenchScrewdriverIcon className="w-6 h-6 text-[#D946EF] shrink-0 mt-0.5" />
                <p
                  className="text-[15px] text-[#525252] leading-[1.8] whitespace-pre-wrap"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {product.usage}
                </p>
              </div>
            )}

            {/* Important info */}
            {tab === 'info' && hasInfo && (
              <div className="flex gap-4 bg-[#FFF7ED] border border-[#FED7AA] rounded-[12px] p-5">
                <InformationCircleIcon className="w-6 h-6 text-[#F97316] shrink-0 mt-0.5" />
                <p
                  className="text-[15px] text-[#525252] leading-[1.8] whitespace-pre-wrap"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {product.importantInfo}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ────────────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2
              className="text-[22px] font-[800] text-[#171717] mb-6"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
