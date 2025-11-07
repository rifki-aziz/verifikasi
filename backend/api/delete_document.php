<?php


// CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 🔗 arahkan ke config/database.php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$conn = $database->getConnection();

if ($conn === null) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed.']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

$id = null;

// Ambil ID sesuai method
if ($method === 'DELETE' || $method === 'POST') {
    if (isset($data['id'])) {
        $id = (int) $data['id'];
    }
} elseif ($method === 'GET') {
    if (isset($_GET['id'])) {
        $id = (int) $_GET['id'];
    }
}

if (!$id) {
    echo json_encode(['success' => false, 'error' => 'Document ID not provided.']);
    exit();
}

try {
    $conn->beginTransaction();

    // 1. Hapus relasi di document_signers
    $stmt_signers = $conn->prepare("DELETE FROM document_signers WHERE document_id = :id");
    $stmt_signers->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt_signers->execute();

    // 2. Hapus dokumen di documents
    $stmt_documents = $conn->prepare("DELETE FROM documents WHERE id = :id");
    $stmt_documents->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt_documents->execute();

    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'Document deleted successfully.']);
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode([
        'success' => false,
        'error' => 'Failed to delete document. ' . $e->getMessage()
    ]);
}
