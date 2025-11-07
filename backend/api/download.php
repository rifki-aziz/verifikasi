<?php
// File: backend/api/download.php
// Handle file download securely

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    die('Method not allowed');
}

if (!isset($_GET['file']) || empty($_GET['file'])) {
    http_response_code(400);
    die('File parameter is required');
}

$file = basename($_GET['file']); // Prevent directory traversal
$upload_dir = '../uploads/';
$file_path = $upload_dir . $file;

// Check if file exists
if (!file_exists($file_path) || !is_file($file_path)) {
    http_response_code(404);
    die('File not found');
}

// Get file extension
$file_ext = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));

// Set content type based on extension
$content_types = [
    'pdf' => 'application/pdf',
    'doc' => 'application/msword',
    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif',
];

$content_type = $content_types[$file_ext] ?? 'application/octet-stream';

// Security headers
header('Content-Type: ' . $content_type);
header('Content-Disposition: attachment; filename="' . $file . '"');
header('Content-Length: ' . filesize($file_path));
header('Cache-Control: no-cache, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('X-Content-Type-Options: nosniff');

// Clear output buffer
if (ob_get_level()) {
    ob_end_clean();
}

// Read and output file
readfile($file_path);
exit();
