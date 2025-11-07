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
    $roles = isset($_POST['signer_roles']) && is_array($_POST['signer_roles'])
        ? $_POST['signer_roles'] : [];

    if ($nomor_dokumen === '') throw new Exception('Nomor dokumen is required');
    if ($judul === '') throw new Exception('Judul is required');
    if (empty($signers)) throw new Exception('At least one signer is required');

    // --- SETUP UPLOAD DIR ---
    $upload_dir = __DIR__ . '/../uploads/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

    $allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf'];
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
    $st = $db->prepare('INSERT INTO documents (nomor_dokumen, judul) VALUES (?, ?)');
    $st->execute([$nomor_dokumen, $judul]);
    $document_id = (int)$db->lastInsertId();

    // Simpan signers
    $hasRoleColumn = true; // ubah ke false jika tabel tidak punya kolom jabatan
    if ($hasRoleColumn) {
        $ins = $db->prepare('INSERT INTO document_signers (document_id, signer_id, jabatan) VALUES (?, ?, ?)');
        foreach ($signers as $sid) {
            $sid = (int)$sid;
            if ($sid <= 0) continue;
            $jabatan = $roles[$sid] ?? null;
            $jabatan = ($jabatan !== null && trim($jabatan) === '') ? null : $jabatan;
            $ins->execute([$document_id, $sid, $jabatan]);
        }
    } else {
        $ins = $db->prepare('INSERT INTO document_signers (document_id, signer_id) VALUES (?, ?)');
        foreach ($signers as $sid) {
            $sid = (int)$sid;
            if ($sid <= 0) continue;
            $ins->execute([$document_id, $sid]);
        }
    }

    // --- HANDLE MULTIPLE FILE UPLOADS ---
    $savedFiles = [];

    if (!empty($_FILES['files']['name']) && is_array($_FILES['files']['name'])) {
        $count = count($_FILES['files']['name']);
        $insertFile = $db->prepare('INSERT INTO document_files (document_id, file_name, file_path) VALUES (?, ?, ?)');

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
                $insertFile->execute([$document_id, $_FILES['files']['name'][$i], $newName]);
                $savedFiles[] = $newName;
            }
        }
    }

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Document and files saved successfully',
        'data' => [
            'id' => $document_id,
            'nomor_dokumen' => $nomor_dokumen,
            'judul' => $judul,
            'files' => $savedFiles,
        ]
    ]);

} catch (Throwable $e) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log('documents.php error: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
