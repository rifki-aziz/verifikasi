import { Document, DocumentFile, Signer } from '../types';

export const mockSigners: Signer[] = [
  {
    id: 1,
    nama: 'Dr. Ahmad Fauzi',
    jabatan: 'Kepala Pondok Pesantren',
    bio: 'Pengasuh Pondok Pesantren Lirboyo sejak 2015',
  },
  {
    id: 2,
    nama: 'Ustadz Muhammad Hasan',
    jabatan: 'Sekretaris',
    bio: 'Sekretaris Pondok Pesantren Lirboyo',
  },
  {
    id: 3,
    nama: 'Ustadzah Fatimah',
    jabatan: 'Bendahara',
    bio: 'Bendahara Pondok Pesantren Lirboyo',
  },
];

export const mockDocumentFiles: DocumentFile[] = [
  {
    id: 1,
    document_id: 1,
    file_name: 'Surat_Undangan_Rapat.pdf',
    file_path: 'doc_690e3a16663c70.72403152.jpg',
    file_type: 'pdf',
    uploaded_at: '2025-01-15 10:30:00',
  },
  {
    id: 2,
    document_id: 1,
    file_name: 'Lampiran_Agenda.docx',
    file_path: 'doc_690e3a30e05482.04556935.png',
    file_type: 'docx',
    uploaded_at: '2025-01-15 10:31:00',
  },
  {
    id: 3,
    document_id: 1,
    file_name: 'Denah_Lokasi.jpg',
    file_path: 'doc_690e3a30e0b8b7.75908900.png',
    file_type: 'image',
    uploaded_at: '2025-01-15 10:32:00',
  },
];

export const mockDocuments: Document[] = [
  {
    id: 1,
    nomor_dokumen: 'DOC001/2025',
    judul: 'Surat Undangan Rapat Koordinasi Tahunan',
    file_jpg: 'doc_690e3a16663c70.72403152.jpg',
    created_at: '2025-01-15',
    signer_names: ['Dr. Ahmad Fauzi', 'Ustadz Muhammad Hasan'],
    signers: [mockSigners[0], mockSigners[1]],
    files: mockDocumentFiles,
  },
  {
    id: 2,
    nomor_dokumen: 'DOC002/2025',
    judul: 'Surat Keputusan Pembagian Tugas',
    file_jpg: 'doc_690e37b325a134.06095764.jpg',
    created_at: '2025-01-14',
    signer_names: ['Dr. Ahmad Fauzi', 'Ustadzah Fatimah'],
    signers: [mockSigners[0], mockSigners[2]],
    files: [
      {
        id: 4,
        document_id: 2,
        file_name: 'SK_Pembagian_Tugas.pdf',
        file_path: 'doc_690e37b325a134.06095764.jpg',
        file_type: 'pdf',
        uploaded_at: '2025-01-14 14:20:00',
      },
    ],
  },
];

export function getDocumentsFromLocalStorage(): Document[] {
  try {
    const stored = localStorage.getItem('uploadedDocuments');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return [];
}

export function saveDocumentsToLocalStorage(documents: Document[]): void {
  try {
    localStorage.setItem('uploadedDocuments', JSON.stringify(documents.slice(0, 50)));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function addDocumentToLocalStorage(document: Document): void {
  const existing = getDocumentsFromLocalStorage();
  existing.unshift(document);
  saveDocumentsToLocalStorage(existing);
}

export function removeDocumentFromLocalStorage(documentId: number): void {
  const existing = getDocumentsFromLocalStorage();
  const filtered = existing.filter(doc => doc.id !== documentId);
  saveDocumentsToLocalStorage(filtered);
}

export function initMockData(): void {
  const existing = getDocumentsFromLocalStorage();
  if (existing.length === 0) {
    saveDocumentsToLocalStorage(mockDocuments);
  }
}
