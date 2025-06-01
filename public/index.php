<?php
// public/index.php
require_once __DIR__ . '/../app/Controllers/UserController.php';
require_once __DIR__ . '/../app/Controllers/CharacterController.php';
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
        
    // Rotas para Personagens (Characters)
    case 'POST:/characters':
    case 'POST:/characters.php':
        $json = file_get_contents('php://input');
        $requestData = json_decode($json, true);
        $controller = new App\Controllers\CharacterController();
        $response = $controller->createCharacter($requestData);
        break;
        
    case 'GET:/characters':
        // Listagem geral de personagens (se necessário)
        http_response_code(501);
        $response = [
            'success' => false,
            'error' => 'Funcionalidade não implementada'
        ];
        break;
        
    case preg_match('#^/characters/(\d+)$#', $path, $matches) && $method === 'GET':
        $id = (int)$matches[1];
        $controller = new App\Controllers\CharacterController();
        $response = $controller->getCharacter($id);
        break;
        
    case preg_match('#^/characters/(\d+)$#', $path, $matches) && $method === 'DELETE':
        $id = (int)$matches[1];
        // Em sistema real, username viria da autenticação
        $username = $_SERVER['HTTP_X_USERNAME'] ?? 'test_user';
        $controller = new App\Controllers\CharacterController();
        $response = $controller->deleteCharacter($id, $username);
        break;
        
    case preg_match('#^/users/([^/]+)/characters$#', $path, $matches) && $method === 'GET':
        $username = $matches[1];
        $controller = new App\Controllers\CharacterController();
        $response = $controller->getUserCharacters($username);
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