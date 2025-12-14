<?php
/**
 * Endpoint de autenticação (Login)
 * POST /api/auth/login.php
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
    
    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email e senha são obrigatórios']);
        exit;
    }
    
    $email = $data['email'];
    $password = $data['password'];
    
    $pdo = getDBConnection();
    
    // Buscar usuário pelo email
    $stmt = $pdo->prepare("SELECT id, name, email, password, role, avatar FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciais inválidas']);
        exit;
    }
    
    // Remover senha do retorno
    unset($user['password']);
    
    // Criar token JWT simples (em produção, use uma biblioteca JWT adequada)
    $token = base64_encode(json_encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'exp' => time() + (24 * 60 * 60) // 24 horas
    ]));
    
    echo json_encode([
        'success' => true,
        'user' => $user,
        'token' => $token
    ]);
    
} catch (Exception $e) {
    error_log("Erro no login: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao processar login']);
}

