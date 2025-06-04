<?php
// app/DTOs/UserDTO.php
namespace App\DTOs;

class UserDTO {
    public function __construct(
        public readonly ?int $id,
        public readonly string $nome,
        public readonly string $sobrenome,
        public readonly string $username,
        public readonly string $genero,
        public readonly string $data_nascimento,
        public readonly string $email,
        public readonly string $experiencia,
        public readonly ?string $img_perfil,
        public readonly string $role = 'user'
    ) {}

    public static function fromArray(array $data): self {
        return new self(
            $data['id'] ?? null,
            $data['nome'],
            $data['sobrenome'],
            $data['username'],
            $data['genero'],
            $data['data_nascimento'],
            $data['email'],
            $data['experiencia'],
            $data['img_perfil'] ?? null,
            $data['role'] ?? 'user'
        );
    }

    public function toArray(): array {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'sobrenome' => $this->sobrenome,
            'username' => $this->username,
            'genero' => $this->genero,
            'data_nascimento' => $this->data_nascimento,
            'email' => $this->email,
            'experiencia' => $this->experiencia,
            'img_perfil' => $this->img_perfil,
            'role' => $this->role
        ];
    }
}