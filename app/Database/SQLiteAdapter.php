<?php
// app/Database/SQLiteAdapter.php
namespace App\Database;

class SQLiteAdapter implements DatabaseConnection {
    private \PDO $pdo;

    public function __construct(string $dbPath) {
        $this->pdo = new \PDO("sqlite:$dbPath");
        $this->pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        $this->createTables();
    }

    private function createTables() {
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                sobrenome TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                genero TEXT NOT NULL,
                data_nascimento DATE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha_hash TEXT NOT NULL,
                experiencia TEXT,
                img_perfil TEXT
            )
        ");
          $this->pdo->exec("
        CREATE TABLE IF NOT EXISTS personagens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            nome_personagem TEXT NOT NULL,
            nivel INTEGER NOT NULL,
            raca TEXT NOT NULL,
            classe TEXT NOT NULL,
            ponto_vida INTEGER NOT NULL,
            classe_armadura INTEGER NOT NULL,
            forca INTEGER NOT NULL,
            destreza INTEGER NOT NULL,
            constituicao INTEGER NOT NULL,
            inteligencia INTEGER NOT NULL,
            sabedoria INTEGER NOT NULL,
            carisma INTEGER NOT NULL,
            imagem_personagem TEXT,
            FOREIGN KEY (username) REFERENCES usuarios(username)
        )");

        $this->pdo->exec("
        CREATE TABLE IF NOT EXISTS mesas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            sistema TEXT NOT NULL,
            qntd_jogadores INTEGER NOT NULL,
            mesa_aberta INTEGER NOT NULL, -- 0 para false, 1 para true
            capa TEXT,
            criador_id INTEGER NOT NULL,
            FOREIGN KEY (criador_id) REFERENCES usuarios(id)
        )");

    }

    public function query(string $sql, array $params = []): array {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function execute(string $sql, array $params = []): bool {
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    public function lastInsertId(): int {
        return $this->pdo->lastInsertId();
    }
}