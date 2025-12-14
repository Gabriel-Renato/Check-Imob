<?php
/**
 * Endpoint para configurações do sistema
 * GET /api/settings/system.php - Obter configurações
 * POST /api/settings/system.php - Atualizar configurações
 */

require_once '../../config/database.php';
require_once '../../config/cors.php';

// Tabela para armazenar configurações (criar se não existir)
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
    // Tabela já existe ou erro ao criar
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $pdo = getDBConnection();
        
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM system_settings");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        // Valores padrão
        $defaults = [
            'system_name' => 'Vistoria Pro',
            'system_version' => '1.0.0'
        ];
        
        $result = array_merge($defaults, $settings);
        
        echo json_encode($result);
        
    } catch (Exception $e) {
        error_log("Erro ao obter configurações: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao obter configurações']);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['key']) || !isset($data['value'])) {
            http_response_code(400);
            echo json_encode(['error' => 'key e value são obrigatórios']);
            exit;
        }
        
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("
            INSERT INTO system_settings (setting_key, setting_value) 
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE setting_value = ?
        ");
        $stmt->execute([$data['key'], $data['value'], $data['value']]);
        
        echo json_encode(['success' => true, 'message' => 'Configuração atualizada']);
        
    } catch (Exception $e) {
        error_log("Erro ao atualizar configuração: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao atualizar configuração']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
}

