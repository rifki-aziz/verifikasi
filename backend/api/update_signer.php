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

if (empty($_POST['id']) || empty($_POST['nama'])) {
    echo json_encode(['success' => false, 'error' => 'ID dan Nama wajib diisi']);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $id      = $_POST['id'];
    $nama    = $_POST['nama'];
    $jabatan = $_POST['jabatan'] ?? null;
    $bio     = $_POST['bio'] ?? null;
    $links   = isset($_POST['links']) ? $_POST['links'] : null;

    // --- Handle upload foto ---
    $foto_url = $_POST['foto_url'] ?? null; // default lama
    if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../uploads/signers/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $ext = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION);
        $filename = 'signer_' . time() . '_' . uniqid() . '.' . $ext;
        $filePath = $uploadDir . $filename;

        if (move_uploaded_file($_FILES['foto']['tmp_name'], $filePath)) {
            $foto_url = 'uploads/signers/' . $filename;
        }
    }

    // --- Simpan ke DB ---
    $query = "UPDATE signers 
              SET nama = :nama, jabatan = :jabatan, bio = :bio, foto_url = :foto_url, links_json = :links_json 
              WHERE id = :id";
    $stmt = $db->prepare($query);

    $links_json = $links ? json_encode($links) : null;

    $stmt->execute([
        ':id'        => $id,
        ':nama'      => $nama,
        ':jabatan'   => $jabatan,
        ':bio'       => $bio,
        ':foto_url'  => $foto_url,
        ':links_json'=> $links_json
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Signer berhasil diperbarui',
        'foto_url' => $foto_url
    ]);
} catch (Exception $e) {
    error_log('Update Signer Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
