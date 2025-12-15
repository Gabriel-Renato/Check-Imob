<?php
/**
 * Endpoint para política de senha
 * GET /api/settings/password-policy.php - Obter política
 * POST /api/settings/password-policy.php - Atualizar política
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
        $stmt->execute(['password_min_length']);
        $result = $stmt->fetchColumn();
        
        $minLength = $result ? (int)$result : 8;
        
        echo json_encode([
            'min_length' => $minLength,
            'description' => "Mínimo {$minLength} caracteres"
        ]);
        
    } catch (Exception $e) {
        error_log("Erro ao obter política: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao obter política']);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['min_length']) || !is_numeric($data['min_length'])) {
            http_response_code(400);
            echo json_encode(['error' => 'min_length é obrigatório e deve ser numérico']);
            exit;
        }
        
        $minLength = (int)$data['min_length'];
        
        if ($minLength < 4 || $minLength > 32) {
            http_response_code(400);
            echo json_encode(['error' => 'min_length deve estar entre 4 e 32']);
            exit;
        }
        
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("
            INSERT INTO system_settings (setting_key, setting_value) 
            VALUES ('password_min_length', ?)
            ON DUPLICATE KEY UPDATE setting_value = ?
        ");
        $stmt->execute([$minLength, $minLength]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Política de senha atualizada',
            'min_length' => $minLength
        ]);
        
    } catch (Exception $e) {
        error_log("Erro ao atualizar política: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao atualizar política']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
}


