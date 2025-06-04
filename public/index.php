<?php
// public/index.php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../app/Controllers/UserController.php';
require_once __DIR__ . '/../app/Controllers/CharacterController.php';
require_once __DIR__ . '/../app/Controllers/GameTableController.php';
require_once __DIR__ . '/../app/Models/UserModel.php';
require_once __DIR__ . '/../app/Models/CharacterModel.php';
require_once __DIR__ . '/../app/Models/GameTableModel.php';
require_once __DIR__ . '/../app/DTOs/UserDTO.php';
require_once __DIR__ . '/../app/DTOs/CharacterDTO.php';
require_once __DIR__ . '/../app/DTOs/GameTableDTO.php';
require_once __DIR__ . '/../app/Database/DatabaseConnection.php';
require_once __DIR__ . '/../app/Database/DatabaseFactory.php';
require_once __DIR__ . '/../app/Database/SQLiteAdapter.php';

// Test files
require_once __DIR__ . '/../tests/TestUsers.php';
require_once __DIR__ . '/../tests/TestCharacters.php';
require_once __DIR__ . '/../tests/TestGameTables.php';
require_once __DIR__ . '/../tests/TestRunner.php';

// Configurações iniciais
header('Content-Type: application/json');

// Simula roteamento baseado na URL
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Roteamento básico
switch ("$method:$path") {
    case 'GET:/':
        // Simple home page
        $response = [
            'success' => true,
            'message' => 'Welcome to DiceOrDie API'
        ];
        break;
        
    case 'GET:/debug/all':
        // Display all database entries
        $response = [
            'success' => true,
            'message' => 'All database entries will be displayed below'
        ];
        break;
        
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
        
    // Rotas para Usuários (Users)
    case preg_match('#^/users/(\d+)$#', $path, $matches) && $method === 'GET':
        $id = (int)$matches[1];
        $controller = new App\Controllers\UserController();
        $response = $controller->getUser($id);
        break;
        
    case preg_match('#^/users/(\d+)$#', $path, $matches) && $method === 'DELETE':
        $id = (int)$matches[1];
        $controller = new App\Controllers\UserController();
        $response = $controller->deleteUser($id);
        break;
        
    case 'GET:/users':
        $controller = new App\Controllers\UserController();
        $response = $controller->getAllUsers();
        break;
        
    case 'DELETE:/users':
        $controller = new App\Controllers\UserController();
        $response = $controller->deleteAllUsers();
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
        
    // === ROTAS DE TESTE ORGANIZADAS ===
    case 'GET:/test/user':
        $response = Tests\TestUsers::createSampleUser();
        break;
        
    case 'GET:/test/users':
        $response = Tests\TestUsers::createMultipleUsers();
        break;
        
    case 'GET:/test/character':
        $response = Tests\TestCharacters::createSampleCharacter();
        break;
        
    case 'GET:/test/characters':
        $response = Tests\TestCharacters::createMultipleCharacters();
        break;
        
    case 'GET:/test/table':
        $response = Tests\TestGameTables::createSampleTable();
        break;
        
    case 'GET:/test/tables':
        $response = Tests\TestGameTables::createMultipleTables();
        break;
        
    case 'GET:/test/basic':
        $response = Tests\TestRunner::runBasicTests();
        break;
        
    case 'GET:/test/all':
        $response = Tests\TestRunner::runAllTests();
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

// Display all database entries only for GET requests to root path (not AJAX calls)
if ($method === 'GET' && $path === '/') {
    try {
        $db = App\Database\DatabaseFactory::create('sqlite', [__DIR__ . '/../database.sqlite']);
        
        echo "\n\n=== ALL DATABASE ENTRIES ===\n\n";
        
        // Get all users
        echo "USERS (usuarios):\n";
        $users = $db->query("SELECT * FROM usuarios");
        echo json_encode($users, JSON_PRETTY_PRINT);
        echo "\n\n";
        
        // Get all characters
        echo "CHARACTERS (personagens):\n";
        $characters = $db->query("SELECT * FROM personagens");
        echo json_encode($characters, JSON_PRETTY_PRINT);
        echo "\n\n";
        
        // Get all tables
        echo "GAME TABLES (mesas):\n";
        $tables = $db->query("SELECT * FROM mesas");
        echo json_encode($tables, JSON_PRETTY_PRINT);
        echo "\n\n";
        
    } catch (Exception $e) {
        echo "\n\nError displaying database entries: " . $e->getMessage() . "\n";
    }
}