import React from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import LogoBulb from '../ui/LogoBulb';

// SVG for Headphones
const HeadphonesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 14.25a3 3 0 0 1-6 0m6 0a3 3 0 0 0-6 0m6 0v-2.25m-6 2.25v-2.25m10.5 2.25c0 1.657-.745 3.16-1.95 4.25A11.944 11.944 0 0 1 12 21c-2.825 0-5.417-.978-7.55-2.5C3.245 17.41 2.5 15.907 2.5 14.25v-2.25C2.5 8.134 6.753 3.75 12 3.75s9.5 4.384 9.5 8.25v2.25Z" />
  </svg>
);

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const features = [
    { icon: TruckIcon, title: 'GIAO HÀNG TOÀN QUỐC', desc: 'Giao nhanh trong 24h' },
    { icon: ShieldCheckIcon, title: 'BẢO HÀNH CHÍNH HÃNG', desc: 'Bảo hành lên đến 2 năm' },
    { icon: ArrowPathIcon, title: 'ĐỔI TRẢ DỄ DÀNG', desc: 'Đổi trả trong 30 ngày' },
    { icon: HeadphonesIcon, title: 'HỖ TRỢ 24/7', desc: 'Hotline: 0912 345 678' },
    { icon: LockClosedIcon, title: 'THANH TOÁN AN TOÀN', desc: 'Bảo mật thông tin tuyệt đối' },
  ];

  const sections = [
    {
      title: 'SẢN PHẨM',
      links: [
        { label: 'Đèn trần', to: '/shop?category=den-tran' },
        { label: 'Đèn bàn', to: '/shop?category=den-ban' },
        { label: 'Đèn trang trí', to: '/shop?category=den-trang-tri' },
        { label: 'Đèn LED', to: '/shop?category=den-led' },
        { label: 'Đèn tường', to: '/shop' },
        { label: 'Đèn sân vườn', to: '/shop' },
        { label: 'Đèn năng lượng mặt trời', to: '/shop' },
        { label: 'Phụ kiện đèn', to: '/shop' },
      ],
    },
    {
      title: 'HỖ TRỢ KHÁCH HÀNG',
      links: [
        { label: 'Chính sách đổi trả', to: '/' },
        { label: 'Chính sách bảo hành', to: '/' },
        { label: 'Hướng dẫn mua hàng', to: '/' },
        { label: 'Hướng dẫn thanh toán', to: '/' },
        { label: 'Giao hàng & vận chuyển', to: '/' },
        { label: 'Câu hỏi thường gặp (FAQ)', to: '/' },
        { label: 'Liên hệ hỗ trợ', to: '/' },
      ],
    },
    {
      title: 'VỀ LIGHTSTORE',
      links: [
        { label: 'Giới thiệu về chúng tôi', to: '/' },
        { label: 'Tin tức & khuyến mãi', to: '/' },
        { label: 'Dự án tiêu biểu', to: '/' },
        { label: 'Tuyển dụng', to: '/' },
        { label: 'Liên hệ', to: '/' },
      ],
    },
    {
      title: 'TÀI KHOẢN',
      links: [
        { label: 'Đăng nhập', to: '/login' },
        { label: 'Đăng ký', to: '/register' },
        { label: 'Đơn hàng của tôi', to: '/orders' },
        { label: 'Sản phẩm yêu thích', to: '/shop' },
        { label: 'Giỏ hàng', to: '/cart' },
      ],
    },
  ];

  return (
    <footer className="bg-[#111827] text-white pb-20 md:pb-0">
      {/* ── Top Feature Banner ── */}
      <div className="bg-[#1e293b] border-y border-[#334155]">
        <div className="max-w-7xl mx-auto px-6 py-6 hidden lg:flex items-center justify-between divide-x divide-[#334155]">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex-1 flex items-center justify-center gap-4 px-4">
                <Icon className="w-8 h-8 text-[#facc15]" />
                <div>
                  <h4 className="text-[13px] font-[700] text-white uppercase tracking-wide">
                    {f.title}
                  </h4>
                  <p className="text-[12px] text-[#94a3b8] mt-0.5">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* ── Main Links ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          {/* Brand & Contact */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <LogoBulb size={36} interval={2500} duration={700} />
              <span className="text-[24px] font-[800] text-white tracking-tight">
                LightStore
              </span>
            </div>
            <p className="text-[13px] text-[#94a3b8] leading-relaxed mb-6">
              LightStore cung cấp các sản phẩm đèn chiếu sáng chất lượng cao, thiết kế hiện đại, tiết kiệm năng lượng cho mọi không gian sống và làm việc của bạn.
            </p>
            <div className="space-y-3 mb-8">
              {[
                { icon: PhoneIcon, text: '0912 345 678' },
                { icon: EnvelopeIcon, text: 'support@lightstore.vn' },
                { icon: MapPinIcon, text: '123 Nguyễn Huệ, Q.1, TP. Hồ Chí Minh' },
                { icon: ClockIcon, text: 'Thứ 2 - Chủ nhật: 8:00 - 21:00' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#facc15] shrink-0" />
                  <span className="text-[13px] text-[#cbd5e1]">{text}</span>
                </div>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-[13px] font-[700] text-white uppercase tracking-widest mb-2">
                ĐĂNG KÝ NHẬN TIN
              </h4>
              <p className="text-[12px] text-[#94a3b8] mb-3">
                Nhận thông tin khuyến mãi và sản phẩm mới nhất!
              </p>
              <div className="flex bg-[#1e293b] rounded-[8px] p-1 border border-[#334155] focus-within:border-[#facc15] transition-colors">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="flex-1 bg-transparent px-3 text-[13px] text-white placeholder-[#64748b] focus:outline-none"
                />
                <button className="w-[42px] h-[34px] bg-[#facc15] text-[#1e293b] rounded-[6px] flex items-center justify-center hover:bg-[#eab308] transition-colors cursor-pointer">
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="text-[13px] font-[700] text-white uppercase tracking-widest mb-6 relative pb-3">
                {s.title}
                <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-[#facc15]" />
              </h4>
              <ul className="space-y-3.5">
                {s.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[13.5px] text-[#cbd5e1] hover:text-[#facc15] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Divider & Bottom ── */}
        <div className="border-t border-[#334155] pt-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <p className="text-[13px] text-[#94a3b8]">
            © {year} LightStore. Tất cả quyền được bảo lưu.
          </p>

          {/* Payments */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {['VISA', 'Mastercard', 'MoMo', 'ZaloPay', 'COD'].map((method) => (
              <div
                key={method}
                className="h-8 px-3 rounded-[4px] border border-[#334155] flex items-center justify-center text-[11px] font-[700] text-white bg-[#1e293b]"
              >
                {method}
              </div>
            ))}
          </div>

          {/* Socials */}
          <div className="flex items-center gap-4">
            <span className="text-[12px] font-[700] text-white uppercase mr-2 hidden sm:block">
              KẾT NỐI VỚI CHÚNG TÔI
            </span>
            {['f', 'ig', 'zalo'].map((sn) => (
              <a
                key={sn}
                href="#"
                className="w-8 h-8 rounded-full border border-[#cbd5e1] flex items-center justify-center text-[12px] text-[#cbd5e1] hover:border-[#facc15] hover:text-[#facc15] transition-all"
              >
                {sn}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
