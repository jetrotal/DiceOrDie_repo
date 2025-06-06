<?php
// app/DTOs/GameTableDTO.php

namespace App\DTOs;

class GameTableDTO {
    public function __construct(
        public readonly ?int $id,
        public readonly string $nome,
        public readonly string $sistema,
        public readonly int $qntd_jogadores,
        public readonly bool $mesa_aberta,
        public readonly ?string $capa,
        public readonly int $criador_id,
        public readonly ?string $descricao
    ) {}

    public static function fromArray(array $data): self {
        return new self(
            $data['id'] ?? null,
            $data['nome'],
            $data['sistema'],
            (int) $data['qntd_jogadores'],
            (bool) $data['mesa_aberta'],
            $data['capa'] ?? null,
            (int) $data['criador_id'],
            $data['descricao'] ?? null
        );
    }

    public function toArray(): array {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'sistema' => $this->sistema,
            'qntd_jogadores' => $this->qntd_jogadores,
            'mesa_aberta' => $this->mesa_aberta,
            'capa' => $this->capa,
            'criador_id' => $this->criador_id,
            'descricao' => $this->descricao
        ];
    }
}