<?php
// app/Controllers/UserController.php
namespace App\Controllers;

use App\Models\UserModel;
use App\Database\DatabaseFactory;
use App\DTOs\UserDTO;
use InvalidArgumentException;

class UserController {
    private function startSession(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

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

            // Validações específicas
            if (!filter_var($requestData['email'], FILTER_VALIDATE_EMAIL)) {
                throw new \InvalidArgumentException("Email inválido");
            }

            if (strlen($requestData['senha']) < 6) {
                throw new \InvalidArgumentException("Senha deve ter pelo menos 6 caracteres");
            }

            // Configuração do banco
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);

            // Cria usuário
            $userDTO = $userModel->createUser($requestData);

            // Iniciar sessão automaticamente após registro
            $this->startSession();
            $_SESSION['user_id'] = $userDTO->id;
            $_SESSION['user_role'] = $userDTO->role;
            $_SESSION['user_data'] = $userDTO->toArray();

            return [
                'success' => true,
                'user' => $userDTO->toArray(),
                'message' => 'Conta criada com sucesso! Você foi automaticamente logado.'
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

            // Iniciar sessão
            $this->startSession();
            $_SESSION['user_id'] = $userDTO->id;
            $_SESSION['user_role'] = $userDTO->role;
            $_SESSION['user_data'] = $userDTO->toArray();

            return [
                'success' => true,
                'user' => $userDTO->toArray(),
                'message' => 'Login realizado com sucesso!'
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
            $this->startSession();
            
            // Verificar autenticação usando sessão ou headers
            $currentUserId = $_SESSION['user_id'] ?? $_SERVER['HTTP_X_USER_ID'] ?? null;
            $currentUserRole = $_SESSION['user_role'] ?? $_SERVER['HTTP_X_USER_ROLE'] ?? null;
            
            // Verificar se usuário está logado
            if (!$currentUserId || !$currentUserRole) {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: login necessário para editar usuários'
                ];
            }
            
            // Verificar autorização: admin pode editar qualquer usuário, usuário comum só pode editar a si mesmo
            $isAdmin = ($currentUserRole === 'admin');
            $isOwnProfile = ($currentUserId == $id);
            
            if (!$isAdmin && !$isOwnProfile) {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: você só pode editar seu próprio perfil. Apenas administradores podem editar outros usuários.'
                ];
            }
            
            // Não-admins não podem alterar o role
            if (!$isAdmin && isset($requestData['role'])) {
                unset($requestData['role']);
            }

            // Validações específicas para campos que foram enviados
            if (isset($requestData['email']) && !filter_var($requestData['email'], FILTER_VALIDATE_EMAIL)) {
                throw new \InvalidArgumentException("Email inválido");
            }

            if (isset($requestData['senha']) && !empty($requestData['senha']) && strlen($requestData['senha']) < 6) {
                throw new \InvalidArgumentException("Senha deve ter pelo menos 6 caracteres");
            }

            // Configuração do banco
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);

            // Atualiza usuário
            $userDTO = $userModel->updateUser($id, $requestData);

            // Atualizar sessão se for o próprio usuário
            if ($isOwnProfile) {
                $_SESSION['user_data'] = $userDTO->toArray();
            }

            return [
                'success' => true,
                'message' => 'Usuário atualizado com sucesso',
                'user' => $userDTO->toArray()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function logout(): array {
        try {
            $this->startSession();
            
            // Limpar sessão
            $_SESSION = [];
            session_destroy();

            return [
                'success' => true,
                'message' => 'Logout realizado com sucesso'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function getCurrentUser(): array {
        try {
            $this->startSession();
            
            $currentUserId = $_SESSION['user_id'] ?? null;
            
            if (!$currentUserId) {
                return [
                    'success' => false,
                    'error' => 'Usuário não está logado'
                ];
            }

            // Buscar dados atualizados do usuário
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);
            $userDTO = $userModel->getUserById($currentUserId);

            // Atualizar dados na sessão
            $_SESSION['user_data'] = $userDTO->toArray();

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
}