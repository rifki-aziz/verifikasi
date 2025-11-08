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
            GROUP_CONCAT(DISTINCT s.id) as signer_ids,
            GROUP_CONCAT(DISTINCT CONCAT(s.id, ':', s.nama, ':', COALESCE(s.jabatan, '')) SEPARATOR '|') as signer_details
        FROM documents d
        LEFT JOIN document_signers ds ON d.id = ds.document_id
        LEFT JOIN signers s ON ds.signer_id = s.id
        GROUP BY d.id
        ORDER BY d.created_at DESC
    ";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get files for each document
    $filesQuery = "SELECT document_id, file_name, file_path FROM document_files WHERE document_id IN (" . 
                  implode(',', array_map(fn($doc) => $doc['id'], $documents)) . ")";
    
    if (!empty($documents)) {
        $filesStmt = $db->prepare($filesQuery);
        $filesStmt->execute();
        $allFiles = $filesStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Group files by document_id
        $filesByDoc = [];
        foreach ($allFiles as $file) {
            $filesByDoc[$file['document_id']][] = [
                'id' => count($filesByDoc[$file['document_id']] ?? []),
                'document_id' => $file['document_id'],
                'file_name' => $file['file_name'],
                'file_path' => $file['file_path']
            ];
        }
    } else {
        $filesByDoc = [];
    }

    // Process documents
    $processedDocs = [];
    foreach ($documents as $doc) {
        // Process signers
        $signers = [];
        if (!empty($doc['signer_details'])) {
            $signerParts = explode('|', $doc['signer_details']);
            foreach ($signerParts as $part) {
                $details = explode(':', $part);
                if (count($details) >= 2) {
                    $signers[] = [
                        'id' => intval($details[0]),
                        'nama' => $details[1],
                        'jabatan' => $details[2] ?? null
                    ];
                }
            }
        }

        // Process signer names
        $signerNames = [];
        if (!empty($doc['signer_names'])) {
            $signerNames = array_map('trim', explode(',', $doc['signer_names']));
        }

        // Get files for this document
        $docFiles = $filesByDoc[$doc['id']] ?? [];

        $processedDocs[] = [
            'id' => intval($doc['id']),
            'nomor_dokumen' => $doc['nomor_dokumen'],
            'judul' => $doc['judul'],
            'file_jpg' => $doc['file_jpg'],
            'created_at' => $doc['created_at'],
            'signer_names' => $signerNames,
            'signers' => $signers,
            'files' => $docFiles
        ];
    }

    echo json_encode(['success' => true, 'data' => $processedDocs]);

} catch (Exception $e) {
    error_log('get_documents.php error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>