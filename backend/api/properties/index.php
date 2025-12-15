<?php
/**
 * Endpoint para listar propriedades
 * GET /api/properties/index.php
 * POST /api/properties/index.php - Criar nova propriedade
 */

require_once '../../config/database.php';
require_once '../../config/cors.php';

$pdo = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $sql = "SELECT id, address, unit, building, neighborhood, city, image_url as imageUrl, created_at 
                FROM properties 
                ORDER BY created_at DESC";
        
        $stmt = $pdo->query($sql);
        $properties = $stmt->fetchAll();
        
        echo json_encode($properties);
        
    } catch (Exception $e) {
        error_log("Erro ao listar propriedades: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao listar propriedades']);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $required = ['address', 'unit', 'neighborhood', 'city'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Campo obrigatório: $field"]);
                exit;
            }
        }
        
        $sql = "INSERT INTO properties (address, unit, building, neighborhood, city, image_url) 
                VALUES (?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['address'],
            $data['unit'],
            $data['building'] ?? null,
            $data['neighborhood'],
            $data['city'],
            $data['imageUrl'] ?? null
        ]);
        
        $id = $pdo->lastInsertId();
        
        // Buscar propriedade criada
        $stmt = $pdo->prepare("SELECT id, address, unit, building, neighborhood, city, image_url as imageUrl, created_at FROM properties WHERE id = ?");
        $stmt->execute([$id]);
        $property = $stmt->fetch();
        
        http_response_code(201);
        echo json_encode($property);
        
    } catch (Exception $e) {
        error_log("Erro ao criar propriedade: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar propriedade']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
}


