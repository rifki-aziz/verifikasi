<?php
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['id'])) {
    echo json_encode(['success' => false, 'error' => 'ID signer wajib dikirim']);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // hapus signer berdasarkan ID
    $query = "DELETE FROM signers WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->execute([':id' => $data['id']]);

    echo json_encode(['success' => true, 'message' => 'Signer berhasil dihapus']);
} catch (Exception $e) {
    error_log('Delete Signer Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
