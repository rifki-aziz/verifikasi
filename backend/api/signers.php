<?php
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// helper untuk konversi links_json jadi array of {label, url}
function normalizeLinks($links_json) {
    if (empty($links_json)) {
        return [];
    }

    $decoded = json_decode($links_json, true);
    $links = [];

    if (is_array($decoded)) {
        foreach ($decoded as $item) {
            // kalau item string, jadikan {label, url}
            if (is_string($item)) {
                $links[] = [
                    'label' => ucfirst(parse_url($item, PHP_URL_HOST) ?? 'Link'),
                    'url'   => $item
                ];
            }
            // kalau item sudah berupa {label, url}
            elseif (is_array($item) && isset($item['url'])) {
                $links[] = [
                    'label' => $item['label'] ?? 'Link',
                    'url'   => $item['url']
                ];
            }
        }
    }

    return $links;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // ===== Ambil berdasarkan ID =====
    if (isset($_GET['id'])) {
        $query = "SELECT id, nama, jabatan, foto_url, bio, links_json FROM signers WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$_GET['id']]);
        $signer = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($signer) {
            $signer['links'] = normalizeLinks($signer['links_json']);
            unset($signer['links_json']);
            echo json_encode(['success' => true, 'data' => $signer]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Signer tidak ditemukan']);
        }
        exit();
    }

    // ===== Ambil berdasarkan nama =====
    if (isset($_GET['name'])) {
        $query = "SELECT id, nama, jabatan, foto_url, bio, links_json FROM signers WHERE nama = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$_GET['name']]);
        $signer = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($signer) {
            $signer['links'] = normalizeLinks($signer['links_json']);
            unset($signer['links_json']);
            echo json_encode(['success' => true, 'data' => $signer]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Signer tidak ditemukan']);
        }
        exit();
    }

    // ===== Default: Ambil semua signer =====
    $query = "SELECT id, nama, jabatan, foto_url, bio, links_json FROM signers ORDER BY nama ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $signers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($signers as &$signer) {
        $signer['links'] = normalizeLinks($signer['links_json']);
        unset($signer['links_json']);
    }

    echo json_encode([
        'success' => true,
        'data' => $signers
    ]);

} catch (Exception $e) {
    error_log('Signers API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
