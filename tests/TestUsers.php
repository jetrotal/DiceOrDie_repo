<?php
// tests/TestUsers.php
namespace Tests;

use App\Controllers\UserController;

class TestUsers {
    public static function createSampleUser(): array {
        $testData = [
            'nome' => 'Gandalf',
            'sobrenome' => 'The Grey',
            'username' => 'gandalf',
            'genero' => 'Masculino',
            'data_nascimento' => '1950-01-01',
            'email' => 'gandalf@middleearth.com',
            'senha' => 'YouShallNotPass!',
            'experiencia' => 'Lendário'
        ];
        
        $controller = new UserController();
        return $controller->register($testData);
    }
    
    public static function createMultipleUsers(): array {
        $users = [
            [
                'nome' => 'Aragorn',
                'sobrenome' => 'Elessar',
                'username' => 'strider',
                'genero' => 'Masculino',
                'data_nascimento' => '1931-03-01',
                'email' => 'aragorn@gondor.com',
                'senha' => 'AndúrilFlame!',
                'experiencia' => 'Experiente'
            ],
            [
                'nome' => 'Legolas',
                'sobrenome' => 'Greenleaf',
                'username' => 'elfprince',
                'genero' => 'Masculino',
                'data_nascimento' => '1000-05-15',
                'email' => 'legolas@mirkwood.com',
                'senha' => 'BowMaster123',
                'experiencia' => 'Veterano'
            ],
            [
                'nome' => 'Éowyn',
                'sobrenome' => 'Dernhelm',
                'username' => 'shieldmaiden',
                'genero' => 'Feminino',
                'data_nascimento' => '1995-02-20',
                'email' => 'eowyn@rohan.com',
                'senha' => 'IAmNoMan!',
                'experiencia' => 'Iniciante'
            ]
        ];
        
        $results = [];
        $controller = new UserController();
        
        foreach ($users as $userData) {
            try {
                $results[] = $controller->register($userData);
            } catch (Exception $e) {
                $results[] = ['error' => $e->getMessage(), 'user' => $userData['username']];
            }
        }
        
        return $results;
    }
    
    public static function createAdminUser(): array {
        $adminData = [
            'nome' => 'Admin',
            'sobrenome' => 'DiceOrDie',
            'username' => 'admin',
            'genero' => 'Outro',
            'data_nascimento' => '1990-01-01',
            'email' => 'admin@diceordie.com',
            'senha' => 'admin',
            'experiencia' => 'Lendário',
            'role' => 'admin'
        ];
        
        $controller = new UserController();
        $result = $controller->register($adminData);
        
        // Adiciona informações sobre como fazer login
        if (isset($result['success']) && $result['success']) {
            $result['login_info'] = [
                'username' => 'admin',
                'email' => 'admin@diceordie.com',
                'password' => 'admin',
                'role' => 'admin'
            ];
        }
        
        return $result;
    }
}
