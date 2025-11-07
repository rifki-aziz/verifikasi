-- Document Verification System Database Schema
-- Pondok Pesantren Lirboyo Kediri

-- Create database (run this separately if needed)
CREATE DATABASE document_verification CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE document_verification;

-- Table: signers
-- Stores information about document signers
CREATE TABLE IF NOT EXISTS signers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    jabatan VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nama (nama),
    INDEX idx_jabatan (jabatan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: documents
-- Stores document information
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomor_dokumen VARCHAR(50) NOT NULL UNIQUE,
    judul TEXT NOT NULL,
    file_jpg VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nomor_dokumen (nomor_dokumen),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: document_signers
-- Many-to-many relationship between documents and signers
CREATE TABLE IF NOT EXISTS document_signers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    signer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (signer_id) REFERENCES signers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_document_signer (document_id, signer_id),
    INDEX idx_document_id (document_id),
    INDEX idx_signer_id (signer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample signers data
INSERT INTO signers (nama, jabatan) VALUES
('KH. Ahmad Zaini', 'Pengasuh Pondok Pesantren'),
('Ustadz Muhammad Ridwan', 'Kepala Madrasah'),
('Nyai Siti Fatimah', 'Pengurus Pondok'),
('Ustadz Abdullah', 'Sekretaris'),
('Ustadz Yusuf Rahman', 'Bendahara'),
('Ustadz Ali Hasan', 'Koordinator Pendidikan'),
('Ustadz Ibrahim Malik', 'Wakil Kepala Madrasah'),
('Nyai Aminah', 'Koordinator Santri Putri'),
('Ustadz Muhammad Salim', 'Kepala Bagian Kurikulum'),
('Ustadz Ahmad Fauzi', 'Koordinator Kegiatan Santri'),
('Nyai Khadijah', 'Pembina Santri Putri'),
('Ustadz Hasan Basri', 'Kepala Perpustakaan'),
('Ustadz Umar Faruq', 'Koordinator Tahfidz'),
('Ustadz Zainuddin', 'Kepala Bagian Sarana Prasarana'),
('Nyai Aisyah', 'Koordinator Kesehatan Santri');

-- Insert sample documents data
INSERT INTO documents (nomor_dokumen, judul, file_jpg) VALUES
('DOC001/2024', 'Undangan Rapat Koordinasi Santri', 'doc001_2024.jpg'),
('DOC002/2024', 'Surat Keputusan Pengangkatan Ustadz Baru', 'doc002_2024.jpg'),
('DOC003/2024', 'Undangan Rapat Evaluasi Pembelajaran', 'doc003_2024.jpg'),
('DOC004/2024', 'Surat Edaran Jadwal Ujian Semester', 'doc004_2024.jpg'),
('DOC005/2024', 'Undangan Rapat Koordinasi Pengurus', 'doc005_2024.jpg'),
('DOC006/2024', 'Surat Keputusan Pembagian Tugas Mengajar', 'doc006_2024.jpg'),
('DOC007/2024', 'Undangan Rapat Persiapan Ramadhan', 'doc007_2024.jpg'),
('DOC008/2024', 'Surat Edaran Tata Tertib Santri Baru', 'doc008_2024.jpg'),
('DOC009/2024', 'Undangan Rapat Koordinasi Kegiatan Tahfidz', 'doc009_2024.jpg'),
('DOC010/2024', 'Surat Keputusan Pengangkatan Koordinator Baru', 'doc010_2024.jpg');

-- Insert sample document-signer relationships
-- DOC001/2024 - signed by Pengasuh, Kepala Madrasah, Pengurus Pondok
INSERT INTO document_signers (document_id, signer_id) VALUES
(1, 1), (1, 2), (1, 3);

-- DOC002/2024 - signed by Pengasuh, Sekretaris, Bendahara
INSERT INTO document_signers (document_id, signer_id) VALUES
(2, 1), (2, 4), (2, 5);

-- DOC003/2024 - signed by Kepala Madrasah, Koordinator Pendidikan, Wakil Kepala
INSERT INTO document_signers (document_id, signer_id) VALUES
(3, 2), (3, 6), (3, 7);

-- DOC004/2024 - signed by Kepala Madrasah, Kepala Bagian Kurikulum
INSERT INTO document_signers (document_id, signer_id) VALUES
(4, 2), (4, 9);

-- DOC005/2024 - signed by Pengasuh, Sekretaris, Bendahara, Pengurus Pondok
INSERT INTO document_signers (document_id, signer_id) VALUES
(5, 1), (5, 4), (5, 5), (5, 3);

-- DOC006/2024 - signed by Kepala Madrasah, Koordinator Pendidikan, Kepala Bagian Kurikulum
INSERT INTO document_signers (document_id, signer_id) VALUES
(6, 2), (6, 6), (6, 9);

-- DOC007/2024 - signed by Pengasuh, Koordinator Kegiatan Santri, Koordinator Santri Putri
INSERT INTO document_signers (document_id, signer_id) VALUES
(7, 1), (7, 10), (7, 8);

-- DOC008/2024 - signed by Kepala Madrasah, Koordinator Kegiatan Santri, Pembina Santri Putri
INSERT INTO document_signers (document_id, signer_id) VALUES
(8, 2), (8, 10), (8, 11);

-- DOC009/2024 - signed by Koordinator Tahfidz, Kepala Madrasah
INSERT INTO document_signers (document_id, signer_id) VALUES
(9, 13), (9, 2);

-- DOC010/2024 - signed by Pengasuh, Sekretaris, Koordinator Pendidikan
INSERT INTO document_signers (document_id, signer_id) VALUES
(10, 1), (10, 4), (10, 6);

-- Create indexes for better performance
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_signers_nama_jabatan ON signers(nama, jabatan);
CREATE INDEX idx_document_signers_composite ON document_signers(document_id, signer_id);

-- Show table information
SELECT 'Database schema created successfully!' as status;
SELECT COUNT(*) as total_signers FROM signers;
SELECT COUNT(*) as total_documents FROM documents;
SELECT COUNT(*) as total_document_signers FROM document_signers;