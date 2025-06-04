<?php
// app/Controllers/UserController.php
namespace App\Controllers;

use App\Models\UserModel;
use App\Database\DatabaseFactory;
use App\DTOs\UserDTO;
use InvalidArgumentException;

class UserController {
    public function register(array $requestData): array {
        try {
            // Validação de campos obrigatórios
            $required = ['nome', 'sobrenome', 'username', 'genero', 
                        'data_nascimento', 'email', 'senha', 'experiencia'];
            
            foreach ($required as $field) {
                if (empty($requestData[$field])) {
                    throw new \InvalidArgumentException("Campo '$field' obrigatório");
                }
            }

            // Configuração do banco
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);

            // Cria usuário
            $userDTO = $userModel->createUser($requestData);

            return [
                'success' => true,
                'user' => $userDTO->toArray()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    public function login(array $requestData): array {
        try {
            // Validação básica - aceita tanto email quanto username
            if (empty($requestData['login'])) {
                throw new InvalidArgumentException("Email ou username é obrigatório");
            }
            
            if (empty($requestData['senha'])) {
                throw new InvalidArgumentException("Senha é obrigatória");
            }

            // Configuração do banco
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);

            // Verifica credenciais (email ou username)
            $userDTO = $userModel->checkCredentials(
                $requestData['login'],
                $requestData['senha']
            );

            return [
                'success' => true,
                'user' => $userDTO->toArray()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    public function getUser(int $id): array {
        try {
            // Configuração do banco
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);

            // Busca usuário
            $userDTO = $userModel->getUserById($id);

            return [
                'success' => true,
                'user' => $userDTO->toArray()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    public function getAllUsers(): array {
        try {
            // Configuração do banco
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);

            // Busca todos os usuários
            $users = $userModel->getAllUsers();

            return [
                'success' => true,
                'users' => array_map(function($user) {
                    return $user->toArray();
                }, $users)
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    public function deleteUser(int $id): array {
        try {
            // Configuração do banco
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);

            // Apaga usuário
            $result = $userModel->deleteUser($id);

            return [
                'success' => true,
                'message' => 'Usuário apagado com sucesso',
                'deleted_id' => $id
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    public function deleteAllUsers(): array {
        try {
            // Configuração do banco
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);

            // Apaga todos os usuários
            $count = $userModel->deleteAllUsers();

            return [
                'success' => true,
                'message' => "Todos os usuários foram apagados com sucesso",
                'deleted_count' => $count
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}