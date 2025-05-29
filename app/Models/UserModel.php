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

    public function checkCredentials(string $email, string $password): UserDTO {
        // Busca usuário por email
        $result = $this->db->query(
            "SELECT id, nome, sobrenome, username, genero, 
             data_nascimento, email, experiencia, img_perfil, senha_hash 
             FROM usuarios WHERE email = ?",
            [$email]
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
}