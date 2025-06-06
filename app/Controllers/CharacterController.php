<?php
// app/Controllers/CharacterController.php
namespace App\Controllers;

use App\Models\CharacterModel;
use App\Database\DatabaseFactory;
use App\DTOs\CharacterDTO;
use InvalidArgumentException;

class CharacterController {
    public function createCharacter(array $requestData): array {
        try {
            // Validação robusta de autenticação
            $currentUserId = $_SERVER['HTTP_X_USER_ID'] ?? $_SERVER['HTTP_X-USER-ID'] ?? null;
            $currentUserRole = $_SERVER['HTTP_X_USER_ROLE'] ?? $_SERVER['HTTP_X-USER-ROLE'] ?? null;
            
            // Se não há headers, verifica se o username existe no banco (validação básica)
            if (!$currentUserId && isset($requestData['username'])) {
                $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
                $userCheck = $db->query(
                    "SELECT id, role FROM usuarios WHERE username = ?",
                    [$requestData['username']]
                );
                
                if (!empty($userCheck)) {
                    $currentUserId = $userCheck[0]['id'];
                    $currentUserRole = $userCheck[0]['role'];
                    error_log("INFO: Usuário validado via banco de dados: {$requestData['username']} (ID: $currentUserId, Role: $currentUserRole)");
                } else {
                    return [
                        'success' => false,
                        'error' => 'Usuário não encontrado no sistema. Faça login primeiro.'
                    ];
                }
            } else if (!$currentUserId) {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: usuário deve estar logado para criar personagens'
                ];
            }

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

    public function updateCharacter(int $id, string $username, array $requestData): array {
        try {
            // Validação robusta de autenticação
            $currentUserId = $_SERVER['HTTP_X_USER_ID'] ?? $_SERVER['HTTP_X-USER-ID'] ?? null;
            $currentUserRole = $_SERVER['HTTP_X_USER_ROLE'] ?? $_SERVER['HTTP_X-USER-ROLE'] ?? null;
            
            // Se não há headers, verifica se o username existe no banco
            if (!$currentUserId) {
                $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
                $userCheck = $db->query(
                    "SELECT id, role FROM usuarios WHERE username = ?",
                    [$username]
                );
                
                if (!empty($userCheck)) {
                    $currentUserId = $userCheck[0]['id'];
                    $currentUserRole = $userCheck[0]['role'];
                } else {
                    return [
                        'success' => false,
                        'error' => 'Usuário não encontrado no sistema'
                    ];
                }
            }

            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $characterModel = new CharacterModel($db);
            
            // Busca o personagem para verificar propriedade
            $character = $characterModel->getCharacterById($id);
            $isOwner = ($character->username === $username);
            $isAdmin = ($currentUserRole === 'admin');
            
            if (!$isOwner && !$isAdmin) {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: você só pode editar seus próprios personagens'
                ];
            }

            // Verificação especial para edição do campo username (apenas admin)
            if (isset($requestData['username']) && $requestData['username'] !== $character->username) {
                if (!$isAdmin) {
                    return [
                        'success' => false,
                        'error' => 'Acesso negado: apenas administradores podem alterar o dono (username) de um personagem',
                        'current_owner' => $character->username,
                        'attempted_new_owner' => $requestData['username']
                    ];
                }
                
                // Verificar se o novo username existe no sistema
                $newUserCheck = $db->query(
                    "SELECT id, username FROM usuarios WHERE username = ?",
                    [$requestData['username']]
                );
                
                if (empty($newUserCheck)) {
                    return [
                        'success' => false,
                        'error' => 'Usuário de destino não encontrado no sistema',
                        'attempted_username' => $requestData['username']
                    ];
                }
            }

            // Merge dos dados existentes com os novos
            $existingData = $character->toArray();
            $mergedData = array_merge($existingData, array_filter($requestData, function($value) {
                return $value !== null && $value !== '';
            }));
            
            // Converter números se necessário
            $numericFields = ['nivel', 'ponto_vida', 'classe_armadura', 'forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'];
            foreach ($numericFields as $field) {
                if (isset($mergedData[$field])) {
                    $mergedData[$field] = (int)$mergedData[$field];
                }
            }
            
            $characterDTO = CharacterDTO::fromArray($mergedData);
            $updatedCharacter = $characterModel->updateCharacter($characterDTO);

            return [
                'success' => true,
                'character' => $updatedCharacter->toArray(),
                'warning' => (!$isOwner && !$isAdmin) ? 'Acesso liberado para testes' : null
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
            // Verificação de autenticação baseada em headers - aceita múltiplos formatos
            $currentUserId = $_SERVER['HTTP_X_USER_ID'] ?? $_SERVER['HTTP_X-USER-ID'] ?? null;
            $currentUserRole = $_SERVER['HTTP_X_USER_ROLE'] ?? $_SERVER['HTTP_X-USER-ROLE'] ?? null;
            
            if (!$currentUserId) {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: usuário deve estar logado',
                    'debug' => [
                        'received_headers' => array_filter($_SERVER, function($key) {
                            return strpos($key, 'HTTP_X') === 0;
                        }, ARRAY_FILTER_USE_KEY)
                    ]
                ];
            }

            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            $characterModel = new CharacterModel($db);
            
            // Busca o personagem para verificar propriedade
            $character = $characterModel->getCharacterById($id);
            $isOwner = ($character->username === $username);
            $isAdmin = ($currentUserRole === 'admin');
            
            if (!$isOwner && !$isAdmin) {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: você só pode apagar seus próprios personagens'
                ];
            }
            
            $characterModel->deleteCharacter($id, $username);

            return [
                'success' => true,
                'message' => 'Personagem excluído com sucesso',
                'warning' => (!$isOwner && !$isAdmin) ? 'Acesso liberado para testes' : null
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function deleteAllCharacters(): array {
        try {
            // Verificação de autenticação e autorização
            $currentUserId = $_SERVER['HTTP_X_USER_ID'] ?? $_SERVER['HTTP_X-USER-ID'] ?? null;
            $currentUserRole = $_SERVER['HTTP_X_USER_ROLE'] ?? $_SERVER['HTTP_X-USER-ROLE'] ?? null;
            
            // Verifica se usuário está logado
            if (!$currentUserId || !$currentUserRole) {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: login necessário para apagar personagens'
                ];
            }
            
            // Apenas administradores podem apagar todos os personagens
            if ($currentUserRole !== 'admin') {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: apenas administradores podem apagar todos os personagens'
                ];
            }
            
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            
            // Apagar todos os personagens
            $db->execute("DELETE FROM personagens");
            
            // Reset do autoincrement
            $db->execute("DELETE FROM sqlite_sequence WHERE name = 'personagens'");
            
            return [
                'success' => true,
                'message' => 'Todos os personagens foram apagados com sucesso pelo administrador e o ID foi resetado',
                'admin_action' => true
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()];
        }
    }

    public function getAllCharacters(): array {
        try {
            // Verificação de autenticação - apenas admin pode ver todos os personagens
            $currentUserRole = $_SERVER['HTTP_X_USER_ROLE'] ?? $_SERVER['HTTP_X-USER-ROLE'] ?? null;
            
            if ($currentUserRole !== 'admin') {
                return [
                    'success' => false,
                    'error' => 'Acesso negado: apenas administradores podem ver todos os personagens'
                ];
            }
            
            $db = DatabaseFactory::create('sqlite', [__DIR__ . '/../../database.sqlite']);
            
            // Busca todos os personagens
            $results = $db->query("SELECT * FROM personagens ORDER BY id ASC");
            
            $characters = [];
            foreach ($results as $row) {
                $characters[] = CharacterDTO::fromArray($row)->toArray();
            }
            
            return [
                'success' => true,
                'characters' => $characters,
                'total' => count($characters),
                'info' => 'Admin: Mostrando todos os personagens do sistema'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Erro interno: ' . $e->getMessage()
            ];
        }
    }
}