<?php
// tests/TestGameTables.php
namespace Tests;

use App\Controllers\GameTableController;

class TestGameTables {
    public static function createSampleTable(): array {
        $testData = [
            'nome' => 'A Sociedade do Anel',
            'sistema' => 'D&D 5e',
            'qntd_jogadores' => 4,
            'mesa_aberta' => true,
            'capa' => 'fellowship_cover.jpg',
            'criador_id' => 1 // Gandalf
        ];
        
        $controller = new GameTableController();
        return $controller->createTable($testData);
    }
    
    public static function createMultipleTables(): array {
        $tables = [
            [
                'nome' => 'As Duas Torres',
                'sistema' => 'D&D 5e',
                'qntd_jogadores' => 6,
                'mesa_aberta' => true,
                'capa' => 'two_towers_cover.jpg',
                'criador_id' => 1
            ],
            [
                'nome' => 'O Retorno do Rei',
                'sistema' => 'Pathfinder',
                'qntd_jogadores' => 5,
                'mesa_aberta' => false,
                'capa' => 'return_king_cover.jpg',
                'criador_id' => 2
            ],
            [
                'nome' => 'Aventuras em Rohan',
                'sistema' => 'D&D 3.5',
                'qntd_jogadores' => 3,
                'mesa_aberta' => true,
                'capa' => 'rohan_adventures.jpg',
                'criador_id' => 3
            ],
            [
                'nome' => 'A Defesa de Gondor',
                'sistema' => 'D&D 5e',
                'qntd_jogadores' => 8,
                'mesa_aberta' => true,
                'capa' => 'gondor_defense.jpg',
                'criador_id' => 2
            ]
        ];
        
        $results = [];
        $controller = new GameTableController();
        
        foreach ($tables as $tableData) {
            try {
                $results[] = $controller->createTable($tableData);
            } catch (Exception $e) {
                $results[] = ['error' => $e->getMessage(), 'table' => $tableData['nome']];
            }
        }
        
        return $results;
    }
}
