import React, { useState, useEffect, useRef } from 'react';
import {
  XMarkIcon,
  MinusIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  LightBulbIcon,
  CubeIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { getProducts, type Product } from '../../services/productService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  products?: { name: string; price: string; image: string }[];
  time: string;
}

const BASE_SYSTEM_INSTRUCTION = `Bạn là LightStore AI, trợ lý tư vấn bán hàng của cửa hàng đèn LightStore.
Nhiệm vụ: Tư vấn đèn, báo giá, các danh mục.
CHỈ giới thiệu và đề xuất các sản phẩm có trong danh sách cửa hàng dưới đây.
Nếu người dùng yêu cầu gợi ý sản phẩm cụ thể, HÃY trả lời kèm theo một danh sách sản phẩm ở định dạng JSON nằm giữa 2 thẻ [PRODUCTS] và [/PRODUCTS].
ĐẢM BẢO sử dụng ĐÚNG thuộc tính name, price, image từ dữ liệu cung cấp.
Ví dụ:
Dựa trên nhu cầu của bạn, tôi gợi ý một số mẫu sau:
[PRODUCTS]
[
  {"name": "Đèn thả LED hiện đại", "price": "1250000", "image": "..."}
]
[/PRODUCTS]
Tuyệt đối không dùng markdown in đậm (**) hay in nghiêng (*) trong phần giới thiệu sản phẩm. Giọng điệu thân thiện, tự nhiên, ngắn gọn. Định dạng xuống dòng rõ ràng.`;

const RobotAvatar = () => (
  <div className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
    <SparklesIcon className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 text-yellow-400" />
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
      <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a3 3 0 013 3v2h1a1 1 0 011 1v2a1 1 0 01-1 1h-1v2a3 3 0 01-3 3H9a3 3 0 01-3-3v-2H5a1 1 0 01-1-1v-2a1 1 0 011-1h1V10a3 3 0 013-3h1V5.73A2 2 0 1112 2zm0 2a1 1 0 000 2 1 1 0 000-2zm4 7H8a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-8a1 1 0 00-1-1zm-5.5 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm5 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
    </svg>
  </div>
);

const formatTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0, hasMoved: false });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement | HTMLButtonElement>) => {
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      hasMoved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement | HTMLButtonElement>) => {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.hasMoved = true;
    setPosition({ x: dragRef.current.startPosX + dx, y: dragRef.current.startPosY + dy });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement | HTMLButtonElement>) => {
    dragRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleToggleOpen = () => {
    if (!dragRef.current.hasMoved) setIsOpen(true);
  };

  useEffect(() => {
    getProducts({ limit: 50 }).then(res => {
      setStoreProducts(res.data);
    }).catch(console.error);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const parseBotResponse = (text: string) => {
    const productRegex = /\[PRODUCTS\]([\s\S]*?)\[\/PRODUCTS\]/;
    const match = text.match(productRegex);
    let cleanText = text;
    let products = undefined;

    if (match) {
      cleanText = text.replace(productRegex, '').trim();
      try {
        products = JSON.parse(match[1]);
      } catch (e) {
        console.error('Failed to parse products JSON from AI', e);
      }
    }
    return { cleanText, products };
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text, time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'bot' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      const productsContext = JSON.stringify(
        storeProducts.map(p => ({ name: p.name, price: p.price, image: p.images[0] }))
      );
      const finalInstruction = `${BASE_SYSTEM_INSTRUCTION}\nDanh sách sản phẩm hiện có:\n${productsContext}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: finalInstruction }] },
          contents: [...history, { role: 'user', parts: [{ text }] }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        const botText = data.candidates[0].content.parts[0].text;
        const { cleanText, products } = parseBotResponse(botText);
        
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          sender: 'bot',
          text: cleanText,
          products,
          time: formatTime()
        }]);
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.',
        time: formatTime()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
  };

  const quickActions = [
    { icon: LightBulbIcon, text: 'Tư vấn chọn đèn phù hợp', color: 'text-yellow-500' },
    { icon: CubeIcon, text: 'Tìm hiểu sản phẩm', color: 'text-purple-500' },
    { icon: TruckIcon, text: 'Kiểm tra đơn hàng', color: 'text-blue-500' },
    { icon: ShieldCheckIcon, text: 'Chính sách & bảo hành', color: 'text-orange-500' },
  ];

  return (
    <div 
      className={`fixed z-[9999] font-roboto ${isOpen ? 'inset-0 sm:inset-auto sm:bottom-6 sm:right-6 pointer-events-none sm:pointer-events-auto' : 'bottom-6 right-6'}`} 
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none'
      }}
    >
      {!isOpen && (
        <div className="flex items-center gap-4">
          <div className="bg-[#0f172a] text-white px-4 py-3 rounded-2xl shadow-xl relative animate-bounce-slow pointer-events-none">
            <p className="text-[14px] font-[600] leading-tight">Bạn cần tư vấn<br/>về đèn chiếu sáng?</p>
            <p className="text-[12px] text-gray-400 mt-1">Nhấn để chat với AI</p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-[#0f172a] rotate-45" />
          </div>
          
          <button
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={handleToggleOpen}
            className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform relative cursor-move select-none touch-none"
          >
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[12px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              1
            </div>
            <RobotAvatar />
          </button>
        </div>
      )}

      {isOpen && (
        <div className="w-full h-full sm:w-[380px] sm:h-[700px] max-h-screen sm:max-h-[85vh] bg-[#f8fafc] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 pointer-events-auto">
          <div 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="bg-[#0f172a] px-5 py-4 flex items-center justify-between shrink-0 sm:rounded-t-3xl pt-8 sm:pt-4 cursor-move select-none touch-none"
          >
            <div className="flex items-center gap-3 pointer-events-none">
              <RobotAvatar />
              <div>
                <h3 className="text-white font-[700] text-[16px]">LightStore AI</h3>
                <p className="text-gray-400 text-[12px] flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Online
                </p>
              </div>
            </div>
            <div 
              className="flex items-center gap-2 text-gray-400"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button onClick={resetChat} className="p-1 hover:text-white transition-colors" title="Làm mới">
                <ArrowPathIcon className="w-5 h-5" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:text-white transition-colors" title="Thu nhỏ">
                <MinusIcon className="w-5 h-5" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:text-white transition-colors" title="Đóng">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white rounded-t-3xl -mt-4 relative z-10">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                  <h2 className="text-[20px] font-[800] text-[#0f172a] mb-2 flex items-center gap-2">
                    Xin chào! 👋
                  </h2>
                  <p className="text-[14px] text-gray-600 mb-1">Tôi là trợ lý ảo của LightStore.</p>
                  <p className="text-[14px] text-gray-600 mb-4">Tôi có thể giúp bạn:</p>
                  
                  <div className="space-y-2">
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(action.text)}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <action.icon className={`w-5 h-5 ${action.color}`} />
                          <span className="text-[14px] font-[600] text-gray-700 group-hover:text-blue-700">{action.text}</span>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="flex gap-2 max-w-[90%]">
                    {msg.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center shrink-0 mt-1">
                         <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a3 3 0 013 3v2h1a1 1 0 011 1v2a1 1 0 01-1 1h-1v2a3 3 0 01-3 3H9a3 3 0 01-3-3v-2H5a1 1 0 01-1-1v-2a1 1 0 011-1h1V10a3 3 0 013-3h1V5.73A2 2 0 1112 2zm0 2a1 1 0 000 2 1 1 0 000-2zm4 7H8a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-8a1 1 0 00-1-1zm-5.5 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm5 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" /></svg>
                      </div>
                    )}
                    <div>
                      {msg.text && (
                        <div className={`p-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                          msg.sender === 'user' 
                            ? 'bg-[#1e3a8a] text-white rounded-tr-sm' 
                            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                        }`}>
                          {msg.text}
                        </div>
                      )}
                      <div className={`text-[11px] text-gray-400 mt-1.5 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.time} {msg.sender === 'user' && <span className="text-blue-500 ml-1">✓</span>}
                      </div>

                      {msg.products && msg.products.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto mt-3 pb-2 max-w-[280px] scrollbar-hide">
                          {msg.products.map((p, idx) => (
                            <div key={idx} className="shrink-0 w-[140px] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                              <img src={p.image} alt={p.name} className="w-full h-[100px] object-cover" />
                              <div className="p-2.5">
                                <h4 className="text-[12px] font-[600] text-gray-800 line-clamp-1 mb-1">{p.name}</h4>
                                <p className="text-[13px] font-[700] text-yellow-600 mb-2">
                                  {Number(p.price).toLocaleString('vi-VN')}đ
                                </p>
                                <button className="w-full py-1.5 border border-gray-300 rounded-lg text-[12px] font-[600] text-gray-700 hover:bg-gray-50 transition-colors">
                                  Xem chi tiết
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a3 3 0 013 3v2h1a1 1 0 011 1v2a1 1 0 01-1 1h-1v2a3 3 0 01-3 3H9a3 3 0 01-3-3v-2H5a1 1 0 01-1-1v-2a1 1 0 011-1h1V10a3 3 0 013-3h1V5.73A2 2 0 1112 2zm0 2a1 1 0 000 2 1 1 0 000-2zm4 7H8a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-8a1 1 0 00-1-1zm-5.5 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm5 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" /></svg>
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3.5 flex items-center gap-1.5 h-10">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 border border-gray-200 rounded-full pl-4 pr-1.5 py-1.5 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="Nhập tin nhắn của bạn..."
                className="flex-1 bg-transparent text-[14px] focus:outline-none"
              />
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <PaperClipIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 bg-[#0f172a] rounded-full flex items-center justify-center text-white disabled:opacity-50 hover:bg-blue-900 transition-colors"
              >
                <PaperAirplaneIcon className="w-4 h-4 -ml-0.5" />
              </button>
            </div>
            
            <p className="text-center text-[10px] text-gray-400 mt-3 font-[500] flex items-center justify-center gap-1">
              <SparklesIcon className="w-3 h-3 text-yellow-500" /> Powered by <span className="text-gray-700 font-[700]">LightStore AI</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
