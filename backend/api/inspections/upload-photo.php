<?php
/**
 * Endpoint para upload de fotos
 * POST /api/inspections/upload-photo.php
 */

require_once '../../config/database.php';
require_once '../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

try {
    if (!isset($_POST['inspection_id']) || !isset($_POST['card_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'inspection_id e card_id são obrigatórios']);
        exit;
    }
    
    if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Nenhuma foto enviada']);
        exit;
    }
    
    $pdo = getDBConnection();
    
    $inspectionId = $_POST['inspection_id'];
    $cardId = $_POST['card_id'];
    $file = $_FILES['photo'];
    
    // Verificar se card_inspection existe, se não, criar
    $stmt = $pdo->prepare("SELECT id FROM card_inspections WHERE inspection_id = ? AND card_id = ?");
    $stmt->execute([$inspectionId, $cardId]);
    $cardInspection = $stmt->fetch();
    
    if (!$cardInspection) {
        $stmt = $pdo->prepare("INSERT INTO card_inspections (inspection_id, card_id) VALUES (?, ?)");
        $stmt->execute([$inspectionId, $cardId]);
        $cardInspectionId = $pdo->lastInsertId();
    } else {
        $cardInspectionId = $cardInspection['id'];
    }
    
    // Criar diretório de uploads se não existir
    $uploadDir = __DIR__ . '/../../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Gerar nome único para o arquivo
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = uniqid('photo_') . '_' . time() . '.' . $extension;
    $filePath = $uploadDir . $fileName;
    
    // Mover arquivo
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao salvar arquivo']);
        exit;
    }
    
    // Salvar no banco
    $stmt = $pdo->prepare("
        INSERT INTO inspection_photos (card_inspection_id, file_path, file_name, file_size, mime_type)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $cardInspectionId,
        $filePath,
        $fileName,
        $file['size'],
        $file['type']
    ]);
    
    $photoId = $pdo->lastInsertId();
    
    // Retornar URL relativa ao backend
    // Assumindo que o backend está em /backend
    echo json_encode([
        'id' => (string)$photoId,
        'url' => '/backend/uploads/' . $fileName,
        'fileName' => $fileName
    ]);
    
} catch (Exception $e) {
    error_log("Erro no upload: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao fazer upload da foto']);
}

