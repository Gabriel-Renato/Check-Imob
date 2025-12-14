<?php
/**
 * Endpoint para deletar propriedade
 * POST /api/properties/delete.php
 */

require_once '../../config/database.php';
require_once '../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }
    
    $pdo = getDBConnection();
    
    // Verificar se propriedade existe
    $stmt = $pdo->prepare("SELECT id FROM properties WHERE id = ?");
    $stmt->execute([$data['id']]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Propriedade não encontrada']);
        exit;
    }
    
    // Verificar se há vistorias associadas
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM inspections WHERE property_id = ?");
    $stmt->execute([$data['id']]);
    $count = $stmt->fetchColumn();
    
    if ($count > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Não é possível excluir propriedade com vistorias associadas']);
        exit;
    }
    
    // Deletar propriedade
    $stmt = $pdo->prepare("DELETE FROM properties WHERE id = ?");
    $stmt->execute([$data['id']]);
    
    echo json_encode(['success' => true, 'message' => 'Propriedade excluída com sucesso']);
    
} catch (Exception $e) {
    error_log("Erro ao deletar propriedade: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao deletar propriedade']);
}

