<?php
// File: backend/api/documents.php

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
    // --- INPUT ---
    $nomor_dokumen = trim($_POST['nomor_dokumen'] ?? '');
    $judul = trim($_POST['judul'] ?? '');
    $signers = $_POST['signers'] ?? [];

    if ($nomor_dokumen === '') throw new Exception('Nomor dokumen is required');
    if ($judul === '') throw new Exception('Judul is required');
    if (empty($signers)) throw new Exception('At least one signer is required');

    // --- SETUP UPLOAD DIR ---
    $upload_dir = __DIR__ . '/../uploads/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

    $allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
    $max_size = 10 * 1024 * 1024; // 10MB

    // --- DATABASE ---
    $dbObj = new Database();
    $db = $dbObj->getConnection();
    if (!$db) throw new Exception('Database connection failed');

    $db->beginTransaction();

    // Cek duplikasi nomor
    $st = $db->prepare('SELECT id FROM documents WHERE nomor_dokumen = ? LIMIT 1');
    $st->execute([$nomor_dokumen]);
    if ($st->fetch()) throw new Exception('Document number already exists');

    // Simpan dokumen utama
    $st = $db->prepare('INSERT INTO documents (nomor_dokumen, judul, file_jpg) VALUES (?, ?, ?)');
    $first_file = '';
    
    // Handle file upload untuk file_jpg utama
    if (!empty($_FILES['files']['name']) && is_array($_FILES['files']['name'])) {
        $first_file_name = $_FILES['files']['name'][0];
        $first_file_tmp = $_FILES['files']['tmp_name'][0];
        $first_file_error = $_FILES['files']['error'][0];
        
        if ($first_file_error === UPLOAD_ERR_OK) {
            $info = pathinfo($first_file_name);
            $ext = strtolower($info['extension'] ?? '');
            if (in_array($ext, $allowed_extensions)) {
                $safeBase = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $info['filename'] ?? 'file');
                $first_file = $safeBase . '_' . time() . "_0.$ext";
                $target = $upload_dir . $first_file;
                move_uploaded_file($first_file_tmp, $target);
            }
        }
    }
    
    $st->execute([$nomor_dokumen, $judul, $first_file]);
    $document_id = (int)$db->lastInsertId();

    // Simpan signers
    $ins = $db->prepare('INSERT INTO document_signers (document_id, signer_id) VALUES (?, ?)');
    foreach ($signers as $sid) {
        $sid = (int)$sid;
        if ($sid <= 0) continue;
        $ins->execute([$document_id, $sid]);
    }

    // --- HANDLE MULTIPLE FILE UPLOADS ---
    $savedFiles = [];

    if (!empty($_FILES['files']['name']) && is_array($_FILES['files']['name'])) {
        $count = count($_FILES['files']['name']);
        $insertFile = $db->prepare('INSERT INTO document_files (document_id, file_name, file_path, file_type) VALUES (?, ?, ?, ?)');

        for ($i = 0; $i < $count; $i++) {
            if ($_FILES['files']['error'][$i] !== UPLOAD_ERR_OK) continue;

            $info = pathinfo($_FILES['files']['name'][$i]);
            $ext = strtolower($info['extension'] ?? '');
            if (!in_array($ext, $allowed_extensions)) continue;

            if ($_FILES['files']['size'][$i] > $max_size) continue;

            $safeBase = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $info['filename'] ?? 'file');
            $newName = $safeBase . '_' . time() . "_$i.$ext";
            $target = $upload_dir . $newName;

            if (move_uploaded_file($_FILES['files']['tmp_name'][$i], $target)) {
                // Detect MIME type
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mime_type = finfo_file($finfo, $target);
                finfo_close($finfo);
                
                $insertFile->execute([$document_id, $_FILES['files']['name'][$i], $newName, $mime_type]);
                $savedFiles[] = [
                    'file_name' => $_FILES['files']['name'][$i],
                    'file_path' => $newName,
                    'file_type' => $mime_type
                ];
            }
        }
    }

    $db->commit();

    // Get complete document data with signers
    $docQuery = "
        SELECT d.*, s.id as signer_id, s.nama as signer_nama, s.jabatan as signer_jabatan
        FROM documents d
        LEFT JOIN document_signers ds ON d.id = ds.document_id
        LEFT JOIN signers s ON ds.signer_id = s.id
        WHERE d.id = ?
    ";
    $docStmt = $db->prepare($docQuery);
    $docStmt->execute([$document_id]);
    $docResults = $docStmt->fetchAll();

    $responseData = [
        'id' => $document_id,
        'nomor_dokumen' => $nomor_dokumen,
        'judul' => $judul,
        'file_jpg' => $first_file,
        'created_at' => date('Y-m-d H:i:s'),
        'files' => $savedFiles,
        'signers' => [],
        'signer_names' => []
    ];

    foreach ($docResults as $row) {
        if ($row['signer_id']) {
            $responseData['signers'][] = [
                'id' => $row['signer_id'],
                'nama' => $row['signer_nama'],
                'jabatan' => $row['signer_jabatan']
            ];
            $responseData['signer_names'][] = $row['signer_nama'];
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Document and files saved successfully',
        'data' => $responseData
    ]);

} catch (Throwable $e) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
        $db->rollBack();
    }
    
    // Cleanup uploaded files on error
    if (!empty($savedFiles)) {
        foreach ($savedFiles as $file) {
            $path = $upload_dir . $file['file_path'];
            if (is_file($path)) @unlink($path);
        }
    }
    
    error_log('documents.php error: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>