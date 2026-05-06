import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

const ProfileForm: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile({ name, phone, address });
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cập nhật thất bại' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Roboto, sans-serif' }}>
      <h2 className="text-[24px] font-[800] text-[#171717] mb-6">Thông tin cá nhân</h2>
      
      {message.text && (
        <div className={`p-4 rounded-[12px] mb-6 text-[14px] font-[500] ${message.type === 'success' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        <div>
          <label className="block text-[14px] font-[600] text-[#525252] mb-1.5">Email (Không thể thay đổi)</label>
          <input 
            type="email" 
            value={user?.email || ''} 
            disabled 
            className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] border border-[#E5E5E5] text-[#A3A3A3] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[14px] font-[600] text-[#171717] mb-1.5">Họ và tên</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-[12px] border border-[#E5E5E5] focus:border-[#D946EF] focus:ring-1 focus:ring-[#D946EF] outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-[14px] font-[600] text-[#171717] mb-1.5">Số điện thoại giao hàng</label>
          <input 
            type="tel" 
            value={phone} 
            onChange={e => setPhone(e.target.value)}
            placeholder="Ví dụ: 0912345678"
            className="w-full px-4 py-3 rounded-[12px] border border-[#E5E5E5] focus:border-[#D946EF] focus:ring-1 focus:ring-[#D946EF] outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-[14px] font-[600] text-[#171717] mb-1.5">Địa chỉ giao hàng mặc định</label>
          <textarea 
            value={address} 
            onChange={e => setAddress(e.target.value)}
            rows={3}
            placeholder="Ví dụ: 123 Đường ABC, Quận XYZ, TP HCM"
            className="w-full px-4 py-3 rounded-[12px] border border-[#E5E5E5] focus:border-[#D946EF] focus:ring-1 focus:ring-[#D946EF] outline-none transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-[#171717] text-white rounded-full font-[700] hover:bg-[#262626] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
