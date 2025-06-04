<?php
// app/Controllers/GameTableController.php

namespace App\Controllers;

use App\Models\GameTableModel;
use App\Database\DatabaseFactory;
use App\DTOs\GameTableDTO;
use InvalidArgumentException;

class GameTableController {
    public function createTable(array $requestData): array {
        try {
            // Campos obrigatórios
            $required = ['nome', 'sistema', 'qntd_jogadores', 'mesa_aberta', 'criador_id'];
            
            foreach ($required as $field) {
                if (empty($requestData[$field])) {
                    throw new \InvalidArgumentException("Campo '$field' obrigatório");
                }
            }

            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $tableModel = new GameTableModel($db);
            
            $tableDTO = GameTableDTO::fromArray($requestData);
            $savedTable = $tableModel->saveTable($tableDTO);

            return [
                'success' => true,
                'table' => $savedTable->toArray()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function getTable(int $id): array {
        try {
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $tableModel = new GameTableModel($db);
            
            $tableDTO = $tableModel->getTableById($id);

            return [
                'success' => true,
                'table' => $tableDTO->toArray()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function getTablesByUser(int $userId): array {
        try {
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $tableModel = new GameTableModel($db);
            
            $tables = $tableModel->getTablesByCreatorId($userId);

            return [
                'success' => true,
                'tables' => array_map(function(GameTableDTO $dto) {
                    return $dto->toArray();
                }, $tables)
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function deleteTable(int $id, int $criadorId): array {
        try {
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $tableModel = new GameTableModel($db);
            
            $tableModel->deleteTable($id, $criadorId);

            return [
                'success' => true,
                'message' => 'Mesa excluída com sucesso'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function updateTable(int $id, array $requestData): array {
    try {
        // Campos obrigatórios mínimos
        if (empty($requestData)) {
            throw new \InvalidArgumentException("Nenhum dado fornecido para atualização");
        }

        $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
        $tableModel = new GameTableModel($db);
        
        // Obter a mesa existente
        $existingTable = $tableModel->getTableById($id);
        
        // Mesclar dados existentes com os novos dados (atualização parcial)
        $mergedData = array_merge($existingTable->toArray(), $requestData);
        $mergedData['id'] = $id;
        
        // Não permitir alteração do criador_id
        if (isset($requestData['criador_id']) && $requestData['criador_id'] != $existingTable->criador_id) {
            throw new \InvalidArgumentException("Não é permitido alterar o criador da mesa");
        }
        
        $tableDTO = GameTableDTO::fromArray($mergedData);
        $updatedTable = $tableModel->updateTable($tableDTO);

        return [
            'success' => true,
            'table' => $updatedTable->toArray()
        ];
    } catch (\Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
    
    }

}