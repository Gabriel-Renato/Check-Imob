<?php
/**
 * Configuração CORS para permitir requisições do frontend
 */

// Permitir requisições de qualquer origem (em produção, especifique o domínio)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Responder a requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Permitir JSON
header('Content-Type: application/json; charset=utf-8');

