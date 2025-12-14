<?php
/**
 * Ponto de entrada principal
 * Serve o index.html do build do frontend
 */

// Tentar diferentes caminhos possíveis
$possiblePaths = [
    __DIR__ . '/index.html',           // Arquivo na raiz (onde estão os arquivos do dist/)
    __DIR__ . '/dist/index.html',      // Dentro de dist/ (caso esteja em dist/)
    $_SERVER['DOCUMENT_ROOT'] . '/index.html',
    $_SERVER['DOCUMENT_ROOT'] . '/dist/index.html',
];

$indexPath = null;
foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        $indexPath = $path;
        break;
    }
}

if ($indexPath && file_exists($indexPath)) {
    // Definir headers apropriados
    header('Content-Type: text/html; charset=utf-8');
    // Ler e servir o arquivo
    readfile($indexPath);
    exit;
}

// Se não existe, mostrar erro
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Check Imob - Erro</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
        }
        h1 { margin-top: 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Arquivo index.html não encontrado</h1>
        <p>Verifique se o index.html está na raiz do site.</p>
    </div>
</body>
</html>
