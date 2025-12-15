<?php
/**
 * Endpoint para criar usuário
 * POST /api/users/create.php
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
    
    $required = ['name', 'email', 'password', 'role'];
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Campo obrigatório: $field"]);
            exit;
        }
    }
    
    // Validar role
    if (!in_array($data['role'], ['admin', 'corretor'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Role inválida']);
        exit;
    }
    
    // Validar email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email inválido']);
        exit;
    }
    
    $pdo = getDBConnection();
    
    // Verificar se email já existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Email já cadastrado']);
        exit;
    }
    
    // Hash da senha
    $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
    
    // Inserir usuário
    $sql = "INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data['name'],
        $data['email'],
        $hashedPassword,
        $data['role'],
        $data['avatar'] ?? null
    ]);
    
    $id = $pdo->lastInsertId();
    
    // Buscar usuário criado (sem senha)
    $stmt = $pdo->prepare("SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    
    http_response_code(201);
    echo json_encode($user);
    
} catch (Exception $e) {
    error_log("Erro ao criar usuário: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao criar usuário']);
}


