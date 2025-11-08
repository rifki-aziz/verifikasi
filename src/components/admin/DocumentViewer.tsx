import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import { X, Download, FileText, Image as ImageIcon, FileType, CreditCard as Edit, Trash2 } from 'lucide-react';
import { DocumentFile, Document } from '../../types';
import { getFileType } from './helpers';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

interface DocumentViewerProps {
  files: DocumentFile[];
  isOpen: boolean;
  onClose: () => void;
  uploadsBase: string;
  documentTitle?: string;
  document?: Document;
  onEdit?: (doc: Document) => void;
  onDelete?: (docId: number) => void;
  API_BASE?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  files,
  isOpen,
  onClose,
  uploadsBase,
  documentTitle,
  document,
  onEdit,
  onDelete,
  API_BASE,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || files.length === 0) return null;

  const handleDownload = async (file: DocumentFile) => {
    try {
      if (API_BASE) {
        // Download via backend API
        const response = await fetch(`${API_BASE}/download.php?file=${encodeURIComponent(file.file_path)}`);
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Direct download
        const link = document.createElement('a');
        link.href = `${uploadsBase}/uploads/${file.file_path}`;
        link.download = file.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Gagal mendownload file');
    }
  };

  const handleDelete = async () => {
    if (!document || !onDelete || !API_BASE) return;
    
    if (!confirm(`Yakin ingin menghapus dokumen "${document.judul}"?`)) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/delete_document.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: document.id })
      });

      const result = await response.json();
      if (result.success) {
        onDelete(document.id);
        onClose();
        alert('Dokumen berhasil dihapus');
      } else {
        throw new Error(result.error || 'Gagal menghapus dokumen');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus dokumen: ' + (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderFilePreview = (file: DocumentFile) => {
    const fileType = getFileType(file.file_name);
    const fileUrl = `${uploadsBase}/uploads/${file.file_path}`;

    switch (fileType) {
      case 'pdf':
        return (
          <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between bg-gray-100 p-3 rounded-t-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-700">{file.file_name}</span>
              </div>
              <button
                onClick={() => handleDownload(file)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
            <iframe
              src={fileUrl}
              className="w-full flex-1 min-h-[600px] rounded-b-lg"
              title={file.file_name}
            />
          </div>
        );

      case 'image':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full bg-gray-100 p-3 rounded-t-lg mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700">{file.file_name}</span>
              </div>
              <button
                onClick={() => handleDownload(file)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
            <img
              src={fileUrl}
              alt={file.file_name}
              className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
            />
          </div>
        );

      case 'docx':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8">
            <FileType className="w-24 h-24 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{file.file_name}</h3>
            <p className="text-gray-600 mb-6 text-center">
              File Word tidak dapat ditampilkan preview. Silakan download untuk membuka.
            </p>
            <button
              onClick={() => handleDownload(file)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              <Download className="w-5 h-5" />
              Download {file.file_name}
            </button>
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8">
            <FileText className="w-24 h-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{file.file_name}</h3>
            <p className="text-gray-600 mb-6">Preview tidak tersedia untuk file ini.</p>
            <button
              onClick={() => handleDownload(file)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              <Download className="w-5 h-5" />
              Download File
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {documentTitle || 'Preview Dokumen'}
            </h2>
            <p className="text-sm text-gray-500">
              {files.length} dokumen ({currentIndex + 1} dari {files.length})
            </p>
            {document && (
              <p className="text-xs text-gray-400 mt-1">
                Nomor: {document.nomor_dokumen} | Dibuat: {document.created_at}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Edit Button */}
            {document && onEdit && (
              <button
                onClick={() => {
                  onEdit(document);
                  onClose();
                }}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                title="Edit Dokumen"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            
            {/* Delete Button */}
            {document && onDelete && API_BASE && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                title="Hapus Dokumen"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </button>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              title="Tutup"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {files.length === 1 ? (
            <div className="w-full">{renderFilePreview(files[0])}</div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination, Zoom]}
              navigation
              pagination={{ clickable: true }}
              zoom
              spaceBetween={20}
              slidesPerView={1}
              onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
              className="document-viewer-swiper"
            >
              {files.map((file, index) => (
                <SwiperSlide key={file.id || index}>
                  <div className="w-full">{renderFilePreview(file)}</div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>

      <style>{`
        .document-viewer-swiper {
          width: 100%;
          height: 100%;
        }

        .document-viewer-swiper .swiper-button-next,
        .document-viewer-swiper .swiper-button-prev {
          color: #3b82f6;
          background: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .document-viewer-swiper .swiper-button-next:after,
        .document-viewer-swiper .swiper-button-prev:after {
          font-size: 20px;
        }

        .document-viewer-swiper .swiper-pagination-bullet {
          background: #3b82f6;
          opacity: 0.5;
        }

        .document-viewer-swiper .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};