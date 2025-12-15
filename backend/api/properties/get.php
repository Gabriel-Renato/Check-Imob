<?php
/**
 * Endpoint para obter uma propriedade específica
 * GET /api/properties/get.php?id=1
 */

require_once '../../config/database.php';
require_once '../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

try {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID não fornecido']);
        exit;
    }
    
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("SELECT id, address, unit, building, neighborhood, city, image_url as imageUrl, created_at FROM properties WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    $property = $stmt->fetch();
    
    if (!$property) {
        http_response_code(404);
        echo json_encode(['error' => 'Propriedade não encontrada']);
        exit;
    }
    
    echo json_encode($property);
    
} catch (Exception $e) {
    error_log("Erro ao obter propriedade: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao obter propriedade']);
}



