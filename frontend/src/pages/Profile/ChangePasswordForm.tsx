import React, { useState } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const { fetchUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await api.put('/api/users/change-password', {
        currentPassword,
        newPassword
      });
      
      // Update token in localStorage
      localStorage.setItem('ls_token', res.data.data.token);
      await fetchUser(); // Refresh user state if needed
      
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Đổi mật khẩu thất bại' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Roboto, sans-serif' }}>
      <h2 className="text-[24px] font-[800] text-[#171717] mb-6">Đổi mật khẩu</h2>
      
      {message.text && (
        <div className={`p-4 rounded-[12px] mb-6 text-[14px] font-[500] ${message.type === 'success' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        <div>
          <label className="block text-[14px] font-[600] text-[#171717] mb-1.5">Mật khẩu hiện tại</label>
          <input 
            type="password" 
            value={currentPassword} 
            onChange={e => setCurrentPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-[12px] border border-[#E5E5E5] focus:border-[#D946EF] focus:ring-1 focus:ring-[#D946EF] outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-[14px] font-[600] text-[#171717] mb-1.5">Mật khẩu mới</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-[12px] border border-[#E5E5E5] focus:border-[#D946EF] focus:ring-1 focus:ring-[#D946EF] outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-[14px] font-[600] text-[#171717] mb-1.5">Xác nhận mật khẩu mới</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-[12px] border border-[#E5E5E5] focus:border-[#D946EF] focus:ring-1 focus:ring-[#D946EF] outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-[#D946EF] text-white rounded-full font-[700] hover:bg-[#C026D3] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
