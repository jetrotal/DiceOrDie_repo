<?php
// app/Database/DatabaseFactory.php
namespace App\Database;

class DatabaseFactory {
    public static function create(string $type, array $config): DatabaseConnection {
        return match ($type) {
            'sqlite' => new SQLiteAdapter($config[0]),
            //'mysql'  => new MysqlAdapter($config),
            default  => throw new \InvalidArgumentException("Banco não suportado")
        };
    }
}