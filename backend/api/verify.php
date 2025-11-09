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

// Get document number from query parameter
$nomor_dokumen = isset($_GET['nomor_dokumen']) ? trim($_GET['nomor_dokumen']) : '';

if (empty($nomor_dokumen)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Nomor dokumen is required']);
    exit();
}

try {
    // Create database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    
    // Query to get document with signers and files
    $query = "
        SELECT 
            d.id,
            d.nomor_dokumen,
            d.judul,
            d.file_jpg,
            d.created_at,
            s.id as signer_id,
            s.nama as signer_nama,
            s.jabatan as signer_jabatan,
            s.bio as signer_bio,
            s.foto_url as signer_foto
        FROM documents d
        LEFT JOIN document_signers ds ON d.id = ds.document_id
        LEFT JOIN signers s ON ds.signer_id = s.id
        WHERE d.nomor_dokumen = :nomor_dokumen
        ORDER BY s.nama ASC
    ";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':nomor_dokumen', $nomor_dokumen, PDO::PARAM_STR);
    $stmt->execute();
    
    $results = $stmt->fetchAll();
    
    if (empty($results)) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Document not found'
        ]);
        exit();
    }
    
    // Process results to group signers
    $document = [
        'id' => $results[0]['id'],
        'nomor_dokumen' => $results[0]['nomor_dokumen'],
        'judul' => $results[0]['judul'],
        'file_jpg' => $results[0]['file_jpg'],
        'created_at' => $results[0]['created_at'],
        'signers' => [],
        'signer_names' => []
    ];
    
    // Add signers to document
    foreach ($results as $row) {
        if ($row['signer_id']) {
            $signer = [
                'id' => $row['signer_id'],
                'nama' => $row['signer_nama'],
                'jabatan' => $row['signer_jabatan'],
                'bio' => $row['signer_bio'],
                'foto_url' => $row['signer_foto']
            ];
            $document['signers'][] = $signer;
            $document['signer_names'][] = $row['signer_nama'];
        }
    }
    
    // Get document files
    $fileQuery = "SELECT * FROM document_files WHERE document_id = :document_id ORDER BY id ASC";
    $fileStmt = $db->prepare($fileQuery);
    $fileStmt->bindParam(':document_id', $document['id'], PDO::PARAM_INT);
    $fileStmt->execute();
    $files = $fileStmt->fetchAll();
    
    $document['files'] = $files;
    
    // Return successful response
    echo json_encode([
        'success' => true,
        'data' => $document
    ]);
    
} catch (Exception $e) {
    error_log('Verify API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
}
?>