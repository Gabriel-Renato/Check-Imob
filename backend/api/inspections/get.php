<?php
/**
 * Endpoint para obter uma vistoria específica
 * GET /api/inspections/get.php?id=1
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
    
    $stmt = $pdo->prepare("
        SELECT 
            id, 
            property_id as propertyId, 
            corretor_id as corretorId,
            scheduled_date as scheduledDate,
            scheduled_time as scheduledTime,
            status,
            completed_at as completedAt,
            created_at as createdAt
        FROM inspections 
        WHERE id = ?
    ");
    $stmt->execute([$_GET['id']]);
    $inspection = $stmt->fetch();
    
    if (!$inspection) {
        http_response_code(404);
        echo json_encode(['error' => 'Vistoria não encontrada']);
        exit;
    }
    
    // Buscar cards da vistoria
    $stmt = $pdo->prepare("
        SELECT 
            ci.card_id as cardId,
            ci.status,
            ci.observation
        FROM card_inspections ci
        WHERE ci.inspection_id = ?
    ");
    $stmt->execute([$inspection['id']]);
    $cards = $stmt->fetchAll();
    
    // Buscar fotos de cada card
    foreach ($cards as &$card) {
        $stmt = $pdo->prepare("
            SELECT 
                ip.id,
                CONCAT('/backend/uploads/', ip.file_name) as url
            FROM inspection_photos ip
            INNER JOIN card_inspections ci ON ip.card_inspection_id = ci.id
            WHERE ci.inspection_id = ? AND ci.card_id = ?
        ");
        $stmt->execute([$inspection['id'], $card['cardId']]);
        $photos = $stmt->fetchAll();
        $card['photos'] = $photos;
    }
    
    $inspection['cards'] = $cards;
    
    echo json_encode($inspection);
    
} catch (Exception $e) {
    error_log("Erro ao obter vistoria: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao obter vistoria']);
}



