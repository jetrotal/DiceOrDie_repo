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

            // Verifica permissões
            $currentUserId = $_SERVER['HTTP_X_USER_ID'] ?? null;
            $currentUserRole = $_SERVER['HTTP_X_USER_ROLE'] ?? null;
            $isOwnProfile = ($currentUserId == $id);
            $isAdmin = ($currentUserRole === 'admin');

            // Busca usuário (dados completos para admin ou próprio perfil)
            if ($isAdmin || $isOwnProfile) {
                // Dados completos para admin ou próprio usuário
                $userDTO = $userModel->getUserById($id);
                $profileType = $isAdmin ? 'admin_access' : 'own_profile';
            } else {
                // Dados públicos para outros usuários
                $userDTO = $userModel->getUserPublicById($id);
                $profileType = 'public';
            }

            return [
                'success' => true,
                'user' => $userDTO->toArray(),
                'profile_type' => $profileType
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

            // Verifica se é admin
            $currentUserRole = $_SERVER['HTTP_X_USER_ROLE'] ?? null;
            $isAdmin = ($currentUserRole === 'admin');

            if ($isAdmin) {
                // Admin vê dados completos de todos os usuários
                $users = $userModel->getAllUsers();
                $info = 'Admin: Mostrando dados completos de todos os usuários';
            } else {
                // Usuários comuns veem apenas dados públicos
                $users = $userModel->getAllUsersPublic();
                $info = 'Mostrando perfis públicos de usuários';
            }

            return [
                'success' => true,
                'users' => array_map(function($user) {
                    return $user->toArray();
                }, $users),
                'info' => $info,
                'access_level' => $isAdmin ? 'admin' : 'public'
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
            // Para testes, permite acesso sem autenticação
            // TODO: Implementar autenticação por sessão em produção
            $currentUserId = $_SERVER['HTTP_X_USER_ID'] ?? $id;
            $currentUserRole = $_SERVER['HTTP_X_USER_ROLE'] ?? 'admin';
            
            if ($currentUserRole !== 'admin' && $currentUserId != $id) {
                error_log("Warning: deleteUser accessed without proper authorization");
            }

            // Configuração do banco
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);

            // Apaga usuário
            $result = $userModel->deleteUser($id);

            return [
                'success' => true,
                'message' => 'Usuário apagado com sucesso',
                'deleted_id' => $id,
                'warning' => ($currentUserRole !== 'admin' && $currentUserId != $id) ? 'Acesso liberado para testes' : null
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
            // Para testes, permite acesso sem autenticação
            // TODO: Implementar autenticação por sessão em produção
            $currentUserRole = $_SERVER['HTTP_X_USER_ROLE'] ?? 'admin';
            
            if ($currentUserRole !== 'admin') {
                error_log("Warning: deleteAllUsers accessed without admin privileges");
            }

            // Configuração do banco
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);

            // Apaga todos os usuários
            $count = $userModel->deleteAllUsers();

            return [
                'success' => true,
                'message' => "Todos os usuários foram apagados com sucesso e autoincrement resetado",
                'deleted_count' => $count,
                'reset_info' => 'O próximo usuário criado terá ID = 1',
                'warning' => $currentUserRole !== 'admin' ? 'Acesso liberado para testes' : null
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    public function updateUser(int $id, array $requestData): array {
        try {
            // Para testes, permite acesso sem autenticação
            // TODO: Implementar autenticação por sessão em produção
            $currentUserId = $_SERVER['HTTP_X_USER_ID'] ?? $id;
            $currentUserRole = $_SERVER['HTTP_X_USER_ROLE'] ?? 'admin';
            
            if ($currentUserRole !== 'admin' && $currentUserId != $id) {
                error_log("Warning: updateUser accessed without proper authorization");
            }
            
            // Não-admins não podem alterar o role (mantém proteção básica)
            if ($currentUserRole !== 'admin' && isset($requestData['role'])) {
                unset($requestData['role']);
            }

            // Configuração do banco
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);

            // Atualiza usuário
            $userDTO = $userModel->updateUser($id, $requestData);

            return [
                'success' => true,
                'message' => 'Usuário atualizado com sucesso',
                'user' => $userDTO->toArray(),
                'warning' => ($currentUserRole !== 'admin' && $currentUserId != $id) ? 'Acesso liberado para testes' : null
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}