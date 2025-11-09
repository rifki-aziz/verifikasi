-- Sample data untuk testing sistem verifikasi dokumen
-- Jalankan setelah schema utama dibuat

USE document_verification;

-- Tambah kolom untuk mendukung fitur lengkap
ALTER TABLE signers ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE signers ADD COLUMN IF NOT EXISTS foto_url VARCHAR(255);
ALTER TABLE signers ADD COLUMN IF NOT EXISTS links_json TEXT;

-- Buat tabel document_files jika belum ada
CREATE TABLE IF NOT EXISTS document_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    INDEX idx_document_id (document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Buat tabel users untuk login admin
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert admin user (password: admin123)
INSERT IGNORE INTO users (username, password, role) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Update signers dengan bio dan foto
UPDATE signers SET 
    bio = 'Pengasuh Pondok Pesantren Lirboyo sejak 1995. Menguasai berbagai kitab kuning dan aktif dalam kegiatan dakwah.',
    foto_url = 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE nama = 'KH. Ahmad Zaini';

UPDATE signers SET 
    bio = 'Kepala Madrasah Aliyah Pondok Pesantren Lirboyo. Lulusan Al-Azhar Kairo dengan pengalaman mengajar 15 tahun.',
    foto_url = 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE nama = 'Ustadz Muhammad Ridwan';

UPDATE signers SET 
    bio = 'Pengurus Pondok Pesantren bagian santri putri. Aktif dalam pembinaan akhlak dan pendidikan karakter.',
    foto_url = 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE nama = 'Nyai Siti Fatimah';

UPDATE signers SET 
    bio = 'Sekretaris Pondok Pesantren Lirboyo. Menangani administrasi dan korespondensi resmi pondok.',
    foto_url = 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE nama = 'Ustadz Abdullah';

UPDATE signers SET 
    bio = 'Bendahara Pondok Pesantren Lirboyo. Mengelola keuangan dan anggaran operasional pondok.',
    foto_url = 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE nama = 'Ustadz Yusuf Rahman';

-- Insert sample document files
INSERT IGNORE INTO document_files (document_id, file_name, file_path, file_type) VALUES
(1, 'Surat_Undangan_Rapat.pdf', 'surat_undangan_1704067200_0.pdf', 'application/pdf'),
(1, 'Lampiran_Agenda.docx', 'lampiran_agenda_1704067260_1.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
(1, 'Denah_Lokasi.jpg', 'denah_lokasi_1704067320_2.jpg', 'image/jpeg'),
(2, 'SK_Pembagian_Tugas.pdf', 'sk_pembagian_1704153600_0.pdf', 'application/pdf'),
(3, 'Proposal_Kegiatan.pdf', 'proposal_kegiatan_1704240000_0.pdf', 'application/pdf'),
(3, 'RAB_Kegiatan.xlsx', 'rab_kegiatan_1704240060_1.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

-- Tambah beberapa dokumen baru untuk testing
INSERT IGNORE INTO documents (nomor_dokumen, judul, file_jpg) VALUES
('DOC011/2025', 'Surat Edaran Protokol Kesehatan di Pondok Pesantren', 'protokol_kesehatan_1704499200_0.jpg'),
('DOC012/2025', 'Undangan Rapat Evaluasi Kurikulum Semester Genap', 'evaluasi_kurikulum_1704585600_0.jpg'),
('DOC013/2025', 'Surat Keputusan Pengangkatan Koordinator Kegiatan Ekstrakurikuler', 'sk_koordinator_1704672000_0.jpg');

-- Tambah relasi dokumen-signer untuk dokumen baru
INSERT IGNORE INTO document_signers (document_id, signer_id) VALUES
-- DOC011/2025 - Protokol Kesehatan
(11, 1), (11, 3), (11, 4),
-- DOC012/2025 - Evaluasi Kurikulum  
(12, 2), (12, 6), (12, 9),
-- DOC013/2025 - SK Koordinator
(13, 1), (13, 2), (13, 4);

-- Tambah file untuk dokumen baru
INSERT IGNORE INTO document_files (document_id, file_name, file_path, file_type) VALUES
(11, 'Protokol_Kesehatan_Detail.pdf', 'protokol_detail_1704499200_0.pdf', 'application/pdf'),
(11, 'Poster_Protokol.jpg', 'poster_protokol_1704499260_1.jpg', 'image/jpeg'),
(12, 'Laporan_Evaluasi.pdf', 'laporan_evaluasi_1704585600_0.pdf', 'application/pdf'),
(12, 'Data_Nilai_Semester.xlsx', 'data_nilai_1704585660_1.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
(13, 'SK_Koordinator_Lengkap.pdf', 'sk_koordinator_lengkap_1704672000_0.pdf', 'application/pdf');

SELECT 'Sample data berhasil ditambahkan!' as status;
SELECT COUNT(*) as total_signers FROM signers;
SELECT COUNT(*) as total_documents FROM documents;
SELECT COUNT(*) as total_document_files FROM document_files;
SELECT COUNT(*) as total_users FROM users;