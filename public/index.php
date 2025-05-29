<?php
// public/index.php
require_once __DIR__ . '/../app/Controllers/UserController.php';
require_once __DIR__ . '/../app/Database/DatabaseFactory.php';

// Simula recebimento de JSON
$json = '{
    "nome": "Aragorn",
    "sobrenome": "Elessar",
    "username": "aragorn123",
    "genero": "Masculino",
    "data_nascimento": "1980-01-01",
    "email": "aragorn@middleearth.com",
    "senha": "Strider123!",
    "experiencia": "Avançado",
    "img_perfil": "path/to/image.jpg"
}';

$requestData = json_decode($json, true);

// Processa requisição
$controller = new App\Controllers\UserController();
$response = $controller->register($requestData);

// Retorna resposta JSON
header('Content-Type: application/json');
echo json_encode($response, JSON_PRETTY_PRINT);