import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  SparklesIcon,
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  PhoneArrowUpRightIcon,
  GlobeEuropeAfricaIcon,
} from '@heroicons/react/24/outline';
import ProductCard from '../components/product/ProductCard';
import { getProducts, type Product } from '../services/productService';
import { getCategories, type Category } from '../services/categoryService';
import bannerImg from '../assets/images/banner_3.png';
import Reveal from '../animations/Reveal';
import {
  staggerContainer,
  staggerItem,
  staggerItemZoom,
  TRANSITION_BASE,
} from '../animations/variants';

/* ─── Why Choose Us data ──────────────────────── */
const FEATURES = [
  {
    icon: TruckIcon,
    title: 'GIAO HÀNG NHANH',
    desc: 'Giao hàng trong 24h nội thành, toàn quốc trong 3 ngày.',
    color: '#1D4ED8',
  },
  {
    icon: GlobeEuropeAfricaIcon,
    title: 'THÂN THIỆN',
    desc: 'Tất cả sản phẩm đạt chứng chỉ tiết kiệm năng lượng Energy Star.',
    color: '#4ADE80',
  },
  {
    icon: ShieldCheckIcon,
    title: 'BẢO HÀNH 2 NĂM',
    desc: 'Cam kết bảo hành toàn bộ sản phẩm, đổi trả miễn phí trong 30 ngày.',
    color: '#FBBF24',
  },
  {
    icon: CheckBadgeIcon,
    title: 'SẢN PHẨM CHÍNH HÃNG',
    desc: '100% sản phẩm chính hãng, nguồn gốc rõ ràng.',
    color: '#A78BFA',
  },
  {
    icon: PhoneArrowUpRightIcon,
    title: 'HỖ TRỢ TẬN TÂM',
    desc: 'Đội ngũ tư vấn chuyên nghiệp, hỗ trợ 24/7 mọi lúc mọi nơi.',
    color: '#22D3EE',
  },
];

/* ─── Category icon map ───────────────────────── */
const CAT_ICONS: Record<string, string> = {
  default: '💡',
  'den-tran': '🔆',
  'den-ban': '🕯️',
  'den-trang-tri': '✨',
  'den-led': '💫',
  'den-tuong': '🌟',
};

// Hero text animation variants (runs immediately, not scroll-triggered)
const heroTitle = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...TRANSITION_BASE, duration: 0.7, delay: 0.2 },
  },
};
const heroBadge = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...TRANSITION_BASE, delay: 0 },
  },
};
const heroSub = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...TRANSITION_BASE, delay: 0.4 },
  },
};
const heroCta = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...TRANSITION_BASE, delay: 0.6 },
  },
};

