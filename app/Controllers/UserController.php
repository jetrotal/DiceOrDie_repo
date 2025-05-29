<?php
// app/Controllers/UserController.php
namespace App\Controllers;

use App\Models\UserModel;
use App\Database\DatabaseFactory;
use App\DTOs\UserDTO;

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
}