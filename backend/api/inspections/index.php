<?php
/**
 * Endpoint para listar e criar vistorias
 * GET /api/inspections/index.php?corretor_id=1
 * POST /api/inspections/index.php - Criar nova vistoria
 */

require_once '../../config/database.php';
require_once '../../config/cors.php';

$pdo = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $corretorId = $_GET['corretor_id'] ?? null;
        
        $sql = "SELECT 
                    i.id, 
                    i.property_id as propertyId, 
                    i.corretor_id as corretorId,
                    u.name as corretorName,
                    u.email as corretorEmail,
                    i.scheduled_date as scheduledDate,
                    i.scheduled_time as scheduledTime,
                    i.status,
                    i.completed_at as completedAt,
                    i.created_at as createdAt
                FROM inspections i
                LEFT JOIN users u ON i.corretor_id = u.id";
        
        $params = [];
        if ($corretorId) {
            $sql .= " WHERE i.corretor_id = ?";
            $params[] = $corretorId;
        }
        
        $sql .= " ORDER BY i.scheduled_date DESC, i.scheduled_time DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $inspections = $stmt->fetchAll();
        
        // Buscar cards de cada vistoria
        foreach ($inspections as &$inspection) {
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
        }
        
        echo json_encode($inspections);
        
    } catch (Exception $e) {
        error_log("Erro ao listar vistorias: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao listar vistorias']);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $required = ['property_id', 'corretor_id', 'scheduled_date', 'scheduled_time'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Campo obrigatório: $field"]);
                exit;
            }
        }
        
        $sql = "INSERT INTO inspections (property_id, corretor_id, scheduled_date, scheduled_time, status) 
                VALUES (?, ?, ?, ?, 'pending')";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['property_id'],
            $data['corretor_id'],
            $data['scheduled_date'],
            $data['scheduled_time']
        ]);
        
        $id = $pdo->lastInsertId();
        
        // Buscar vistoria criada
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
        $stmt->execute([$id]);
        $inspection = $stmt->fetch();
        $inspection['cards'] = [];
        
        http_response_code(201);
        echo json_encode($inspection);
        
    } catch (Exception $e) {
        error_log("Erro ao criar vistoria: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar vistoria']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
}

