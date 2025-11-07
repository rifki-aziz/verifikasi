// File: src/components/DocumentModal.tsx
import React from "react";
import { Document } from "../../types";
import { X } from "lucide-react";

interface DocumentModalProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  uploadsBase: string;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({ document, isOpen, onClose, uploadsBase }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X size={24} />
        </button>
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">{document.judul}</h3>
          <p className="text-gray-500 mt-2">Nomor Dokumen: {document.nomor_dokumen}</p>
          <p className="text-gray-500">Penandatangan: {document.signer_names}</p>
        </div>
        <div className="mt-4">
          <img
            src={`${uploadsBase}/uploads/${document.file_jpg}`}
            alt={document.judul}
            className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};
