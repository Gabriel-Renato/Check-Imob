<?php
/**
 * Ponto de entrada principal
 * Redireciona para o index.html do build do frontend
 */

// Se o build existe, redirecionar para ele
if (file_exists(__DIR__ . '/dist/index.html')) {
    readfile(__DIR__ . '/dist/index.html');
    exit;
}

// Se não existe build, mostrar mensagem
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Insight - Build Necessário</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
            backdrop-filter: blur(10px);
        }
        h1 { margin-top: 0; }
        code {
            background: rgba(0, 0, 0, 0.3);
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            display: inline-block;
            margin: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Build do Frontend Necessário</h1>
        <p>Execute o build do frontend antes de usar em produção:</p>
        <code>npm run build</code>
        <p>Ou para desenvolvimento:</p>
        <code>npm run dev</code>
    </div>
</body>
</html>

