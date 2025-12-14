<?php
/**
 * Endpoint para logs de acesso
 * GET /api/settings/logs.php - Listar logs
 */

require_once '../../config/database.php';
require_once '../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

try {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $limit = min($limit, 200); // Máximo 200
    
    // Criar tabela de logs se não existir
    $pdo = getDBConnection();
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS access_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                email VARCHAR(255) NULL,
                action VARCHAR(100) NOT NULL,
                ip_address VARCHAR(45) NULL,
                user_agent TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user (user_id),
                INDEX idx_email (email),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    } catch (PDOException $e) {
        // Tabela já existe
    }
    
    $stmt = $pdo->prepare("
        SELECT 
            al.id,
            al.user_id,
            al.email,
            al.action,
            al.ip_address,
            al.created_at,
            u.name as user_name
        FROM access_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT ?
    ");
    $stmt->execute([$limit]);
    $logs = $stmt->fetchAll();
    
    // Estatísticas
    $stats = [
        'total' => $pdo->query("SELECT COUNT(*) FROM access_logs")->fetchColumn(),
        'today' => $pdo->query("SELECT COUNT(*) FROM access_logs WHERE DATE(created_at) = CURDATE()")->fetchColumn(),
        'last_7_days' => $pdo->query("SELECT COUNT(*) FROM access_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetchColumn()
    ];
    
    echo json_encode([
        'logs' => $logs,
        'stats' => $stats
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao obter logs: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao obter logs']);
}

