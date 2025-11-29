'use client';

// import React, { useState } from 'react';
// import { MessageCircle, X, Send } from 'lucide-react';
// import { Button } from './ui/button';
// import { motion, AnimatePresence } from 'motion/react';

// export function Chatbot() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([
//     {
//       text: 'Xin chào! Tôi là trợ lý ảo của Tech Store. Tôi có thể giúp gì cho bạn?',
//       isBot: true,
//     },
//   ]);
//   const [inputValue, setInputValue] = useState('');

//   const quickReplies = [
//     'Chính sách bảo hành',
//     'Thời gian giao hàng',
//     'Phương thức thanh toán',
//     'Liên hệ tư vấn',
//   ];

//   const handleSend = (message?: string) => {
//     const text = message || inputValue.trim();
//     if (!text) return;

//     setMessages((prev) => [...prev, { text, isBot: false }]);
//     setInputValue('');

//     // Simulate bot response
//     setTimeout(() => {
//       let botResponse = '';
//       const lowerText = text.toLowerCase();

//       if (lowerText.includes('bảo hành')) {
//         botResponse =
//           'Tất cả sản phẩm đều được bảo hành chính hãng từ 6-24 tháng. Bạn có thể mang sản phẩm đến bất kỳ chi nhánh nào để được hỗ trợ bảo hành.';
//       } else if (lowerText.includes('giao hàng')) {
//         botResponse =
//           'Thời gian giao hàng: 1-3 ngày trong nội thành, 3-7 ngày ngoại thành. Miễn phí ship cho đơn hàng trên 500.000đ.';
//       } else if (lowerText.includes('thanh toán')) {
//         botResponse =
//           'Chúng tôi hỗ trợ thanh toán: Tiền mặt khi nhận hàng (COD), chuyển khoản ngân hàng, ví điện tử (Momo, ZaloPay).';
//       } else if (lowerText.includes('liên hệ') || lowerText.includes('tư vấn')) {
//         botResponse =
//           'Bạn có thể liên hệ với chúng tôi qua:\n📞 Hotline: 1900 xxxx\n📧 Email: support@store.vn\n💬 Zalo: 0912 345 678';
//       } else {
//         botResponse =
//           'Cảm ơn bạn đã liên hệ! Để được tư vấn chi tiết hơn, vui lòng gọi hotline 1900 xxxx hoặc chọn một trong các câu hỏi phía dưới.';
//       }

//       setMessages((prev) => [...prev, { text: botResponse, isBot: true }]);
//     }, 800);
//   };

//   return (
//     <>
//       {/* Chat Button */}
//       <AnimatePresence>
//         {!isOpen && (
//           <motion.div
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0, opacity: 0 }}
//             className="fixed bottom-6 right-6 z-50"
//           >
//             <Button
//               onClick={() => setIsOpen(true)}
//               size="icon"
//               className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg"
//             >
//               <MessageCircle className="h-6 w-6" />
//             </Button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Chat Window */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: 20, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 20, scale: 0.95 }}
//             className="fixed bottom-6 right-6 z-50 w-[90vw] sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
//             style={{ maxHeight: 'calc(100vh - 100px)' }}
//           >
//             {/* Header */}
//             <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
//                   <MessageCircle className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <div>Trợ lý ảo</div>
//                   <div className="text-xs opacity-90">Trực tuyến</div>
//                 </div>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => setIsOpen(false)}
//                 className="text-white hover:bg-white/20 rounded-full"
//               >
//                 <X className="h-5 w-5" />
//               </Button>
//             </div>

//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
//               {messages.map((msg, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
//                 >
//                   <div
//                     className={`max-w-[80%] rounded-2xl px-4 py-2 whitespace-pre-wrap ${
//                       msg.isBot
//                         ? 'bg-white text-gray-800'
//                         : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
//                     }`}
//                   >
//                     {msg.text}
//                   </div>
//                 </motion.div>
//               ))}
//             </div>

//             {/* Quick Replies */}
//             <div className="px-4 py-2 bg-gray-50 border-t">
//               <div className="flex flex-wrap gap-2">
//                 {quickReplies.map((reply) => (
//                   <button
//                     key={reply}
//                     onClick={() => handleSend(reply)}
//                     className="text-sm px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 rounded-full transition-colors border border-blue-200"
//                   >
//                     {reply}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Input */}
//             <div className="p-4 bg-white border-t">
//               <form
//                 onSubmit={(e) => {
//                   e.preventDefault();
//                   handleSend();
//                 }}
//                 className="flex gap-2"
//               >
//                 <input
//                   type="text"
//                   value={inputValue}
//                   onChange={(e) => setInputValue(e.target.value)}
//                   placeholder="Nhập tin nhắn..."
//                   className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <Button
//                   type="submit"
//                   size="icon"
//                   className="rounded-full bg-gradient-to-br from-blue-500 to-purple-600"
//                 >
//                   <Send className="h-4 w-4" />
//                 </Button>
//               </form>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }