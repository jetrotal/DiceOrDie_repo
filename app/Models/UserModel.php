<?php
// app/Models/UserModel.php
namespace App\Models;

use App\Database\DatabaseConnection;
use App\DTOs\UserDTO;
use RuntimeException;


class UserModel {
    public function __construct(private DatabaseConnection $db) {}

    public function createUser(array $data): UserDTO {
        // Validação básica
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException("E-mail inválido");
        }

        // Hash da senha
        $passwordHash = password_hash($data['senha'], PASSWORD_BCRYPT);

        // Inserção no banco
        $this->db->execute(
            "INSERT INTO usuarios (
                nome, sobrenome, username, genero, data_nascimento, 
                email, senha_hash, experiencia, img_perfil
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $data['nome'],
                $data['sobrenome'],
                $data['username'],
                $data['genero'],
                $data['data_nascimento'],
                $data['email'],
                $passwordHash,
                $data['experiencia'],
                $data['img_perfil'] ?? null
            ]
        );

        // Recupera usuário criado
        $userId = $this->db->lastInsertId();
        return $this->getUserById($userId);
    }

    public function getUserById(int $id): UserDTO {
        $result = $this->db->query(
            "SELECT id, nome, sobrenome, username, genero, 
             data_nascimento, email, experiencia, img_perfil 
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
             data_nascimento, email, experiencia, img_perfil, senha_hash
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
             data_nascimento, email, experiencia, img_perfil
             FROM usuarios ORDER BY id"
        );

        return array_map(function($userData) {
            return UserDTO::fromArray($userData);
        }, $result);
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
        
        return $count;
    }
    
    public function updateUser(int $id, array $data): UserDTO {
        // Verifica se usuário existe
        $user = $this->getUserById($id);
        
        // Constrói a query dinamicamente com base nos campos fornecidos
        $fields = [];
        $values = [];
        
        $allowedFields = ['nome', 'sobrenome', 'username', 'genero', 'data_nascimento', 'email', 'experiencia', 'img_perfil'];
        
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