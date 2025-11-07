<?php
// File: backend/api/update_document.php

require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json; charset=utf-8");

// Inisialisasi koneksi
$database = new Database();
$pdo = $database->getConnection();

// CORS (optional, kalau frontend beda origin)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode([
            "success" => false,
            "error" => "Method not allowed"
        ]);
        exit();
    }

    if (!$pdo) {
        throw new Exception("Database connection not available");
    }

    // Validasi input wajib
    if (!isset($_POST['id'], $_POST['nomor_dokumen'], $_POST['judul'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => "Missing required fields"
        ]);
        exit();
    }

    $id     = intval($_POST['id']);
    $nomor  = trim($_POST['nomor_dokumen']);
    $judul  = trim($_POST['judul']);
    $file_jpg = $_POST['file_jpg'] ?? null;

    if (!empty($_FILES['file']['name'])) {
        $uploadDir = __DIR__ . '/../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png'];
        if (!in_array($ext, $allowed)) {
            throw new Exception("Format file tidak didukung: " . $ext);
        }

        $newName = "doc_" . time() . "_" . uniqid() . "." . $ext;
        $target = $uploadDir . $newName;

        if (!move_uploaded_file($_FILES['file']['tmp_name'], $target)) {
            throw new Exception("Gagal upload file baru");
        }

        $file_jpg = $newName;
    }

    $stmt = $pdo->prepare("UPDATE documents 
                           SET nomor_dokumen = ?, judul = ?, file_jpg = ? 
                           WHERE id = ?");
    $stmt->execute([$nomor, $judul, $file_jpg, $id]);

    echo json_encode([
        "success" => true,
        "message" => "Document updated",
        "data" => [
            "id" => $id,
            "nomor_dokumen" => $nomor,
            "judul" => $judul,
            "file_jpg" => $file_jpg
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
