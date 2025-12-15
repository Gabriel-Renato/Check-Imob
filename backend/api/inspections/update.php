<?php
/**
 * Endpoint para atualizar uma vistoria
 * PUT /api/inspections/update.php
 */

require_once '../../config/database.php';
require_once '../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID não fornecido']);
        exit;
    }
    
    $pdo = getDBConnection();
    
    // Atualizar vistoria
    if (isset($data['status'])) {
        $sql = "UPDATE inspections SET status = ?";
        $params = [$data['status']];
        
        if ($data['status'] === 'completed') {
            $sql .= ", completed_at = NOW()";
        }
        
        $sql .= " WHERE id = ?";
        $params[] = $data['id'];
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }
    
    // Atualizar cards
    if (isset($data['cards']) && is_array($data['cards'])) {
        foreach ($data['cards'] as $cardData) {
            // Verificar se já existe
            $stmt = $pdo->prepare("SELECT id FROM card_inspections WHERE inspection_id = ? AND card_id = ?");
            $stmt->execute([$data['id'], $cardData['cardId']]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                // Atualizar
                $stmt = $pdo->prepare("
                    UPDATE card_inspections 
                    SET status = ?, observation = ?
                    WHERE id = ?
                ");
                $stmt->execute([
                    $cardData['status'] ?? null,
                    $cardData['observation'] ?? null,
                    $existing['id']
                ]);
            } else {
                // Criar
                $stmt = $pdo->prepare("
                    INSERT INTO card_inspections (inspection_id, card_id, status, observation)
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([
                    $data['id'],
                    $cardData['cardId'],
                    $cardData['status'] ?? null,
                    $cardData['observation'] ?? null
                ]);
            }
        }
    }
    
    // Buscar vistoria atualizada
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
    $stmt->execute([$data['id']]);
    $inspection = $stmt->fetch();
    
    // Buscar cards
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
    
    // Buscar fotos
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
    error_log("Erro ao atualizar vistoria: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao atualizar vistoria']);
}


