<?php
// File: backend/api/create_signer.php

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

try {
    // Ambil input
    $nama    = trim($_POST['nama'] ?? '');
    $jabatan = trim($_POST['jabatan'] ?? '');
    $bio     = trim($_POST['bio'] ?? '');

    // Validasi nama
    if ($nama === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nama wajib diisi']);
        exit();
    }

    // Proses upload foto
    $fotoUrl = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        // Tentukan direktori upload
        $uploadDir = __DIR__ . '/../uploads/signers';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0777, true);
        }

        // Ambil ekstensi foto dan nama yang aman
        $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $safeName = uniqid('signer_', true) . '.' . strtolower($ext);
        $target = $uploadDir . '/' . $safeName;

        // Pindahkan file foto ke direktori yang benar
        if (move_uploaded_file($_FILES['photo']['tmp_name'], $target)) {
            $relativePath = 'uploads/signers/' . $safeName;

            // Bangun URL absolut supaya bisa diakses dari frontend
            $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'];
            $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
            $fotoUrl = $scheme . '://' . $host . $basePath . '/../' . $relativePath;
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Gagal mengupload foto']);
            exit();
        }
    }

    // Koneksi ke database
    $db = (new Database())->getConnection();
    $st = $db->prepare('INSERT INTO signers (nama, jabatan, bio, foto_url) VALUES (?, ?, ?, ?)');
    $st->execute([
        $nama,
        $jabatan !== '' ? $jabatan : null,
        $bio !== '' ? $bio : null,
        $fotoUrl,
    ]);

    // Kembalikan respon sukses dengan data penandatangan yang baru
    echo json_encode([
        'success' => true,
        'data'    => [
            'id'      => (int)$db->lastInsertId(),
            'nama'    => $nama,
            'jabatan' => $jabatan,
            'bio'     => $bio,
            'photo'   => $fotoUrl, // langsung URL absolut
        ]
    ]);
} catch (Throwable $e) {
    error_log('create_signer error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal server error']);
}
