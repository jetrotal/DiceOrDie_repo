<?php
// public/index.php
require_once __DIR__ . '/../app/Controllers/UserController.php';
require_once __DIR__ . '/../app/Database/DatabaseFactory.php';

// Configurações iniciais
header('Content-Type: application/json');

// Simula roteamento baseado na URL
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Roteamento básico
switch ("$method:$path") {
    case 'POST:/register':
    case 'POST:/register.php':
        $json = file_get_contents('php://input');
        $requestData = json_decode($json, true);
        $controller = new App\Controllers\UserController();
        $response = $controller->register($requestData);
        break;
        
    case 'POST:/login':
    case 'POST:/login.php':
        $json = file_get_contents('php://input');
        $requestData = json_decode($json, true);
        $controller = new App\Controllers\UserController();
        $response = $controller->login($requestData);
        break;
        
    // Rota para testes (pode ser removida em produção)
    case 'GET:/test-register':
        $testData = [
            'nome' => 'Gandalf',
            'sobrenome' => 'The Grey',
            'username' => 'gandalf',
            'genero' => 'Masculino',
            'data_nascimento' => '1950-01-01',
            'email' => 'gandalf@middleearth.com',
            'senha' => 'YouShallNotPass!',
            'experiencia' => 'Lendário'
        ];
        $controller = new App\Controllers\UserController();
        $response = $controller->register($testData);
        break;
        
    default:
        http_response_code(404);
        $response = [
            'success' => false,
            'error' => 'Endpoint não encontrado'
        ];
}

// Retorna resposta JSON
echo json_encode($response, JSON_PRETTY_PRINT);