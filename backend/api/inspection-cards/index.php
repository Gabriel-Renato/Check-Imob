<?php
/**
 * Endpoint para listar cartas de vistoria
 * GET /api/inspection-cards/index.php
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
    
    $stmt = $pdo->query("SELECT id, name, icon, `order` FROM inspection_cards ORDER BY `order` ASC");
    $cards = $stmt->fetchAll();
    
    echo json_encode($cards);
    
} catch (Exception $e) {
    error_log("Erro ao listar cartas: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao listar cartas']);
}


