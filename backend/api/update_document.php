<?php
// File: backend/api/update_document.php

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
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $nomor_dokumen = trim($_POST['nomor_dokumen'] ?? '');
    $judul = trim($_POST['judul'] ?? '');
    $signers = $_POST['signers'] ?? [];

    if ($id <= 0) throw new Exception('Document ID is required');
    if ($nomor_dokumen === '') throw new Exception('Nomor dokumen is required');
    if ($judul === '') throw new Exception('Judul is required');

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

    // Check if document exists
    $checkStmt = $db->prepare('SELECT id FROM documents WHERE id = ?');
    $checkStmt->execute([$id]);
    if (!$checkStmt->fetch()) {
        throw new Exception('Document not found');
    }

    // Check for duplicate nomor_dokumen (excluding current document)
    $dupStmt = $db->prepare('SELECT id FROM documents WHERE nomor_dokumen = ? AND id != ?');
    $dupStmt->execute([$nomor_dokumen, $id]);
    if ($dupStmt->fetch()) {
        throw new Exception('Document number already exists');
    }

    // Update document basic info
    $updateStmt = $db->prepare('UPDATE documents SET nomor_dokumen = ?, judul = ? WHERE id = ?');
    $updateStmt->execute([$nomor_dokumen, $judul, $id]);

    // --- HANDLE NEW FILE UPLOADS ---
    $uploadedFiles = [];
    if (!empty($_FILES['files']['name']) && is_array($_FILES['files']['name'])) {
        $count = count($_FILES['files']['name']);
        
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
                // Insert new file record
                $insertFileStmt = $db->prepare('INSERT INTO document_files (document_id, file_name, file_path) VALUES (?, ?, ?)');
                $insertFileStmt->execute([$id, $_FILES['files']['name'][$i], $newName]);
                
                $uploadedFiles[] = [
                    'file_name' => $_FILES['files']['name'][$i],
                    'file_path' => $newName,
                    'stored_name' => $newName
                ];
            }
        }
    }

    // --- UPDATE SIGNERS ---
    if (!empty($signers) && is_array($signers)) {
        // Delete existing signers
        $deleteSignersStmt = $db->prepare('DELETE FROM document_signers WHERE document_id = ?');
        $deleteSignersStmt->execute([$id]);

        // Insert new signers
        $insertSignerStmt = $db->prepare('INSERT INTO document_signers (document_id, signer_id) VALUES (?, ?)');
        foreach ($signers as $signer_id) {
            $signer_id = intval($signer_id);
            if ($signer_id > 0) {
                $insertSignerStmt->execute([$id, $signer_id]);
            }
        }
    }

    // Get updated file list
    $filesStmt = $db->prepare('SELECT file_name, file_path FROM document_files WHERE document_id = ?');
    $filesStmt->execute([$id]);
    $allFiles = $filesStmt->fetchAll(PDO::FETCH_ASSOC);

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Document updated successfully',
        'data' => [
            'id' => $id,
            'nomor_dokumen' => $nomor_dokumen,
            'judul' => $judul,
            'files' => array_merge($uploadedFiles, $allFiles),
            'new_files_count' => count($uploadedFiles)
        ]
    ]);

} catch (Throwable $e) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
        $db->rollBack();
    }
    
    // Cleanup uploaded files on error
    if (!empty($uploadedFiles)) {
        foreach ($uploadedFiles as $file) {
            $filePath = $upload_dir . $file['stored_name'];
            if (file_exists($filePath)) {
                @unlink($filePath);
            }
        }
    }
    
    error_log('update_document.php error: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>