<?php
/**
 * Endpoint para estatísticas do dashboard
 * GET /api/dashboard/stats.php
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
    
    // Total de vistorias
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM inspections");
    $totalInspections = $stmt->fetch()['total'];
    
    // Vistorias pendentes
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM inspections WHERE status = 'pending'");
    $pendingInspections = $stmt->fetch()['total'];
    
    // Vistorias concluídas
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM inspections WHERE status = 'completed'");
    $completedInspections = $stmt->fetch()['total'];
    
    // Total de propriedades
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM properties");
    $propertiesCount = $stmt->fetch()['total'];
    
    // Total de corretores
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE role = 'corretor'");
    $corretoresCount = $stmt->fetch()['total'];
    
    echo json_encode([
        'totalInspections' => (int)$totalInspections,
        'pendingInspections' => (int)$pendingInspections,
        'completedInspections' => (int)$completedInspections,
        'propertiesCount' => (int)$propertiesCount,
        'corretoresCount' => (int)$corretoresCount
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao obter estatísticas: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao obter estatísticas']);
}


