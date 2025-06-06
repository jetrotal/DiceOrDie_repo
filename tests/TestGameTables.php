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
            'criador_id' => 1, // Gandalf
            'descricao' => 'Uma jornada épica através da Terra Média para destruir o Um Anel. Aventura focada em exploração, combate tático e desenvolvimento de personagem em um mundo de fantasia medieval.'
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
                'criador_id' => 1,
                'descricao' => 'Continue a jornada épica através de Rohan e Fangorn. Enfrente novos desafios enquanto os caminhos se dividem e a escuridão se aproxima.'
            ],
            [
                'nome' => 'O Retorno do Rei',
                'sistema' => 'Pathfinder',
                'qntd_jogadores' => 5,
                'mesa_aberta' => false,
                'capa' => 'return_king_cover.jpg',
                'criador_id' => 2,
                'descricao' => 'A batalha final se aproxima! Participe da defesa de Minas Tirith e da coroação do verdadeiro rei. Mesa fechada para jogadores experientes.'
            ],
            [
                'nome' => 'Aventuras em Rohan',
                'sistema' => 'D&D 3.5',
                'qntd_jogadores' => 3,
                'mesa_aberta' => true,
                'capa' => 'rohan_adventures.jpg',
                'criador_id' => 3,
                'descricao' => 'Cavalgue pelas planícies de Rohan ao lado dos Rohirrim. Aventuras focadas em cavalaria, honra e proteção das terras ancestrais.'
            ],
            [
                'nome' => 'A Defesa de Gondor',
                'sistema' => 'D&D 5e',
                'qntd_jogadores' => 8,
                'mesa_aberta' => true,
                'capa' => 'gondor_defense.jpg',
                'criador_id' => 2,
                'descricao' => 'Mega campanha de guerra! Defenda o último baluarte dos homens contra as forças de Mordor. Estratégia militar e heroísmo épico garantidos.'
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
