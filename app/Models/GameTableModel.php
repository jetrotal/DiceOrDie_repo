<?php
// app/Models/GameTableModel.php

namespace App\Models;

use App\Database\DatabaseConnection;
use App\DTOs\GameTableDTO;
use RuntimeException;

class GameTableModel {
    public function __construct(private DatabaseConnection $db) {
        $this->ensureDescricaoColumn();
    }

    /**
     * Garante que a coluna 'descricao' existe na tabela mesas
     */
    private function ensureDescricaoColumn(): void {
        try {
            // Verifica se a coluna já existe
            $columns = $this->db->query("PRAGMA table_info(mesas)");
            $hasDescricaoColumn = false;
            foreach ($columns as $column) {
                if ($column['name'] === 'descricao') {
                    $hasDescricaoColumn = true;
                    break;
                }
            }
            
            // Se não existe, adiciona a coluna
            if (!$hasDescricaoColumn) {
                $this->db->execute("ALTER TABLE mesas ADD COLUMN descricao TEXT");
                error_log("Auto-migration: Added 'descricao' column to mesas table");
            }
        } catch (\Exception $e) {
            error_log("Warning: Could not ensure descricao column exists: " . $e->getMessage());
        }
    }

    public function saveTable(GameTableDTO $table): GameTableDTO {
        // Verificar se o criador existe
        $userCheck = $this->db->query(
            "SELECT COUNT(*) FROM usuarios WHERE id = ?",
            [$table->criador_id]
        );
        
        if ($userCheck[0]['COUNT(*)'] === 0) {
            throw new RuntimeException("Criador não encontrado");
        }

        // Inserir mesa
        $this->db->execute(
            "INSERT INTO mesas (
                nome, sistema, qntd_jogadores, mesa_aberta, capa, criador_id, descricao
            ) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                $table->nome,
                $table->sistema,
                $table->qntd_jogadores,
                (int)$table->mesa_aberta,
                $table->capa,
                $table->criador_id,
                $table->descricao ?? null
            ]
        );

        $tableId = $this->db->lastInsertId();
        return $this->getTableById($tableId);
    }

    public function getTableById(int $id): GameTableDTO {
        $result = $this->db->query(
            "SELECT * FROM mesas WHERE id = ?",
            [$id]
        );

        if (empty($result)) {
            throw new RuntimeException("Mesa não encontrada");
        }

        return GameTableDTO::fromArray($result[0]);
    }

    public function getTablesByCreatorId(int $criadorId): array {
        $results = $this->db->query(
            "SELECT * FROM mesas WHERE criador_id = ?",
            [$criadorId]
        );

        return array_map(function($row) {
            return GameTableDTO::fromArray($row);
        }, $results);
    }

    public function deleteTable(int $id, int $criadorId): bool {
        // Verifica se a mesa pertence ao criador
        $table = $this->getTableById($id);
        if ($table->criador_id !== $criadorId) {
            throw new RuntimeException("Acesso negado: mesa não pertence ao usuário");
        }

        $this->db->execute(
            "DELETE FROM mesas WHERE id = ?",
            [$id]
        );

        return true;
    }

public function updateTable(GameTableDTO $table): GameTableDTO {
    // Verificar se a mesa existe
    $existingTable = $this->getTableById($table->id);
    
    // Verificar se o usuário tem permissão para editar
    // Se o criador_id mudou, significa que um admin está alterando o dono
    $isChangingOwner = $existingTable->criador_id !== $table->criador_id;
    
    if (!$isChangingOwner && $existingTable->criador_id !== $table->criador_id) {
        throw new RuntimeException("Acesso negado: mesa não pertence ao usuário");
    }

    // Atualizar a mesa (incluindo criador_id se foi alterado por admin)
    $this->db->execute(
        "UPDATE mesas SET
            nome = ?,
            sistema = ?,
            qntd_jogadores = ?,
            mesa_aberta = ?,
            capa = ?,
            criador_id = ?,
            descricao = ?
         WHERE id = ?",
        [
            $table->nome,
            $table->sistema,
            $table->qntd_jogadores,
            (int)$table->mesa_aberta,
            $table->capa,
            $table->criador_id,
            $table->descricao ?? null,
            $table->id
        ]
    );

    return $this->getTableById($table->id);
    }

    public function countTablesByCreatorId(int $criadorId): int {
        $result = $this->db->query(
            "SELECT COUNT(*) as total FROM mesas WHERE criador_id = ?",
            [$criadorId]
        );
        
        return (int) $result[0]['total'];
    }

    private function validateUserIsCreator(int $userId): bool {
        $result = $this->db->query(
            "SELECT COUNT(*) FROM usuarios WHERE id = ?",
            [$userId]
        );
        
        return $result[0]['COUNT(*)'] > 0;
    }

    public function getAllTables(): array {
        $results = $this->db->query("SELECT * FROM mesas ORDER BY id");
        
        return array_map(function($row) {
            return GameTableDTO::fromArray($row);
        }, $results);
    }

    public function deleteAllTables(): bool {
        // Deleta todas as mesas
        $this->db->execute("DELETE FROM mesas");
        
        // Reseta o autoincrement
        $this->db->execute("DELETE FROM sqlite_sequence WHERE name='mesas'");
        
        return true;
    }
}