<?php
/**
 * Endpoint para atualizar propriedade
 * POST /api/properties/update.php
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
    
    // Construir query de atualização
    $fields = [];
    $values = [];
    
    $allowedFields = ['address', 'unit', 'building', 'neighborhood', 'city', 'image_url'];
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $values[] = $data[$field];
        }
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nenhum campo para atualizar']);
        exit;
    }
    
    $values[] = $data['id'];
    $sql = "UPDATE properties SET " . implode(', ', $fields) . " WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    
    // Buscar propriedade atualizada
    $stmt = $pdo->prepare("SELECT id, address, unit, building, neighborhood, city, image_url as imageUrl, created_at FROM properties WHERE id = ?");
    $stmt->execute([$data['id']]);
    $property = $stmt->fetch();
    
    echo json_encode($property);
    
} catch (Exception $e) {
    error_log("Erro ao atualizar propriedade: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao atualizar propriedade']);
}



