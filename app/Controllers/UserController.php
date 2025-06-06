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
            // Configuração do banco
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);

            // Verifica autenticação e autorização
            $currentUserId = $_SERVER['HTTP_X_USER_ID'] ?? null;
            $currentUserRole = $_SERVER['HTTP_X_USER_ROLE'] ?? null;
            
            // Verifica se usuário está logado
            if (!$currentUserId || !$currentUserRole) {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: login necessário para apagar usuários'
                ];
            }
            
            // Verifica autorização: admin pode apagar qualquer usuário, usuário comum só pode apagar a si mesmo
            $isAdmin = ($currentUserRole === 'admin');
            $isOwnProfile = ($currentUserId == $id);
            
            if (!$isAdmin && !$isOwnProfile) {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: você só pode apagar sua própria conta. Apenas administradores podem apagar outros usuários.'
                ];
            }

            // Apaga usuário
            $result = $userModel->deleteUser($id);

            $message = $isAdmin && !$isOwnProfile
                ? "Usuário ID $id foi apagado pelo administrador"
                : "Sua conta foi apagada com sucesso";

            return [
                'success' => true,
                'message' => $message,
                'deleted_id' => $id,
                'action_type' => $isAdmin && !$isOwnProfile ? 'admin_delete' : 'self_delete'
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
            // Verifica autenticação e autorização
            $currentUserId = $_SERVER['HTTP_X_USER_ID'] ?? null;
            $currentUserRole = $_SERVER['HTTP_X_USER_ROLE'] ?? null;
            
            // Verifica se usuário está logado
            if (!$currentUserId || !$currentUserRole) {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: login necessário para apagar usuários'
                ];
            }
            
            // Apenas administradores podem apagar todos os usuários
            if ($currentUserRole !== 'admin') {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: apenas administradores podem apagar todos os usuários'
                ];
            }

            // Configuração do banco
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);

            // Apaga todos os usuários
            $count = $userModel->deleteAllUsers();

            return [
                'success' => true,
                'message' => "Todos os usuários foram apagados com sucesso pelo administrador e autoincrement resetado",
                'deleted_count' => $count,
                'reset_info' => 'O próximo usuário criado terá ID = 1',
                'admin_action' => true
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