// public/index.php
<?php
require_once __DIR__ . '/../app/Controllers/UserController.php';
require_once __DIR__ . '/../app/Controllers/CharacterController.php';
require_once __DIR__ . '/../app/Controllers/GameTableController.php';
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
        
    case preg_match('#^/characters/(\d+)$#', $path, $matches) && $method === 'GET':
        $id = (int)$matches[1];
        $controller = new App\Controllers\CharacterController();
        $response = $controller->getCharacter($id);
        break;
        
    case preg_match('#^/characters/(\d+)$#', $path, $matches) && $method === 'PUT':
        $id = (int)$matches[1];
        $json = file_get_contents('php://input');
        $requestData = json_decode($json, true) ?? [];
        $username = $_SERVER['HTTP_X_USERNAME'] ?? 'test_user';
        $controller = new App\Controllers\CharacterController();
        $response = $controller->updateCharacter($id, $username, $requestData);
        break;
        
    case preg_match('#^/characters/(\d+)$#', $path, $matches) && $method === 'DELETE':
        $id = (int)$matches[1];
        $username = $_SERVER['HTTP_X_USERNAME'] ?? 'test_user';
        $controller = new App\Controllers\CharacterController();
        $response = $controller->deleteCharacter($id, $username);
        break;
        
    case preg_match('#^/users/([^/]+)/characters$#', $path, $matches) && $method === 'GET':
        $username = $matches[1];
        $controller = new App\Controllers\CharacterController();
        $response = $controller->getUserCharacters($username);
        break;
        
    // Rotas para GameTable
    case 'POST:/tables':
    case 'POST:/tables.php':
        $json = file_get_contents('php://input');
        $requestData = json_decode($json, true);
        $controller = new App\Controllers\GameTableController();
        $response = $controller->createTable($requestData);
        break;
        
    case preg_match('#^/tables/(\d+)$#', $path, $matches) && $method === 'GET':
        $id = (int)$matches[1];
        $controller = new App\Controllers\GameTableController();
        $response = $controller->getTable($id);
        break;
        
    case preg_match('#^/tables/(\d+)$#', $path, $matches) && $method === 'PUT':
        $id = (int)$matches[1];
        $json = file_get_contents('php://input');
        $requestData = json_decode($json, true) ?? [];
        $criadorId = $_SERVER['HTTP_X_CRIADOR_ID'] ?? 0;
        $controller = new App\Controllers\GameTableController();
        $response = $controller->updateTable($id, $criadorId, $requestData);
        break;
        
    case preg_match('#^/tables/(\d+)$#', $path, $matches) && $method === 'DELETE':
        $id = (int)$matches[1];
        $criadorId = $_SERVER['HTTP_X_CRIADOR_ID'] ?? 0;
        $controller = new App\Controllers\GameTableController();
        $response = $controller->deleteTable($id, $criadorId);
        break;
        
    case preg_match('#^/users/(\d+)/tables$#', $path, $matches) && $method === 'GET':
        $userId = (int)$matches[1];
        $controller = new App\Controllers\GameTableController();
        $response = $controller->getTablesByUser($userId);
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