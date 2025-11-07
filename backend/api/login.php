<?php

// Handle preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Konfigurasi Database (ubah sesuai cPanel)
$servername   = "localhost";
$username_db  = "root";   // Ganti dengan user database dari cPanel
$password_db  = "";     // Ganti dengan password user DB
$dbname       = "n1582978_surat_db"; // Ganti dengan nama database

$conn = new mysqli($servername, $username_db, $password_db, $dbname);

// Cek koneksi
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Koneksi database gagal"]);
    exit();
}

// 2. Ambil data JSON dari frontend
$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

// Validasi input
if (empty($username) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Username dan password harus diisi"]);
    exit();
}

// 3. Cek user di DB
$stmt = $conn->prepare("SELECT password FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $hashed_password = $row['password'];

    if (password_verify($password, $hashed_password)) {
        echo json_encode(["success" => true, "message" => "Login berhasil!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Username atau password salah"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Username atau password salah"]);
}

$stmt->close();
$conn->close();
