// app/DTOs/CharacterDTO.php
<?php

namespace App\DTOs;

class CharacterDTO {
    public function __construct(
        public readonly ?int $id,
        public readonly string $username,
        public readonly string $nome_personagem,
        public readonly int $nivel,
        public readonly string $raca,
        public readonly string $classe,
        public readonly int $ponto_vida,
        public readonly int $classe_armadura,
        public readonly int $forca,
        public readonly int $destreza,
        public readonly int $constituicao,
        public readonly int $inteligencia,
        public readonly int $sabedoria,
        public readonly int $carisma,
        public readonly ?string $imagem_personagem
    ) {}

    public static function fromArray(array $data): self {
        return new self(
            $data['id'] ?? null,
            $data['username'],
            $data['nome_personagem'],
            (int) $data['nivel'],
            $data['raca'],
            $data['classe'],
            (int) $data['ponto_vida'],
            (int) $data['classe_armadura'],
            (int) $data['forca'],
            (int) $data['destreza'],
            (int) $data['constituicao'],
            (int) $data['inteligencia'],
            (int) $data['sabedoria'],
            (int) $data['carisma'],
            $data['imagem_personagem'] ?? null
        );
    }

    public function toArray(): array {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'nome_personagem' => $this->nome_personagem,
            'nivel' => $this->nivel,
            'raca' => $this->raca,
            'classe' => $this->classe,
            'ponto_vida' => $this->ponto_vida,
            'classe_armadura' => $this->classe_armadura,
            'forca' => $this->forca,
            'destreza' => $this->destreza,
            'constituicao' => $this->constituicao,
            'inteligencia' => $this->inteligencia,
            'sabedoria' => $this->sabedoria,
            'carisma' => $this->carisma,
            'imagem_personagem' => $this->imagem_personagem
        ];
    }
}