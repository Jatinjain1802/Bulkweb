import React from 'react';
import { X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", isDanger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl w-[90%] max-w-[400px] p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-[#111b21]">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-[#54656f] hover:bg-[#f0f2f5] p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-8">
          <p className="text-[#3b4a54] text-[15px] leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#00a884] text-[14px] font-medium hover:bg-[#f0f2f5] rounded-full transition-colors border border-[#e9edef]"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2 text-[14px] font-medium text-white rounded-full shadow-sm transition-all hover:shadow-md ${
              isDanger 
                ? "bg-[#ef4444] hover:bg-[#dc2626]" 
                : "bg-[#00a884] hover:bg-[#008f6f]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
