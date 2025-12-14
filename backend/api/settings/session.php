<?php
/**
 * Endpoint para configurações de sessão
 * GET /api/settings/session.php - Obter duração da sessão
 * POST /api/settings/session.php - Atualizar duração da sessão
 */

require_once '../../config/database.php';
require_once '../../config/cors.php';

// Garantir que a tabela existe
try {
    $pdo = getDBConnection();
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS system_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) NOT NULL UNIQUE,
            setting_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
} catch (PDOException $e) {
    // Tabela já existe
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("SELECT setting_value FROM system_settings WHERE setting_key = ?");
        $stmt->execute(['session_duration_hours']);
        $result = $stmt->fetchColumn();
        
        $duration = $result ? (int)$result : 24;
        
        echo json_encode([
            'duration_hours' => $duration,
            'description' => "{$duration} horas"
        ]);
        
    } catch (Exception $e) {
        error_log("Erro ao obter duração: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao obter duração']);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['duration_hours']) || !is_numeric($data['duration_hours'])) {
            http_response_code(400);
            echo json_encode(['error' => 'duration_hours é obrigatório e deve ser numérico']);
            exit;
        }
        
        $duration = (int)$data['duration_hours'];
        
        if ($duration < 1 || $duration > 168) {
            http_response_code(400);
            echo json_encode(['error' => 'duration_hours deve estar entre 1 e 168 (7 dias)']);
            exit;
        }
        
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("
            INSERT INTO system_settings (setting_key, setting_value) 
            VALUES ('session_duration_hours', ?)
            ON DUPLICATE KEY UPDATE setting_value = ?
        ");
        $stmt->execute([$duration, $duration]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Duração da sessão atualizada',
            'duration_hours' => $duration
        ]);
        
    } catch (Exception $e) {
        error_log("Erro ao atualizar duração: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao atualizar duração']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
}

