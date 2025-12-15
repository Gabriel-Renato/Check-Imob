<?php
/**
 * Endpoint para verificar token de autenticação
 * POST /api/auth/verify.php
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
    
    if (!isset($data['token'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Token não fornecido']);
        exit;
    }
    
    $tokenData = json_decode(base64_decode($data['token']), true);
    
    if (!$tokenData || !isset($tokenData['id']) || !isset($tokenData['exp'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Token inválido']);
        exit;
    }
    
    // Verificar expiração
    if ($tokenData['exp'] < time()) {
        http_response_code(401);
        echo json_encode(['error' => 'Token expirado']);
        exit;
    }
    
    $pdo = getDBConnection();
    
    // Buscar usuário
    $stmt = $pdo->prepare("SELECT id, name, email, role, avatar FROM users WHERE id = ?");
    $stmt->execute([$tokenData['id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Usuário não encontrado']);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
    
} catch (Exception $e) {
    error_log("Erro na verificação: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao verificar token']);
}



