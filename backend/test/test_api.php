<?php
// Simple API test script
// Run this file to test your API endpoints

echo "<h1>Document Verification API Test</h1>";

// Test database connection
echo "<h2>1. Testing Database Connection</h2>";
require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo "<p style='color: green;'>✓ Database connection successful</p>";
        
        // Test tables exist
        $tables = ['documents', 'signers', 'document_signers'];
        foreach ($tables as $table) {
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM $table");
            $stmt->execute();
            $result = $stmt->fetch();
            echo "<p style='color: green;'>✓ Table '$table' exists with {$result['count']} records</p>";
        }
    } else {
        echo "<p style='color: red;'>✗ Database connection failed</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Database error: " . $e->getMessage() . "</p>";
}

// Test API endpoints
echo "<h2>2. Testing API Endpoints</h2>";

$base_url = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']);

// Test signers endpoint
echo "<h3>Testing Signers API</h3>";
$signers_url = $base_url . '/../api/signers.php';
$signers_response = @file_get_contents($signers_url);

if ($signers_response) {
    $signers_data = json_decode($signers_response, true);
    if ($signers_data && $signers_data['success']) {
        echo "<p style='color: green;'>✓ Signers API working - " . count($signers_data['data']) . " signers found</p>";
    } else {
        echo "<p style='color: red;'>✗ Signers API error: " . ($signers_data['error'] ?? 'Unknown error') . "</p>";
    }
} else {
    echo "<p style='color: red;'>✗ Cannot connect to Signers API</p>";
}

// Test verify endpoint with sample document
echo "<h3>Testing Verify API</h3>";
$verify_url = $base_url . '/../api/verify.php?nomor_dokumen=DOC001/2024';
$verify_response = @file_get_contents($verify_url);

if ($verify_response) {
    $verify_data = json_decode($verify_response, true);
    if ($verify_data && $verify_data['success']) {
        echo "<p style='color: green;'>✓ Verify API working - Document found: " . $verify_data['data']['judul'] . "</p>";
    } else {
        echo "<p style='color: orange;'>⚠ Verify API working but document not found (this is normal if no sample data)</p>";
    }
} else {
    echo "<p style='color: red;'>✗ Cannot connect to Verify API</p>";
}

// Test file upload directory
echo "<h2>3. Testing File Upload</h2>";
$upload_dir = '../uploads/';

if (is_dir($upload_dir)) {
    if (is_writable($upload_dir)) {
        echo "<p style='color: green;'>✓ Upload directory exists and is writable</p>";
    } else {
        echo "<p style='color: red;'>✗ Upload directory exists but is not writable</p>";
        echo "<p>Run: chmod 755 " . realpath($upload_dir) . "</p>";
    }
} else {
    echo "<p style='color: red;'>✗ Upload directory does not exist</p>";
    echo "<p>Creating upload directory...</p>";
    if (mkdir($upload_dir, 0755, true)) {
        echo "<p style='color: green;'>✓ Upload directory created</p>";
    } else {
        echo "<p style='color: red;'>✗ Failed to create upload directory</p>";
    }
}

// Test .htaccess files
echo "<h2>4. Testing Security</h2>";

$htaccess_files = [
    '../.htaccess' => 'Main .htaccess',
    '../uploads/.htaccess' => 'Uploads .htaccess'
];

foreach ($htaccess_files as $file => $name) {
    if (file_exists($file)) {
        echo "<p style='color: green;'>✓ $name exists</p>";
    } else {
        echo "<p style='color: red;'>✗ $name missing</p>";
    }
}

echo "<h2>5. Configuration Check</h2>";

// Check PHP settings
$php_settings = [
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'max_execution_time' => ini_get('max_execution_time'),
    'memory_limit' => ini_get('memory_limit')
];

foreach ($php_settings as $setting => $value) {
    echo "<p>$setting: <strong>$value</strong></p>";
}

echo "<hr>";
echo "<p><strong>Test completed!</strong> Check the results above and fix any issues marked with ✗</p>";
echo "<p>If all tests pass, your API is ready to use.</p>";
?>