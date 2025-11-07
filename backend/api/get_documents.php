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

    $query = "SELECT d.id, d.nomor_dokumen, d.judul, d.file_jpg, d.created_at, 
              GROUP_CONCAT(s.nama ORDER BY s.nama ASC SEPARATOR ', ') as signer_names,
              GROUP_CONCAT(s.id) as signer_ids
          FROM documents d
          LEFT JOIN document_signers ds ON d.id = ds.document_id
          LEFT JOIN signers s ON ds.signer_id = s.id
          GROUP BY d.id
          ORDER BY d.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $documents]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
