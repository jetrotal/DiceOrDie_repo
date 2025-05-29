<?php
// app/Database/DatabaseConnection.php
namespace App\Database;

interface DatabaseConnection {
    public function query(string $sql, array $params = []): array;
    public function execute(string $sql, array $params = []): bool;
    public function lastInsertId(): int;
}