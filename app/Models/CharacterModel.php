// app/Models/CharacterModel.php
<?php
namespace App\Models;

use App\Database\DatabaseConnection;
use App\DTOs\CharacterDTO;
use RuntimeException;

class CharacterModel {
    public function __construct(private DatabaseConnection $db) {}

    public function saveCharacter(CharacterDTO $character): CharacterDTO {
        // Verificar se usuário existe
        $userCheck = $this->db->query(
            "SELECT COUNT(*) FROM usuarios WHERE username = ?",
            [$character->username]
        );
        
        if ($userCheck[0]['COUNT(*)'] === 0) {
            throw new RuntimeException("Usuário não encontrado");
        }

        // Inserir personagem
        $this->db->execute(
            "INSERT INTO personagens (
                username, nome_personagem, nivel, raca, classe, 
                ponto_vida, classe_armadura, forca, destreza, constituicao, 
                inteligencia, sabedoria, carisma, imagem_personagem
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $character->username,
                $character->nome_personagem,
                $character->nivel,
                $character->raca,
                $character->classe,
                $character->ponto_vida,
                $character->classe_armadura,
                $character->forca,
                $character->destreza,
                $character->constituicao,
                $character->inteligencia,
                $character->sabedoria,
                $character->carisma,
                $character->imagem_personagem
            ]
        );

        $characterId = $this->db->lastInsertId();
        return $this->getCharacterById($characterId);
    }

    public function getCharacterById(int $id): CharacterDTO {
    $result = $this->db->query(
        "SELECT * FROM personagens WHERE id = ?",
        [$id]
    );

    if (empty($result)) {
        throw new RuntimeException("Personagem não encontrado");
    }

    return CharacterDTO::fromArray($result[0]);
    }

    private function validateCharacterData(CharacterDTO $character): bool {
        // Validações de negócio
        if ($character->nivel < 1 || $character->nivel > 20) {
            throw new \InvalidArgumentException("Nível inválido (1-20)");
        }
        
        $attributes = [
            'ponto_vida', 'classe_armadura', 'forca', 'destreza',
            'constituicao', 'inteligencia', 'sabedoria', 'carisma'
        ];
        
        foreach ($attributes as $attr) {
            $value = $character->$attr;
            if ($value < 1 || $value > 30) {
                throw new \InvalidArgumentException("$attr deve estar entre 1 e 30");
            }
        }
        
        return true;
    }



// app/Models/CharacterModel.php
public function getCharactersByUsername(string $username): array {
    $results = $this->db->query(
        "SELECT * FROM personagens WHERE username = ?",
        [$username]
    );

    return array_map(function($row) {
        return CharacterDTO::fromArray($row);
    }, $results);
}

    return array_map(function($row) {
        return CharacterDTO::fromArray($row);
    }, $results);
}

public function deleteCharacter(int $id, string $username): bool {
    // Verifica se o personagem pertence ao usuário
    $character = $this->getCharacterById($id);
    if ($character->username !== $username) {
        throw new RuntimeException("Acesso negado: personagem não pertence ao usuário");
    }

    $this->db->execute(
        "DELETE FROM personagens WHERE id = ?",
        [$id]
    );

    return true;
}