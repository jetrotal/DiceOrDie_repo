<?php
// app/Models/UserModel.php
namespace App\Models;

use App\Database\DatabaseConnection;
use App\DTOs\UserDTO;
use RuntimeException;


class UserModel {
    public function __construct(private DatabaseConnection $db) {
        $this->ensureRoleColumn();
    }

    /**
     * Garante que a coluna 'role' existe na tabela usuarios
     */
    private function ensureRoleColumn(): void {
        try {
            // Verifica se a coluna já existe
            $columns = $this->db->query("PRAGMA table_info(usuarios)");
            $hasRoleColumn = false;
            foreach ($columns as $column) {
                if ($column['name'] === 'role') {
                    $hasRoleColumn = true;
                    break;
                }
            }
            
            // Se não existe, adiciona a coluna
            if (!$hasRoleColumn) {
                $this->db->execute("ALTER TABLE usuarios ADD COLUMN role TEXT DEFAULT 'user'");
                error_log("Auto-migration: Added 'role' column to usuarios table");
            }
        } catch (\Exception $e) {
            error_log("Warning: Could not ensure role column exists: " . $e->getMessage());
        }
    }

    public function createUser(array $data): UserDTO {
        // Validação básica
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException("E-mail inválido");
        }

        // Hash da senha
        $passwordHash = password_hash($data['senha'], PASSWORD_BCRYPT);

        // Define role - primeiro usuário criado é admin
        $userCount = $this->db->query("SELECT COUNT(*) as total FROM usuarios")[0]['total'];
        $role = ($userCount == 0) ? 'admin' : ($data['role'] ?? 'user');

        // Inserção no banco
        $this->db->execute(
            "INSERT INTO usuarios (
                nome, sobrenome, username, genero, data_nascimento,
                email, senha_hash, experiencia, img_perfil, role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $data['nome'],
                $data['sobrenome'],
                $data['username'],
                $data['genero'],
                $data['data_nascimento'],
                $data['email'],
                $passwordHash,
                $data['experiencia'],
                $data['img_perfil'] ?? null,
                $role
            ]
        );

        // Recupera usuário criado
        $userId = $this->db->lastInsertId();
        return $this->getUserById($userId);
    }

    public function getUserById(int $id): UserDTO {
        $result = $this->db->query(
            "SELECT id, nome, sobrenome, username, genero,
             data_nascimento, email, experiencia, img_perfil, role
             FROM usuarios WHERE id = ?",
            [$id]
        );

        if (empty($result)) {
            throw new \RuntimeException("Usuário não encontrado");
        }

        return UserDTO::fromArray($result[0]);
    }

    public function checkCredentials(string $login, string $password): UserDTO {
        // Busca usuário por email ou username
        $result = $this->db->query(
            "SELECT id, nome, sobrenome, username, genero,
             data_nascimento, email, experiencia, img_perfil, role, senha_hash
             FROM usuarios WHERE email = ? OR username = ?",
            [$login, $login]
        );

        if (empty($result)) {
            throw new RuntimeException("Credenciais inválidas");
        }

        $userData = $result[0];

        // Verifica senha
        if (!password_verify($password, $userData['senha_hash'])) {
            throw new RuntimeException("Credenciais inválidas");
        }

        // Remove dados sensíveis antes de retornar
        unset($userData['senha_hash']);
        return UserDTO::fromArray($userData);
    }
    
    public function getAllUsers(): array {
        $result = $this->db->query(
            "SELECT id, nome, sobrenome, username, genero,
             data_nascimento, email, experiencia, img_perfil, role
             FROM usuarios ORDER BY id"
        );

        return array_map(function($userData) {
            return UserDTO::fromArray($userData);
        }, $result);
    }

    public function getAllUsersPublic(): array {
        $result = $this->db->query(
            "SELECT id, nome, sobrenome, username, genero,
             experiencia, img_perfil, role
             FROM usuarios ORDER BY id"
        );
        
        return array_map(function($row) {
            // Remove dados sensíveis
            $row['data_nascimento'] = 'Privado';
            $row['email'] = 'Privado';
            return UserDTO::fromArray($row);
        }, $result);
    }

    public function getUserPublicById(int $id): UserDTO {
        $result = $this->db->query(
            "SELECT id, nome, sobrenome, username, genero,
             experiencia, img_perfil, role
             FROM usuarios WHERE id = ?",
            [$id]
        );

        if (empty($result)) {
            throw new RuntimeException("Usuário não encontrado");
        }

        // Remove dados sensíveis
        $row = $result[0];
        $row['data_nascimento'] = 'Privado';
        $row['email'] = 'Privado';
        
        return UserDTO::fromArray($row);
    }
    
    public function deleteUser(int $id): bool {
        // Verifica se usuário existe
        $user = $this->getUserById($id);
        
        // Apaga usuário
        $this->db->execute(
            "DELETE FROM usuarios WHERE id = ?",
            [$id]
        );
        
        return true;
    }
    
    public function deleteAllUsers(): int {
        // Conta quantos usuários existem antes de apagar
        $countResult = $this->db->query("SELECT COUNT(*) as total FROM usuarios");
        $count = $countResult[0]['total'];
        
        // Apaga todos os usuários
        $this->db->execute("DELETE FROM usuarios");
        
        // Reseta o autoincrement para começar do 1 novamente
        $this->db->execute("DELETE FROM sqlite_sequence WHERE name='usuarios'");
        
        return $count;
    }
    
    public function updateUser(int $id, array $data): UserDTO {
        // Verifica se usuário existe
        $user = $this->getUserById($id);
        
        // Constrói a query dinamicamente com base nos campos fornecidos
        $fields = [];
        $values = [];
        
        $allowedFields = ['nome', 'sobrenome', 'username', 'genero', 'data_nascimento', 'email', 'experiencia', 'img_perfil', 'role'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        
        // Se uma nova senha foi fornecida, hash ela
        if (isset($data['senha']) && !empty($data['senha'])) {
            $fields[] = "senha_hash = ?";
            $values[] = password_hash($data['senha'], PASSWORD_BCRYPT);
        }
        
        // Validar email se fornecido
        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException("E-mail inválido");
        }
        
        if (empty($fields)) {
            throw new \InvalidArgumentException("Nenhum campo válido para atualizar");
        }
        
        // Adiciona o ID no final dos valores
        $values[] = $id;
        
        // Executa a atualização
        $query = "UPDATE usuarios SET " . implode(', ', $fields) . " WHERE id = ?";
        $this->db->execute($query, $values);
        
        // Retorna o usuário atualizado
        return $this->getUserById($id);
    }
}