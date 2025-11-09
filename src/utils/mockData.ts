import { Document, DocumentFile, Signer } from '../types';

export const mockSigners: Signer[] = [
  {
    id: 1,
    nama: 'KH. Ahmad Zaini',
    jabatan: 'Pengasuh Pondok Pesantren',
    bio: 'Pengasuh Pondok Pesantren Lirboyo sejak 1995. Menguasai berbagai kitab kuning dan aktif dalam kegiatan dakwah.',
    foto_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 2,
    nama: 'Ustadz Muhammad Ridwan',
    jabatan: 'Kepala Madrasah',
    bio: 'Kepala Madrasah Aliyah Pondok Pesantren Lirboyo. Lulusan Al-Azhar Kairo dengan pengalaman mengajar 15 tahun.',
    foto_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 3,
    nama: 'Nyai Siti Fatimah',
    jabatan: 'Pengurus Pondok',
    bio: 'Pengurus Pondok Pesantren bagian santri putri. Aktif dalam pembinaan akhlak dan pendidikan karakter.',
    foto_url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 4,
    nama: 'Ustadz Abdullah',
    jabatan: 'Sekretaris',
    bio: 'Sekretaris Pondok Pesantren Lirboyo. Menangani administrasi dan korespondensi resmi pondok.',
    foto_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 5,
    nama: 'Ustadz Yusuf Rahman',
    jabatan: 'Bendahara',
    bio: 'Bendahara Pondok Pesantren Lirboyo. Mengelola keuangan dan anggaran operasional pondok.',
    foto_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export const mockDocumentFiles: DocumentFile[] = [
  {
    id: 1,
    document_id: 1,
    file_name: 'Surat_Undangan_Rapat.pdf',
    file_path: 'surat_undangan_1704067200_0.pdf',
    file_type: 'application/pdf',
    uploaded_at: '2025-01-15 10:30:00',
  },
  {
    id: 2,
    document_id: 1,
    file_name: 'Lampiran_Agenda.docx',
    file_path: 'lampiran_agenda_1704067260_1.docx',
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploaded_at: '2025-01-15 10:31:00',
  },
  {
    id: 3,
    document_id: 1,
    file_name: 'Denah_Lokasi.jpg',
    file_path: 'denah_lokasi_1704067320_2.jpg',
    file_type: 'image/jpeg',
    uploaded_at: '2025-01-15 10:32:00',
  },
  {
    id: 4,
    document_id: 2,
    file_name: 'SK_Pembagian_Tugas.pdf',
    file_path: 'sk_pembagian_1704153600_0.pdf',
    file_type: 'application/pdf',
    uploaded_at: '2025-01-14 14:20:00',
  },
  {
    id: 5,
    document_id: 3,
    file_name: 'Proposal_Kegiatan.pdf',
    file_path: 'proposal_kegiatan_1704240000_0.pdf',
    file_type: 'application/pdf',
    uploaded_at: '2025-01-13 16:00:00',
  },
  {
    id: 6,
    document_id: 3,
    file_name: 'RAB_Kegiatan.xlsx',
    file_path: 'rab_kegiatan_1704240060_1.xlsx',
    file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uploaded_at: '2025-01-13 16:01:00',
  }
];

export const mockDocuments: Document[] = [
  {
    id: 1,
    nomor_dokumen: 'DOC001/2025',
    judul: 'Surat Undangan Rapat Koordinasi Tahunan Pengurus Pondok Pesantren',
    file_jpg: 'surat_undangan_1704067200_0.pdf',
    created_at: '2025-01-15',
    signer_names: ['KH. Ahmad Zaini', 'Ustadz Muhammad Ridwan', 'Nyai Siti Fatimah'],
    signers: [mockSigners[0], mockSigners[1], mockSigners[2]],
    files: mockDocumentFiles.filter(f => f.document_id === 1),
  },
  {
    id: 2,
    nomor_dokumen: 'DOC002/2025',
    judul: 'Surat Keputusan Pembagian Tugas Mengajar Semester Genap 2024/2025',
    file_jpg: 'sk_pembagian_1704153600_0.pdf',
    created_at: '2025-01-14',
    signer_names: ['KH. Ahmad Zaini', 'Ustadz Muhammad Ridwan', 'Ustadz Abdullah'],
    signers: [mockSigners[0], mockSigners[1], mockSigners[3]],
    files: mockDocumentFiles.filter(f => f.document_id === 2),
  },
  {
    id: 3,
    nomor_dokumen: 'DOC003/2025',
    judul: 'Proposal Kegiatan Peringatan Maulid Nabi Muhammad SAW 1446 H',
    file_jpg: 'proposal_kegiatan_1704240000_0.pdf',
    created_at: '2025-01-13',
    signer_names: ['Ustadz Abdullah', 'Ustadz Yusuf Rahman'],
    signers: [mockSigners[3], mockSigners[4]],
    files: mockDocumentFiles.filter(f => f.document_id === 3),
  },
  {
    id: 4,
    nomor_dokumen: 'DOC004/2025',
    judul: 'Surat Edaran Jadwal Ujian Semester Genap Tahun Pelajaran 2024/2025',
    file_jpg: 'surat_edaran_ujian_1704326400_0.jpg',
    created_at: '2025-01-12',
    signer_names: ['Ustadz Muhammad Ridwan', 'Ustadz Abdullah'],
    signers: [mockSigners[1], mockSigners[3]],
    files: [
      {
        id: 7,
        document_id: 4,
        file_name: 'Jadwal_Ujian_Semester.pdf',
        file_path: 'jadwal_ujian_1704326400_0.pdf',
        file_type: 'application/pdf',
        uploaded_at: '2025-01-12 10:00:00',
      }
    ],
  },
  {
    id: 5,
    nomor_dokumen: 'DOC005/2025',
    judul: 'Undangan Rapat Persiapan Bulan Ramadhan 1446 H',
    file_jpg: 'undangan_ramadhan_1704412800_0.jpg',
    created_at: '2025-01-11',
    signer_names: ['KH. Ahmad Zaini', 'Nyai Siti Fatimah', 'Ustadz Yusuf Rahman'],
    signers: [mockSigners[0], mockSigners[2], mockSigners[4]],
    files: [
      {
        id: 8,
        document_id: 5,
        file_name: 'Agenda_Persiapan_Ramadhan.pdf',
        file_path: 'agenda_ramadhan_1704412800_0.pdf',
        file_type: 'application/pdf',
        uploaded_at: '2025-01-11 14:00:00',
      },
      {
        id: 9,
        document_id: 5,
        file_name: 'Daftar_Kegiatan_Ramadhan.docx',
        file_path: 'kegiatan_ramadhan_1704412860_1.docx',
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploaded_at: '2025-01-11 14:01:00',
      }
    ],
  }
];

export function getDocumentsFromLocalStorage(): Document[] {
  try {
    const stored = localStorage.getItem('uploadedDocuments');
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return [];
}

export function saveDocumentsToLocalStorage(documents: Document[]): void {
  try {
    // Limit to 50 documents to prevent localStorage overflow
    const limitedDocs = documents.slice(0, 50);
    localStorage.setItem('uploadedDocuments', JSON.stringify(limitedDocs));
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

export function updateDocumentInLocalStorage(updatedDocument: Document): void {
  const existing = getDocumentsFromLocalStorage();
  const updated = existing.map(doc => 
    doc.id === updatedDocument.id ? updatedDocument : doc
  );
  saveDocumentsToLocalStorage(updated);
}

export function initMockData(): void {
  const existing = getDocumentsFromLocalStorage();
  if (existing.length === 0) {
    console.log('Initializing mock data...');
    saveDocumentsToLocalStorage(mockDocuments);
  }
}

// Helper function to get mock document by nomor_dokumen
export function getMockDocumentByNumber(nomor_dokumen: string): Document | null {
  const allDocs = [...mockDocuments, ...getDocumentsFromLocalStorage()];
  return allDocs.find(doc => 
    doc.nomor_dokumen.toLowerCase() === nomor_dokumen.toLowerCase()
  ) || null;
}

// Helper function to search documents
export function searchDocuments(query: string): Document[] {
  const allDocs = [...mockDocuments, ...getDocumentsFromLocalStorage()];
  const searchTerm = query.toLowerCase();
  
  return allDocs.filter(doc =>
    doc.nomor_dokumen.toLowerCase().includes(searchTerm) ||
    doc.judul.toLowerCase().includes(searchTerm) ||
    doc.signer_names.some(name => name.toLowerCase().includes(searchTerm))
  );
}

// Helper function to get documents by signer
export function getDocumentsBySigner(signerId: number): Document[] {
  const allDocs = [...mockDocuments, ...getDocumentsFromLocalStorage()];
  
  return allDocs.filter(doc =>
    doc.signers.some(signer => signer.id === signerId)
  );
}

export { mockSigners, mockDocuments, mockDocumentFiles };