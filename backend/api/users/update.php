<?php
/**
 * Endpoint para atualizar usuário
 * POST /api/users/update.php
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
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }
    
    $pdo = getDBConnection();
    
    // Verificar se usuário existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$data['id']]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuário não encontrado']);
        exit;
    }
    
    // Construir query de atualização
    $fields = [];
    $values = [];
    
    $allowedFields = ['name', 'email', 'role', 'avatar'];
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            if ($field === 'email') {
                // Verificar se email já existe (exceto para o mesmo usuário)
                $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
                $checkStmt->execute([$data['email'], $data['id']]);
                if ($checkStmt->fetch()) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Email já cadastrado']);
                    exit;
                }
            }
            
            $fields[] = "$field = ?";
            $values[] = $data[$field];
        }
    }
    
    // Se senha for fornecida, atualizar
    if (isset($data['password']) && !empty($data['password'])) {
        $fields[] = "password = ?";
        $values[] = password_hash($data['password'], PASSWORD_BCRYPT);
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nenhum campo para atualizar']);
        exit;
    }
    
    $values[] = $data['id'];
    $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    
    // Buscar usuário atualizado (sem senha)
    $stmt = $pdo->prepare("SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?");
    $stmt->execute([$data['id']]);
    $user = $stmt->fetch();
    
    echo json_encode($user);
    
} catch (Exception $e) {
    error_log("Erro ao atualizar usuário: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao atualizar usuário']);
}

