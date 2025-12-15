<?php
/**
 * Endpoint para criar backup do banco de dados
 * POST /api/settings/backup.php
 */

require_once '../../config/database.php';
require_once '../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Criar diretório de backups se não existir
    $backupDir = __DIR__ . '/../../backups/';
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    $backupFile = $backupDir . 'backup_' . date('Y-m-d_His') . '.sql';
    
    // Exportar estrutura e dados
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    $output = "-- Backup gerado em " . date('Y-m-d H:i:s') . "\n";
    $output .= "-- Database: " . DB_NAME . "\n\n";
    $output .= "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n";
    $output .= "SET time_zone = \"+00:00\";\n\n";
    
    foreach ($tables as $table) {
        // Estrutura da tabela
        $createTable = $pdo->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_ASSOC);
        $output .= "\n-- Estrutura da tabela `$table`\n";
        $output .= "DROP TABLE IF EXISTS `$table`;\n";
        $output .= $createTable['Create Table'] . ";\n\n";
        
        // Dados da tabela
        $rows = $pdo->query("SELECT * FROM `$table`")->fetchAll(PDO::FETCH_ASSOC);
        if (count($rows) > 0) {
            $output .= "-- Dados da tabela `$table`\n";
            $columns = array_keys($rows[0]);
            
            foreach ($rows as $row) {
                $values = array_map(function($val) use ($pdo) {
                    return $val === null ? 'NULL' : $pdo->quote($val);
                }, array_values($row));
                
                $output .= "INSERT INTO `$table` (`" . implode('`, `', $columns) . "`) VALUES (" . implode(', ', $values) . ");\n";
            }
            $output .= "\n";
        }
    }
    
    // Salvar arquivo
    file_put_contents($backupFile, $output);
    
    // Retornar informações do backup
    $fileSize = filesize($backupFile);
    
    echo json_encode([
        'success' => true,
        'message' => 'Backup criado com sucesso',
        'file' => basename($backupFile),
        'size' => $fileSize,
        'size_formatted' => formatBytes($fileSize),
        'date' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao criar backup: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao criar backup: ' . $e->getMessage()]);
}

function formatBytes($bytes, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}



