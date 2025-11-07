<?php
// Database configuration (ISI sesuai hosting kamu)
define('DB_HOST', 'localhost');                // contoh: 'localhost' atau '127.0.0.1'
define('DB_NAME', 'n1582978_surat_db');        // nama database
define('DB_USER', 'root');             // JANGAN pakai root di produksi
define('DB_PASS', ''); // password kuat

class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                // PDO::ATTR_PERSISTENT      => true, // opsional: koneksi persistent
            ];
            $pdo = new PDO($dsn, $this->username, $this->password, $options);

            // Opsional: set timezone & mode SQL biar konsisten
            $pdo->exec("SET time_zone = '+07:00'");
            // $pdo->exec("SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'");

            $this->conn = $pdo;
        } catch (PDOException $e) {
            // Jangan echo error ke output; simpan di log
            error_log("DB connection error: " . $e->getMessage());
            return null;
        }
        return $this->conn;
    }
}
