<?php
/**
 * Endpoint para listar usuários
 * GET /api/users/index.php
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
    
    $role = $_GET['role'] ?? null;
    
    $sql = "SELECT id, name, email, role, avatar, created_at FROM users";
    $params = [];
    
    if ($role) {
        $sql .= " WHERE role = ?";
        $params[] = $role;
    }
    
    $sql .= " ORDER BY name ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $users = $stmt->fetchAll();
    
    echo json_encode($users);
    
} catch (Exception $e) {
    error_log("Erro ao listar usuários: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao listar usuários']);
}



