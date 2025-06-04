<?php
// tests/TestCharacters.php
namespace Tests;

use App\Controllers\CharacterController;

class TestCharacters {
    public static function createSampleCharacter(): array {
        $testData = [
            'username' => 'gandalf',
            'nome_personagem' => 'Mithrandir',
            'nivel' => 20,
            'raca' => 'Maia',
            'classe' => 'Wizard',
            'ponto_vida' => 120,
            'classe_armadura' => 18,
            'forca' => 12,
            'destreza' => 14,
            'constituicao' => 16,
            'inteligencia' => 20,
            'sabedoria' => 18,
            'carisma' => 16,
            'imagem_personagem' => 'gandalf_wizard.jpg'
        ];
        
        $controller = new CharacterController();
        return $controller->createCharacter($testData);
    }
    
    public static function createMultipleCharacters(): array {
        $characters = [
            [
                'username' => 'strider',
                'nome_personagem' => 'Aragorn Elessar',
                'nivel' => 15,
                'raca' => 'Humano',
                'classe' => 'Ranger',
                'ponto_vida' => 95,
                'classe_armadura' => 16,
                'forca' => 16,
                'destreza' => 18,
                'constituicao' => 14,
                'inteligencia' => 12,
                'sabedoria' => 15,
                'carisma' => 13,
                'imagem_personagem' => 'aragorn_ranger.jpg'
            ],
            [
                'username' => 'elfprince',
                'nome_personagem' => 'Legolas Greenleaf',
                'nivel' => 12,
                'raca' => 'Elfo',
                'classe' => 'Archer',
                'ponto_vida' => 85,
                'classe_armadura' => 15,
                'forca' => 14,
                'destreza' => 20,
                'constituicao' => 12,
                'inteligencia' => 14,
                'sabedoria' => 16,
                'carisma' => 15,
                'imagem_personagem' => 'legolas_archer.jpg'
            ],
            [
                'username' => 'shieldmaiden',
                'nome_personagem' => 'Éowyn de Rohan',
                'nivel' => 10,
                'raca' => 'Humano',
                'classe' => 'Fighter',
                'ponto_vida' => 78,
                'classe_armadura' => 17,
                'forca' => 15,
                'destreza' => 16,
                'constituicao' => 14,
                'inteligencia' => 13,
                'sabedoria' => 12,
                'carisma' => 16,
                'imagem_personagem' => 'eowyn_fighter.jpg'
            ]
        ];
        
        $results = [];
        $controller = new CharacterController();
        
        foreach ($characters as $charData) {
            try {
                $results[] = $controller->createCharacter($charData);
            } catch (Exception $e) {
                $results[] = ['error' => $e->getMessage(), 'character' => $charData['nome_personagem']];
            }
        }
        
        return $results;
    }
}
