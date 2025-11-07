// Document.ts
export interface Document {
  id: number;
  nomor_dokumen: string;
  judul: string;
  file_jpg: string;
  created_at: string;

  // daftar nama penandatangan (selalu array of string)
  signer_names: string[];

  // daftar objek signer lengkap
  signers: Signer[];

  // daftar file dokumen (multi-file)
  files?: DocumentFile[];
}

// DocumentFile.ts
export interface DocumentFile {
  id: number;
  document_id: number;
  file_name: string;
  file_path: string;
  file_type?: string;
  uploaded_at?: string;
}

// Signer.ts
export interface Signer {
  id: number;
  nama: string;
  jabatan?: string | null;
  bio?: string | null;

  // sesuai backend: 'photo' = path relatif ke file
  photo?: string | null;    

  // tambahan opsional untuk frontend (computed URL penuh)
  foto_url?: string;         

  // tambahan opsional untuk portfolio
  links?: {
    label: string;
    url: string;
  }[];
}

// DocumentSigner.ts
export interface DocumentSigner {
  id: number;
  document_id: number;
  signer_id: number;
}
