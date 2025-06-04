<?php
// tests/TestRunner.php
namespace Tests;

class TestRunner {
    public static function runAllTests(): array {
        $results = [
            'users' => [],
            'characters' => [],
            'tables' => []
        ];
        
        try {
            // Create users first (dependencies)
            $results['users'] = TestUsers::createMultipleUsers();
            
            // Then create characters (depends on users)
            $results['characters'] = TestCharacters::createMultipleCharacters();
            
            // Finally create tables (depends on users)
            $results['tables'] = TestGameTables::createMultipleTables();
            
        } catch (Exception $e) {
            $results['error'] = $e->getMessage();
        }
        
        return $results;
    }
    
    public static function runBasicTests(): array {
        $results = [
            'user' => null,
            'character' => null,
            'table' => null
        ];
        
        try {
            // Create one of each for basic testing
            $results['user'] = TestUsers::createSampleUser();
            $results['character'] = TestCharacters::createSampleCharacter();
            $results['table'] = TestGameTables::createSampleTable();
            
        } catch (Exception $e) {
            $results['error'] = $e->getMessage();
        }
        
        return $results;
    }
}
