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
            // Validação básica
            if (empty($requestData['email'])) {
                throw new InvalidArgumentException("E-mail é obrigatório");
            }
            
            if (empty($requestData['senha'])) {
                throw new InvalidArgumentException("Senha é obrigatória");
            }
            
            if (!filter_var($requestData['email'], FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException("Formato de e-mail inválido");
            }

            // Configuração do banco
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $userModel = new UserModel($db);

            // Verifica credenciais
            $userDTO = $userModel->checkCredentials(
                $requestData['email'],
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
}