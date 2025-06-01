// app/Controllers/CharacterController.php
<?php
namespace App\Controllers;

use App\Models\CharacterModel;
use App\Database\DatabaseFactory;
use App\DTOs\CharacterDTO;
use InvalidArgumentException;

class CharacterController {
    public function createCharacter(array $requestData): array {
        try {
            // Campos obrigatórios
            $required = [
                'username', 'nome_personagem', 'nivel', 'raca', 'classe',
                'ponto_vida', 'classe_armadura', 'forca', 'destreza', 
                'constituicao', 'inteligencia', 'sabedoria', 'carisma'
            ];
            
            foreach ($required as $field) {
                if (empty($requestData[$field])) {
                    throw new \InvalidArgumentException("Campo '$field' obrigatório");
                }
            }

            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $characterModel = new CharacterModel($db);
            
            $characterDTO = CharacterDTO::fromArray($requestData);
            $savedCharacter = $characterModel->saveCharacter($characterDTO);

            return [
                'success' => true,
                'character' => $savedCharacter->toArray()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

public function getCharacter(int $id): array {
    try {
        $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
        $characterModel = new CharacterModel($db);
        
        $characterDTO = $characterModel->getCharacterById($id);

        return [
            'success' => true,
            'character' => $characterDTO->toArray()
        ];
    } catch (\Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

public function getUserCharacters(string $username): array {
    try {
        $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
        $characterModel = new CharacterModel($db);
        
        $characters = $characterModel->getCharactersByUsername($username);

        return [
            'success' => true,
            'characters' => array_map(function(CharacterDTO $dto) {
                return $dto->toArray();
            }, $characters)
        ];
    } catch (\Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

public function deleteCharacter(int $id, string $username): array {
    try {
        $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
        $characterModel = new CharacterModel($db);
        
        $characterModel->deleteCharacter($id, $username);

        return [
            'success' => true,
            'message' => 'Personagem excluído com sucesso'
        ];
    } catch (\Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

}