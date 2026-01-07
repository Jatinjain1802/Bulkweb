import React from 'react';
import { MoreVertical, Megaphone } from 'lucide-react';

const Chat = () => (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Contact List */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
         <div className="p-4 border-b border-gray-100">
            <input type="text" placeholder="Search chats..." className="w-full px-4 py-2 rounded-xl bg-gray-100 border-none text-sm focus:ring-2 focus:ring-indigo-500/20" />
         </div>
         <div className="flex-1 overflow-y-auto">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${i === 1 ? 'bg-indigo-50/50 border-l-4 border-l-indigo-500' : ''}`}>
                 <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                       <h4 className="text-sm font-semibold text-slate-800 truncate">Alice Smith</h4>
                       <span className="text-[10px] text-slate-400">10:30 AM</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">Hey, I had a question about...</p>
                 </div>
              </div>
            ))}
         </div>
      </div>
  
      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
         <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white z-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">AS</div>
               <div>
                  <h4 className="text-sm font-bold text-slate-800">Alice Smith</h4>
                  <p className="text-[10px] text-green-500 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                  </p>
               </div>
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-lg text-slate-400">
               <MoreVertical className="w-5 h-5" />
            </button>
         </div>
         
         <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            <div className="flex justify-start">
               <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none max-w-sm shadow-sm text-sm text-slate-600">
                  Hi, I'm interested in your bulk messaging service.
               </div>
            </div>
            <div className="flex justify-end">
               <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none max-w-sm shadow-md text-sm">
                  Hello! Thanks for reaching out. I'd be happy to help you with that. What specifically are you looking for?
               </div>
            </div>
         </div>
  
         <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
               <input type="text" placeholder="Type a message..." className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
               <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-colors shadow-lg shadow-indigo-200">
                  <Megaphone className="w-4 h-4 rotate-12" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );

export default Chat;
