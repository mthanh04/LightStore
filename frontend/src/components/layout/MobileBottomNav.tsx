import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ShoppingBagIcon as ShoppingBagSolid,
  ShoppingCartIcon as ShoppingCartSolid,
  ClipboardDocumentListIcon as ClipboardSolid,
  UserCircleIcon as UserCircleSolid,
} from '@heroicons/react/24/solid';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  iconActive: React.FC<React.SVGProps<SVGSVGElement>>;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Trang chủ',
    icon: HomeIcon,
    iconActive: HomeIconSolid,
  },
  {
    to: '/shop',
    label: 'Cửa hàng',
    icon: ShoppingBagIcon,
    iconActive: ShoppingBagSolid,
  },
  {
    to: '/cart',
    label: 'Giỏ hàng',
    icon: ShoppingCartIcon,
    iconActive: ShoppingCartSolid,
  },
  {
    to: '/orders',
    label: 'Đơn hàng',
    icon: ClipboardDocumentListIcon,
    iconActive: ClipboardSolid,
    requiresAuth: true,
  },
  {
    to: '/profile',
    label: 'Tài khoản',
    icon: UserCircleIcon,
    iconActive: UserCircleSolid,
    requiresAuth: false,
  },
];

const MobileBottomNav: React.FC = () => {
  const { totalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  return (
    /* Only visible on mobile (md and below) */
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-[#E5E5E5] shadow-overlay safe-area-bottom">
      <div className="flex items-stretch h-[60px]">
        {navItems.map((item) => {
          // Profile tab → redirect to login or orders depending on auth
          const handleProfileTap = () => {
            if (item.to === '/profile') {
              navigate(isAuthenticated ? '/orders' : '/login');
              return;
            }
            if (item.requiresAuth && !isAuthenticated) {
              navigate('/login');
              return;
            }
            navigate(item.to);
          };

          if (item.to === '/profile') {
            // Profile is always a button (not NavLink) since it redirects dynamically
            return (
              <button
                key={item.to}
                onClick={handleProfileTap}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#A3A3A3] hover:text-[#D946EF] transition-colors cursor-pointer"
              >
                <item.icon className="w-6 h-6" />
                <span className="text-[10px] font-[600]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {isAuthenticated ? 'Đơn hàng' : 'Đăng nhập'}
                </span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={(e) => {
                if (item.requiresAuth && !isAuthenticated) {
                  e.preventDefault();
                  navigate('/login');
                }
              }}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                  isActive ? 'text-[#D946EF]' : 'text-[#A3A3A3] hover:text-[#525252]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#D946EF] rounded-b-full" />
                  )}

                  {/* Cart badge */}
                  <span className="relative">
                    {isActive ? (
                      <item.iconActive className="w-6 h-6" />
                    ) : (
                      <item.icon className="w-6 h-6" />
                    )}
                    {item.to === '/cart' && totalItems > 0 && (
                      <span className="absolute -top-1 -right-1.5 bg-[#D946EF] text-white text-[9px] font-[800] rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 leading-none">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </span>

                  <span
                    className="text-[10px] font-[600]"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
