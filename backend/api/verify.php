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
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get document number from query parameter
$nomor_dokumen = isset($_GET['nomor_dokumen']) ? trim($_GET['nomor_dokumen']) : '';

if (empty($nomor_dokumen)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nomor dokumen is required']);
    exit();
}

try {
    // Create database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    
    // Query to get document with signers
    $query = "
        SELECT 
            d.id,
            d.nomor_dokumen,
            d.judul,
            d.file_jpg,
            d.created_at,
            s.id as signer_id,
            s.nama as signer_nama,
            s.jabatan as signer_jabatan
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
        'signers' => []
    ];
    
    // Add signers to document
    foreach ($results as $row) {
        if ($row['signer_id']) {
            $document['signers'][] = [
                'id' => $row['signer_id'],
                'nama' => $row['signer_nama'],
                'jabatan' => $row['signer_jabatan']
            ];
        }
    }
    
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