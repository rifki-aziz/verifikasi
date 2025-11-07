<?php
include 'config.php';

// Base URL untuk akses file (ubah sesuai kebutuhan)
$baseUrl = "http://localhost/backend/";

// Periksa apakah ID dokumen diberikan
if (!isset($_GET['id'])) {
    echo json_encode(['success' => false, 'error' => 'Document ID not provided.']);
    exit();
}

$id = $_GET['id'];

// Ambil data dokumen dari tabel dokumen
$stmt = $conn->prepare("SELECT * FROM documents WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $document = $result->fetch_assoc();

    // 🔗 Ubah file_path jadi URL (jika ada)
    if (!empty($document['file_path'])) {
        $document['file_url'] = $baseUrl . $document['file_path'];
    } else {
        $document['file_url'] = null;
    }

    // Ambil penandatangan terkait
    $stmt_signers = $conn->prepare("
        SELECT s.id, s.nama, s.jabatan
        FROM document_signers ds
        JOIN signers s ON ds.signer_id = s.id
        WHERE ds.document_id = ?
    ");
    $stmt_signers->bind_param("i", $id);
    $stmt_signers->execute();
    $signers_result = $stmt_signers->get_result();

    $signers = [];
    $signer_names = [];
    while ($row = $signers_result->fetch_assoc()) {
        $signers[] = $row;
        $signer_names[] = $row['nama'];
    }

    $document['signers'] = $signers;
    $document['signer_names'] = implode(', ', $signer_names);

    echo json_encode(['success' => true, 'data' => $document]);
} else {
    echo json_encode(['success' => false, 'error' => 'Document not found.']);
}

$stmt->close();
$stmt_signers->close();
$conn->close();
?>
