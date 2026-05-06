import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserCircleIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import ProfileForm from './ProfileForm';
import ChangePasswordForm from './ChangePasswordForm';
import MyOrders from '../MyOrders';

const Profile: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'password'>('info');

  // Sync tab with URL search params ?tab=orders
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'orders' || tab === 'password') {
      setActiveTab(tab);
    } else {
      setActiveTab('info');
    }
  }, [location.search]);

  const handleTabChange = (tab: 'info' | 'orders' | 'password') => {
    setActiveTab(tab);
    navigate(`?tab=${tab}`, { replace: true });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-[16px] border border-[#E5E5E5] p-2 overflow-hidden shadow-sm">
            <button
              onClick={() => handleTabChange('info')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-left transition-colors ${
                activeTab === 'info' 
                  ? 'bg-[#FDF4FF] text-[#D946EF] font-[700]' 
                  : 'text-[#525252] hover:bg-[#F5F5F5] font-[500]'
              }`}
            >
              <UserCircleIcon className="w-6 h-6" />
              Thông tin cá nhân
            </button>
            <button
              onClick={() => handleTabChange('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-left transition-colors ${
                activeTab === 'orders' 
                  ? 'bg-[#FDF4FF] text-[#D946EF] font-[700]' 
                  : 'text-[#525252] hover:bg-[#F5F5F5] font-[500]'
              }`}
            >
              <ShoppingBagIcon className="w-6 h-6" />
              Lịch sử mua hàng
            </button>
            <button
              onClick={() => handleTabChange('password')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-left transition-colors mt-1 ${
                activeTab === 'password' 
                  ? 'bg-[#FDF4FF] text-[#D946EF] font-[700]' 
                  : 'text-[#525252] hover:bg-[#F5F5F5] font-[500]'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Đổi mật khẩu
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-[16px] border border-[#E5E5E5] p-6 shadow-sm min-h-[400px]">
            {activeTab === 'info' && <ProfileForm />}
            {activeTab === 'password' && <ChangePasswordForm />}
            {activeTab === 'orders' && (
              <div className="-mt-8">
                <MyOrders />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
