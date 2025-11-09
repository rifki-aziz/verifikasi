<?php
// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    // Get documents with signers and files
    $query = "
        SELECT 
            d.id,
            d.nomor_dokumen,
            d.judul,
            d.file_jpg,
            d.created_at,
            GROUP_CONCAT(DISTINCT s.nama ORDER BY s.nama ASC SEPARATOR ', ') as signer_names,
            GROUP_CONCAT(DISTINCT s.id ORDER BY s.nama ASC) as signer_ids,
            COUNT(DISTINCT df.id) as file_count
        FROM documents d
        LEFT JOIN document_signers ds ON d.id = ds.document_id
        LEFT JOIN signers s ON ds.signer_id = s.id
        LEFT JOIN document_files df ON d.id = df.document_id
        GROUP BY d.id
        ORDER BY d.created_at DESC
    ";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get detailed signers and files for each document
    foreach ($documents as &$doc) {
        // Get signers
        $signerQuery = "
            SELECT s.id, s.nama, s.jabatan, s.bio, s.foto_url
            FROM signers s
            JOIN document_signers ds ON s.id = ds.signer_id
            WHERE ds.document_id = :doc_id
            ORDER BY s.nama ASC
        ";
        $signerStmt = $db->prepare($signerQuery);
        $signerStmt->bindParam(':doc_id', $doc['id'], PDO::PARAM_INT);
        $signerStmt->execute();
        $doc['signers'] = $signerStmt->fetchAll(PDO::FETCH_ASSOC);

        // Get files
        $fileQuery = "SELECT * FROM document_files WHERE document_id = :doc_id ORDER BY id ASC";
        $fileStmt = $db->prepare($fileQuery);
        $fileStmt->bindParam(':doc_id', $doc['id'], PDO::PARAM_INT);
        $fileStmt->execute();
        $doc['files'] = $fileStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(['success' => true, 'data' => $documents]);

} catch (Exception $e) {
    error_log('Get Documents API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>