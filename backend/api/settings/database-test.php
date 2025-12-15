<?php
/**
 * Endpoint para testar conexão do banco de dados
 * GET /api/settings/database-test.php
 */

require_once '../../config/database.php';
require_once '../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Testar conexão executando uma query simples
    $stmt = $pdo->query("SELECT 1");
    $result = $stmt->fetch();
    
    // Obter informações do banco
    $version = $pdo->query("SELECT VERSION()")->fetchColumn();
    
    // Contar tabelas
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        'success' => true,
        'status' => 'Conectado',
        'version' => $version,
        'tables_count' => count($tables),
        'database' => DB_NAME
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'status' => 'Erro',
        'error' => $e->getMessage()
    ]);
}


