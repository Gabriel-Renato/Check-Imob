<?php
/**
 * Configuração de conexão com o banco de dados MySQL
 */

// Configurações do banco de dados
define('DB_HOST', 'sql102.infinityfree.com');
define('DB_NAME', 'if0_40682654_checkimobi');
define('DB_USER', 'if0_40682654');
define('DB_PASS', 'Ul1yunyufetkj');
define('DB_CHARSET', 'utf8mb4');

/**
 * Cria uma conexão PDO com o banco de dados
 * @return PDO|null
 */
function getDBConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Erro de conexão com o banco de dados: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao conectar com o banco de dados']);
            exit;
        }
    }
    
    return $pdo;
}

