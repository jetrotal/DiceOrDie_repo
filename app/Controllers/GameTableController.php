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
            // Verificação de autenticação e autorização
            $userRole = $_SERVER['HTTP_X_USER_ROLE'] ?? null;
            $userId = $_SERVER['HTTP_X_USER_ID'] ?? null;
            
            // Verifica se usuário está logado
            if (!$userId || !$userRole) {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: login necessário para apagar mesas'
                ];
            }
            
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $tableModel = new GameTableModel($db);
            
            // Busca a mesa para verificar propriedade
            $table = $tableModel->getTableById($id);
            $isOwner = ($table->criador_id == $userId);
            $isAdmin = ($userRole === 'admin');
            
            // Verifica autorização: admin pode apagar qualquer mesa, usuário comum só pode apagar suas próprias mesas
            if (!$isAdmin && !$isOwner) {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: você só pode apagar suas próprias mesas. Apenas administradores podem apagar mesas de outros usuários.'
                ];
            }
            
            $tableModel->deleteTable($id, $criadorId);

            $message = $isAdmin && !$isOwner
                ? "Mesa ID $id foi apagada pelo administrador"
                : "Sua mesa foi apagada com sucesso";

            return [
                'success' => true,
                'message' => $message,
                'action_type' => $isAdmin && !$isOwner ? 'admin_delete' : 'owner_delete'
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
            
            // Verificar permissões
            $userRole = $_SERVER['HTTP_X_USER_ROLE'] ?? '';
            $userId = $_SERVER['HTTP_X_USER_ID'] ?? 0;
            
            // Se não é admin e não é o dono da mesa, negar acesso
            if ($userRole !== 'admin' && $existingTable->criador_id != $userId) {
                throw new \InvalidArgumentException("Acesso negado: você só pode editar suas próprias mesas");
            }
            
            // Mesclar dados existentes com os novos dados (atualização parcial)
            $mergedData = array_merge($existingTable->toArray(), $requestData);
            $mergedData['id'] = $id;
            
            // Não permitir alteração do criador_id a menos que seja um admin
            if (isset($requestData['criador_id']) && $requestData['criador_id'] != $existingTable->criador_id) {
                // Verifica se é admin através dos headers
                if ($userRole !== 'admin') {
                    throw new \InvalidArgumentException("Apenas administradores podem alterar o criador da mesa");
                }
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

    public function getAllTables(): array {
        try {
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $tableModel = new GameTableModel($db);
            
            $tables = $tableModel->getAllTables();

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

    public function deleteAllTables(): array {
        try {
            // Verificar se é admin
            $userRole = $_SERVER['HTTP_X_USER_ROLE'] ?? '';
            if ($userRole !== 'admin') {
                throw new \InvalidArgumentException("Acesso negado: apenas administradores podem apagar todas as mesas");
            }
            
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $tableModel = new GameTableModel($db);
            
            $tableModel->deleteAllTables();

            return [
                'success' => true,
                'message' => 'Todas as mesas foram excluídas e o ID foi resetado'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

}