<?php
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $nomor_dokumen = isset($_POST['nomor_dokumen']) ? trim($_POST['nomor_dokumen']) : '';
    $judul = isset($_POST['judul']) ? trim($_POST['judul']) : '';
    $signers = isset($_POST['signers']) ? $_POST['signers'] : [];

    if (empty($nomor_dokumen)) throw new Exception('Nomor dokumen is required');
    if (empty($judul)) throw new Exception('Judul is required');
    if (empty($signers) || !is_array($signers)) throw new Exception('At least one signer is required');

    $upload_dir = '../uploads/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

    $uploaded_files = [];

    // --- Multi-file upload handling ---
    if (!empty($_FILES['files']) && is_array($_FILES['files']['name'])) {
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];

        foreach ($_FILES['files']['name'] as $index => $original_name) {
            if ($_FILES['files']['error'][$index] !== UPLOAD_ERR_OK) continue;

            $file_info = pathinfo($original_name);
            $file_extension = strtolower($file_info['extension'] ?? '');

            if (!in_array($file_extension, $allowed_extensions)) {
                throw new Exception('Only JPG, JPEG, PNG, PDF, and DOCX files are allowed');
            }

            if ($_FILES['files']['size'][$index] > 10 * 1024 * 1024) {
                throw new Exception('Each file must be less than 10MB');
            }

            $safe_name = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $file_info['filename']);
            $new_name = $safe_name . '_' . time() . '_' . $index . '.' . $file_extension;
            $upload_path = $upload_dir . $new_name;

            if (!move_uploaded_file($_FILES['files']['tmp_name'][$index], $upload_path)) {
                throw new Exception('Failed to upload file: ' . $original_name);
            }

            // Detect MIME type
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime_type = finfo_file($finfo, $upload_path);
            finfo_close($finfo);

            $uploaded_files[] = [
                'file_name' => $original_name,
                'stored_name' => $new_name,
                'file_path' => basename($new_name),
                'file_type' => $mime_type
            ];
        }
    }

    $database = new Database();
    $db = $database->getConnection();
    if (!$db) throw new Exception('Database connection failed');

    $db->beginTransaction();

    // --- Cek duplikat nomor ---
    $check_stmt = $db->prepare("SELECT id FROM documents WHERE nomor_dokumen = :nomor_dokumen");
    $check_stmt->bindParam(':nomor_dokumen', $nomor_dokumen);
    $check_stmt->execute();
    if ($check_stmt->fetch()) throw new Exception('Document number already exists');

    // --- Insert dokumen ---
    $doc_stmt = $db->prepare("INSERT INTO documents (nomor_dokumen, judul) VALUES (:nomor_dokumen, :judul)");
    $doc_stmt->execute([
        ':nomor_dokumen' => $nomor_dokumen,
        ':judul' => $judul
    ]);

    $document_id = $db->lastInsertId();

    // --- Insert files ke document_files ---
    if (!empty($uploaded_files)) {
        $file_stmt = $db->prepare("
            INSERT INTO document_files (document_id, file_name, file_path)
            VALUES (:document_id, :file_name, :file_path)
        ");

        foreach ($uploaded_files as $file) {
            $file_stmt->execute([
                ':document_id' => $document_id,
                ':file_name' => $file['file_name'],
                ':file_path' => $file['file_path']
            ]);
        }
    }

    // --- Insert signers ---
    $signer_stmt = $db->prepare("INSERT INTO document_signers (document_id, signer_id) VALUES (:document_id, :signer_id)");
    foreach ($signers as $signer_id) {
        $signer_id = intval($signer_id);
        if ($signer_id > 0) {
            $signer_stmt->execute([
                ':document_id' => $document_id,
                ':signer_id' => $signer_id
            ]);
        }
    }

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Document and files created successfully',
        'data' => [
            'id' => $document_id,
            'nomor_dokumen' => $nomor_dokumen,
            'judul' => $judul,
            'files' => $uploaded_files
        ]
    ]);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }

    // hapus semua file yang sudah ter-upload jika gagal
    if (!empty($uploaded_files)) {
        foreach ($uploaded_files as $file) {
            $path = '../uploads/' . $file['stored_name'];
            if (is_file($path)) @unlink($path);
        }
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