const Home: React.FC = () => {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    getProducts({ page: 1, limit: 8 })
      .then((res) => setTrendingProducts(res.data))
      .catch(() => {})
      .finally(() => setLoadingProducts(false));

    getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoadingCats(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24 md:py-36 px-6 flex items-center justify-center min-h-[500px]"
        style={{
          backgroundImage: `url(${bannerImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#171717]/40 via-[#171717]/20 to-[#171717]/60" />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-50"
          style={{
            background:
              'radial-gradient(circle at 25% 50%, rgba(217,70,239,0.4) 0%, transparent 40%), radial-gradient(circle at 75% 50%, rgba(34,211,238,0.4) 0%, transparent 40%)',
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
          {/* Badge — immediate animate on mount */}
          <motion.div
            variants={heroBadge}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-6"
          >
            <SparklesIcon className="w-4 h-4 text-[#F5D0FE]" />
            <span
              className="text-[11px] font-[700] text-[#F5D0FE] uppercase tracking-widest"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Bộ sưu tập mới 2026
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={heroTitle}
            initial="hidden"
            animate="visible"
            className="text-[40px] sm:text-[52px] md:text-[64px] font-[800] text-white leading-tight mb-6 drop-shadow-lg"
            style={{ fontFamily: 'Roboto, sans-serif', letterSpacing: '-0.01em' }}
          >
            Thắp sáng không gian{' '}
            <span
              className="bg-clip-text text-transparent drop-shadow-none"
              style={{ backgroundImage: 'linear-gradient(135deg, #F0ABFC, #67E8F9)' }}
            >
              của bạn
            </span>
          </motion.h1>

          <motion.p
            variants={heroSub}
            initial="hidden"
            animate="visible"
            className="text-[17px] text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed font-[500] drop-shadow-md"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Khám phá bộ sưu tập đèn chiếu sáng cao cấp — thiết kế hiện đại, tiết kiệm năng lượng,
            phù hợp cho mọi không gian sống và làm việc.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={heroCta}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 h-[54px] px-9 bg-[#D946EF] hover:bg-[#C026D3] text-white text-[16px] font-[700] rounded-full shadow-medium hover:shadow-large transition-all btn-pulse"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Mua sắm ngay
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 h-[54px] px-9 border-2 border-white/50 text-white text-[16px] font-[700] rounded-full hover:bg-white/10 hover:border-white transition-all backdrop-blur-sm"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Xem bộ sưu tập
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Featured Categories ───────────────────────────────────────────── */}
      <section className="py-14 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="flex items-end justify-between mb-8">
            <Reveal variant="fadeInLeft">
              <div>
                <p
                  className="text-[12px] font-[700] text-[#D946EF] uppercase tracking-widest mb-1"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Danh mục
                </p>
                <h2
                  className="text-[28px] md:text-[34px] font-[800] text-[#171717]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Khám phá danh mục
                </h2>
              </div>
            </Reveal>
            <Reveal variant="fadeInRight">
              <Link
                to="/shop"
                className="hidden md:flex items-center gap-1 text-[14px] font-[600] text-[#D946EF] hover:underline"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Xem tất cả <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>

          {/* ── Shared category card ── */}
          {(() => {
            const CatCard = ({ cat }: { cat: Category }) => (
              <Link
                to={`/shop?category=${cat._id}`}
                className="group flex flex-col items-center gap-2 cursor-pointer"
              >
                <div className="w-full aspect-square rounded-[16px] bg-white border border-[#E5E5E5] overflow-hidden flex items-center justify-center text-4xl group-hover:border-[#D946EF] group-hover:shadow-product-hover group-hover:-translate-y-1 transition-all duration-200">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    CAT_ICONS[cat.slug] ?? CAT_ICONS.default
                  )}
                </div>
                <span
                  className="text-[13px] font-[700] text-[#525252] group-hover:text-[#D946EF] transition-colors text-center"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {cat.name}
                </span>
              </Link>
            );

            if (loadingCats) {
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-[#F0F0F0] rounded-[16px] mb-2" />
                      <div className="h-3 bg-[#F0F0F0] rounded w-2/3 mx-auto" />
                    </div>
                  ))}
                </div>
              );
            }

            if (categories.length === 0) return null;

            /* ── ≤ 5: static stagger grid ── */
            if (categories.length <= 5) {
              return (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-80px', amount: 0.15 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                >
                  {categories.map((cat) => (
                    <motion.div key={cat._id} variants={staggerItemZoom}>
                      <CatCard cat={cat} />
                    </motion.div>
                  ))}
                </motion.div>
              );
            }

            /* ── > 5: infinite marquee slider ── */
            // Duplicate the list to create seamless loop (50% translateX trick)
            const doubled = [...categories, ...categories];
            // Width per card: ~160px + 16px gap, speed scales with count
            const speed = Math.max(18, categories.length * 3);

            return (
              <div className="relative overflow-hidden marquee-track">
                {/* Fade edge overlays */}
                <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none" />

                <div
                  className="flex gap-4 animate-marquee"
                  style={{ animationDuration: `${speed}s`, width: 'max-content' }}
                >
                  {doubled.map((cat, idx) => (
                    <div
                      key={`${cat._id}-${idx}`}
                      className="w-[140px] sm:w-[160px] shrink-0"
                    >
                      <CatCard cat={cat} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* ── Trending Products ─────────────────────────────────────────────── */}
      <section className="py-14 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-end justify-between mb-8">
            <Reveal variant="fadeInLeft">
              <div>
                <p
                  className="text-[12px] font-[700] text-[#D946EF] uppercase tracking-widest mb-1"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Nổi bật
                </p>
                <h2
                  className="text-[28px] md:text-[34px] font-[800] text-[#171717]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Sản phẩm bán chạy
                </h2>
              </div>
            </Reveal>
            <Reveal variant="fadeInRight">
              <Link
                to="/shop"
                className="hidden md:flex items-center gap-1 text-[14px] font-[600] text-[#D946EF] hover:underline"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Xem tất cả <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[#F5F5F5] rounded-[16px] animate-pulse">
                  <div className="aspect-square rounded-t-[16px] bg-[#E5E5E5]" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-[#E5E5E5] rounded w-2/3" />
                    <div className="h-4 bg-[#E5E5E5] rounded w-full" />
                    <div className="h-5 bg-[#E5E5E5] rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Product cards — each Reveal has index-based delay
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px', amount: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {trendingProducts.map((p) => (
                <motion.div key={p._id} variants={staggerItem}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Mobile see all */}
          <Reveal variant="fadeInUp" delay={0.1} className="md:hidden mt-6 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 h-[44px] px-8 border-2 border-[#D946EF] text-[#D946EF] rounded-full text-[14px] font-[700] hover:bg-[#FDF4FF] transition-all"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Xem tất cả sản phẩm <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-6 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <Reveal variant="fadeInUp" className="text-center mb-16">
            <p
              className="text-[13px] font-[800] text-[#0ea5e9] uppercase tracking-wider mb-2"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Cam kết của chúng tôi
            </p>
            <h2
              className="text-[32px] md:text-[40px] font-[800] text-[#1e293b]"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              VÌ SAO CHỌN LIGHTSTORE?
            </h2>
          </Reveal>

          {/* Feature cards — stagger via motion.div wrapper */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px', amount: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 gap-y-12 mt-12"
          >
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="bg-white rounded-[20px] p-6 pt-14 relative text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 flex flex-col items-center"
                >
                  {/* Floating Icon */}
                  <div
                    className="absolute -top-10 left-1/2 -translate-x-1/2 w-[84px] h-[84px] rounded-full border-[8px] border-[#FAFAFA] flex items-center justify-center text-white shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${f.color} 0%, ${f.color}dd 100%)`,
                    }}
                  >
                    <Icon className="w-8 h-8" strokeWidth={2} />
                  </div>

                  <h3
                    className="text-[15px] font-[800] text-[#1e293b] mb-3 uppercase"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-[13px] text-[#64748b] leading-relaxed flex-1"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {f.desc}
                  </p>

                  {/* Bottom Dash */}
                  <div
                    className="w-8 h-1 rounded-full mt-5"
                    style={{ backgroundColor: f.color }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="py-10 px-4 md:px-6 mb-10">
        <div className="max-w-7xl mx-auto">
          <Reveal variant="zoomIn">
            <div
              className="rounded-[24px] overflow-hidden relative shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #001e4d 0%, #004e92 100%)',
              }}
            >
              {/* Ambient glow effects */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -left-[10%] top-[20%] w-[40%] h-[60%] bg-[#38bdf8] opacity-20 blur-[100px] rounded-full" />
                <div className="absolute -right-[10%] bottom-[10%] w-[30%] h-[50%] bg-[#818cf8] opacity-20 blur-[80px] rounded-full" />
                <div className="absolute right-0 top-0 w-[50%] h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-center py-12 md:py-16 px-8 md:px-20 gap-8 md:gap-16">

                {/* Shield Icon */}
                <Reveal variant="fadeInLeft" className="relative shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#38bdf8] blur-[40px] opacity-40 rounded-full" />
                  <div className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] relative flex items-center justify-center">
                    <ShieldCheckIcon
                      className="w-full h-full text-white opacity-90 drop-shadow-[0_0_30px_rgba(56,189,248,0.8)]"
                      strokeWidth={1}
                    />
                  </div>
                </Reveal>

                {/* Text & CTA */}
                <Reveal variant="fadeInRight" className="text-center md:text-left flex-1 max-w-xl">
                  <h2
                    className="text-[28px] md:text-[38px] font-[800] text-white leading-tight mb-4"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    BẮT ĐẦU <br />
                    <span className="text-[#fbbf24]">TRANG TRÍ KHÔNG GIAN</span> <br />
                    CỦA BẠN
                  </h2>
                  <p
                    className="text-[#e2e8f0] text-[15px] mb-8 leading-relaxed font-[500]"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Hàng trăm mẫu đèn cao cấp đang chờ bạn khám phá.<br />
                    Miễn phí vận chuyển đơn hàng đầu tiên!
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link
                      to="/shop"
                      className="inline-flex items-center justify-center gap-2 h-[50px] px-8 bg-[#fbbf24] text-[#1e293b] text-[15px] font-[800] rounded-full hover:bg-[#f59e0b] transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)]"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      <ShoppingBagIcon className="w-5 h-5" strokeWidth={2.5} />
                      MUA SẮM NGAY
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
