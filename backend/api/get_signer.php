<?php
// File: backend/api/get_signer.php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php'; // otomatis ada $pdo

function fail($msg, $code = 400) {
  http_response_code($code);
  echo json_encode(['success' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  if (!$pdo || !($pdo instanceof PDO)) {
    fail('Koneksi database tidak tersedia.', 500);
  }

  // Helper: cek apakah kolom ada di tabel
  function columnExists(PDO $pdo, string $table, string $column): bool {
    $stmt = $pdo->prepare("
      SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t AND COLUMN_NAME = :c
    ");
    $stmt->execute([':t' => $table, ':c' => $column]);
    return (int)$stmt->fetchColumn() > 0;
  }

  $table = 'signers';
  $hasPhoto = columnExists($pdo, $table, 'photo');
  $hasBio   = columnExists($pdo, $table, 'bio');
  $hasLinks = columnExists($pdo, $table, 'links_json');

  // Build select list dinamis
  $select = "id, nama, jabatan";
  if ($hasPhoto) $select .= ", photo";
  if ($hasBio)   $select .= ", COALESCE(bio, '') AS bio";
  if ($hasLinks) $select .= ", COALESCE(links_json, '') AS links_json";

  // Params
  $id   = isset($_GET['id'])   ? trim($_GET['id'])   : null;
  $name = isset($_GET['name']) ? trim($_GET['name']) : null;

  if ($id === null && $name === null) {
    fail('Parameter id atau name wajib diisi. Contoh: get_signer.php?id=1 atau get_signer.php?name=Fulan');
  }

  if ($id !== null) {
    if (!ctype_digit($id)) fail('Parameter id tidak valid.');
    $stmt = $pdo->prepare("SELECT $select FROM {$table} WHERE id = :id LIMIT 1");
    $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
  } else {
    $stmt = $pdo->prepare("SELECT $select FROM {$table} WHERE nama = :name LIMIT 1");
    $stmt->bindValue(':name', $name, PDO::PARAM_STR);
  }

  $stmt->execute();
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$row) {
    echo json_encode(['success' => false, 'error' => 'Penandatangan tidak ditemukan.'], JSON_UNESCAPED_UNICODE);
    exit;
  }

  // Siapkan payload
  $data = [
    'id'      => (int)$row['id'],
    'nama'    => $row['nama'],
    'jabatan' => $row['jabatan'],
  ];

  // Photo & URL absolut
  if ($hasPhoto) {
    $data['photo'] = $row['photo'];
    if (!empty($row['photo'])) {
      $scheme   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
      $host     = $_SERVER['HTTP_HOST'];
      $basePath = rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'])), '/');

      $data['foto_url'] = $scheme . '://' . $host . $basePath . '/uploads/signers/' . $row['photo'];
    } else {
      $data['foto_url'] = null;
    }
  }

  if ($hasBio) {
    $data['bio'] = $row['bio'];
  }

  if ($hasLinks) {
    $links = [];
    if (!empty($row['links_json'])) {
      $decoded = json_decode($row['links_json'], true);
      if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        $links = $decoded;
      }
    }
    $data['links'] = $links;
  }

  echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
}
