// components/Modal.js
import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-2xl max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <div className="overflow-y-auto max-h-[calc(90vh-50px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
