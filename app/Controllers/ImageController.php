<?php

class ImageController {
    private $database;
    private $uploadDir;
    private $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    private $maxFileSize = 5 * 1024 * 1024; // 5MB

    public function __construct($database) {
        $this->database = $database;
        $this->uploadDir = __DIR__ . '/../../public/uploads/';
        
        // Criar diretório de uploads se não existir
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    public function uploadImage() {
        try {
            // Verificar se o usuário está logado
            if (!isset($_SESSION['user_id'])) {
                return $this->jsonResponse(['error' => 'Usuário não autenticado'], 401);
            }

            // Verificar se foi enviado um arquivo
            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                return $this->jsonResponse(['error' => 'Nenhum arquivo válido foi enviado'], 400);
            }

            $file = $_FILES['image'];

            // Validar tipo de arquivo
            if (!in_array($file['type'], $this->allowedTypes)) {
                return $this->jsonResponse(['error' => 'Tipo de arquivo não permitido. Use JPEG, PNG ou GIF'], 400);
            }

            // Validar tamanho do arquivo
            if ($file['size'] > $this->maxFileSize) {
                return $this->jsonResponse(['error' => 'Arquivo muito grande. Máximo 5MB'], 400);
            }

            // Gerar nome único para o arquivo
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = uniqid('img_') . '_' . time() . '.' . $extension;
            $filepath = $this->uploadDir . $filename;

            // Mover arquivo para diretório de uploads
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                return $this->jsonResponse(['error' => 'Erro ao salvar arquivo'], 500);
            }

            // Redimensionar imagem se necessário
            $this->resizeImage($filepath, 400, 400);

            // Salvar informações no banco
            $imageData = [
                'user_id' => $_SESSION['user_id'],
                'filename' => $filename,
                'original_name' => $file['name'],
                'file_size' => $file['size'],
                'mime_type' => $file['type'],
                'upload_date' => date('Y-m-d H:i:s')
            ];

            $this->database->execute("
                INSERT INTO user_images (user_id, filename, original_name, file_size, mime_type, upload_date)
                VALUES (:user_id, :filename, :original_name, :file_size, :mime_type, :upload_date)
            ", $imageData);

            // Retornar URL da imagem
            $imageUrl = '/uploads/' . $filename;
            
            return $this->jsonResponse([
                'success' => true,
                'message' => 'Imagem enviada com sucesso',
                'image_url' => $imageUrl,
                'filename' => $filename
            ]);

        } catch (Exception $e) {
            return $this->jsonResponse(['error' => 'Erro interno: ' . $e->getMessage()], 500);
        }
    }

    public function uploadProfilePicture() {
        try {
            // Verificar se o usuário está logado
            if (!isset($_SESSION['user_id'])) {
                return $this->jsonResponse(['error' => 'Usuário não autenticado'], 401);
            }

            // Verificar se foi enviado um arquivo
            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                return $this->jsonResponse(['error' => 'Nenhum arquivo válido foi enviado'], 400);
            }

            $file = $_FILES['image'];

            // Validar tipo de arquivo
            if (!in_array($file['type'], $this->allowedTypes)) {
                return $this->jsonResponse(['error' => 'Tipo de arquivo não permitido. Use JPEG, PNG ou GIF'], 400);
            }

            // Validar tamanho do arquivo
            if ($file['size'] > $this->maxFileSize) {
                return $this->jsonResponse(['error' => 'Arquivo muito grande. Máximo 5MB'], 400);
            }

            // Deletar foto de perfil anterior se existir
            $this->deleteOldProfilePicture($_SESSION['user_id']);

            // Gerar nome único para o arquivo
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'profile_' . $_SESSION['user_id'] . '_' . time() . '.' . $extension;
            $filepath = $this->uploadDir . $filename;

            // Mover arquivo para diretório de uploads
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                return $this->jsonResponse(['error' => 'Erro ao salvar arquivo'], 500);
            }

            // Redimensionar imagem se necessário
            $this->resizeImage($filepath, 400, 400);

            // Salvar informações no banco
            $imageData = [
                'user_id' => $_SESSION['user_id'],
                'filename' => $filename,
                'original_name' => $file['name'],
                'file_size' => $file['size'],
                'mime_type' => $file['type'],
                'upload_date' => date('Y-m-d H:i:s'),
                'is_profile_picture' => 1
            ];

            $this->database->execute("
                INSERT INTO user_images (user_id, filename, original_name, file_size, mime_type, upload_date, is_profile_picture)
                VALUES (:user_id, :filename, :original_name, :file_size, :mime_type, :upload_date, :is_profile_picture)
            ", $imageData);

            // Atualizar campo img_perfil na tabela usuarios
            $imageUrl = '/uploads/' . $filename;
            $this->database->execute("
                UPDATE usuarios SET img_perfil = :img_perfil WHERE id = :user_id
            ", ['img_perfil' => $imageUrl, 'user_id' => $_SESSION['user_id']]);
            
            return $this->jsonResponse([
                'success' => true,
                'message' => 'Foto de perfil atualizada com sucesso',
                'image_url' => $imageUrl,
                'filename' => $filename
            ]);

        } catch (Exception $e) {
            return $this->jsonResponse(['error' => 'Erro interno: ' . $e->getMessage()], 500);
        }
    }

    public function uploadCharacterImage() {
        try {
            // Verificar se o usuário está logado
            if (!isset($_SESSION['user_id'])) {
                return $this->jsonResponse(['error' => 'Usuário não autenticado'], 401);
            }

            // Verificar se foi enviado um arquivo
            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                return $this->jsonResponse(['error' => 'Nenhum arquivo válido foi enviado'], 400);
            }

            $file = $_FILES['image'];

            // Validar tipo de arquivo
            if (!in_array($file['type'], $this->allowedTypes)) {
                return $this->jsonResponse(['error' => 'Tipo de arquivo não permitido. Use JPEG, PNG ou GIF'], 400);
            }

            // Validar tamanho do arquivo
            if ($file['size'] > $this->maxFileSize) {
                return $this->jsonResponse(['error' => 'Arquivo muito grande. Máximo 5MB'], 400);
            }

            // Gerar nome único para o arquivo
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'character_' . $_SESSION['user_id'] . '_' . time() . '.' . $extension;
            $filepath = $this->uploadDir . $filename;

            // Mover arquivo para diretório de uploads
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                return $this->jsonResponse(['error' => 'Erro ao salvar arquivo'], 500);
            }

            // Redimensionar imagem se necessário
            $this->resizeImage($filepath, 400, 400);

            // Salvar informações no banco
            $imageData = [
                'user_id' => $_SESSION['user_id'],
                'filename' => $filename,
                'original_name' => $file['name'],
                'file_size' => $file['size'],
                'mime_type' => $file['type'],
                'upload_date' => date('Y-m-d H:i:s'),
                'is_character_image' => 1
            ];

            $this->database->execute("
                INSERT INTO user_images (user_id, filename, original_name, file_size, mime_type, upload_date, is_character_image)
                VALUES (:user_id, :filename, :original_name, :file_size, :mime_type, :upload_date, :is_character_image)
            ", $imageData);

            // Retornar URL da imagem
            $imageUrl = '/uploads/' . $filename;
            
            return $this->jsonResponse([
                'success' => true,
                'message' => 'Imagem de personagem enviada com sucesso',
                'image_url' => $imageUrl,
                'filename' => $filename
            ]);

        } catch (Exception $e) {
            return $this->jsonResponse(['error' => 'Erro interno: ' . $e->getMessage()], 500);
        }
    }

    private function deleteOldProfilePicture($userId) {
        try {
            // Buscar foto de perfil atual
            $images = $this->database->query("
                SELECT filename FROM user_images
                WHERE user_id = :user_id AND is_profile_picture = 1
            ", ['user_id' => $userId]);

            foreach ($images as $image) {
                // Remover arquivo físico
                $filepath = $this->uploadDir . $image['filename'];
                if (file_exists($filepath)) {
                    unlink($filepath);
                }

                // Remover do banco
                $this->database->execute("
                    DELETE FROM user_images WHERE filename = :filename
                ", ['filename' => $image['filename']]);
            }
        } catch (Exception $e) {
            // Log error but don't stop the process
            error_log('Erro ao deletar foto de perfil anterior: ' . $e->getMessage());
        }
    }

    public function deleteImage() {
        try {
            if (!isset($_SESSION['user_id'])) {
                return $this->jsonResponse(['error' => 'Usuário não autenticado'], 401);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $filename = $input['filename'] ?? '';

            if (empty($filename)) {
                return $this->jsonResponse(['error' => 'Nome do arquivo é obrigatório'], 400);
            }

            // Verificar se a imagem pertence ao usuário ou se é admin
            $images = $this->database->query("
                SELECT user_id FROM user_images WHERE filename = :filename
            ", ['filename' => $filename]);
            
            $image = !empty($images) ? $images[0] : null;

            if (!$image) {
                return $this->jsonResponse(['error' => 'Imagem não encontrada'], 404);
            }

            // Verificar permissões
            if ($image['user_id'] != $_SESSION['user_id'] && $_SESSION['role'] !== 'admin') {
                return $this->jsonResponse(['error' => 'Sem permissão para deletar esta imagem'], 403);
            }

            // Remover arquivo físico
            $filepath = $this->uploadDir . $filename;
            if (file_exists($filepath)) {
                unlink($filepath);
            }

            // Remover do banco
            $this->database->execute("DELETE FROM user_images WHERE filename = :filename", ['filename' => $filename]);

            return $this->jsonResponse([
                'success' => true,
                'message' => 'Imagem removida com sucesso'
            ]);

        } catch (Exception $e) {
            return $this->jsonResponse(['error' => 'Erro interno: ' . $e->getMessage()], 500);
        }
    }

    public function getUserImages($userId = null) {
        try {
            $userId = $userId ?? $_SESSION['user_id'] ?? null;

            if (!$userId) {
                return $this->jsonResponse(['error' => 'ID do usuário é obrigatório'], 400);
            }

            $images = $this->database->query("
                SELECT filename, original_name, file_size, mime_type, upload_date
                FROM user_images
                WHERE user_id = :user_id
                ORDER BY upload_date DESC
            ", ['user_id' => $userId]);

            // Adicionar URL completa para cada imagem
            foreach ($images as &$image) {
                $image['url'] = '/uploads/' . $image['filename'];
                $image['file_size_formatted'] = $this->formatFileSize($image['file_size']);
            }

            return $this->jsonResponse([
                'success' => true,
                'images' => $images
            ]);

        } catch (Exception $e) {
            return $this->jsonResponse(['error' => 'Erro interno: ' . $e->getMessage()], 500);
        }
    }

    private function resizeImage($filepath, $maxWidth, $maxHeight) {
        $imageInfo = getimagesize($filepath);
        if (!$imageInfo) return false;

        $width = $imageInfo[0];
        $height = $imageInfo[1];
        $type = $imageInfo[2];

        // Se a imagem já é menor que o máximo, não redimensionar
        if ($width <= $maxWidth && $height <= $maxHeight) {
            return true;
        }

        // Calcular novas dimensões mantendo proporção
        $ratio = min($maxWidth / $width, $maxHeight / $height);
        $newWidth = round($width * $ratio);
        $newHeight = round($height * $ratio);

        // Criar imagem original
        switch ($type) {
            case IMAGETYPE_JPEG:
                $source = imagecreatefromjpeg($filepath);
                break;
            case IMAGETYPE_PNG:
                $source = imagecreatefrompng($filepath);
                break;
            case IMAGETYPE_GIF:
                $source = imagecreatefromgif($filepath);
                break;
            default:
                return false;
        }

        // Criar nova imagem redimensionada
        $destination = imagecreatetruecolor($newWidth, $newHeight);
        
        // Preservar transparência para PNG e GIF
        if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_GIF) {
            imagealphablending($destination, false);
            imagesavealpha($destination, true);
            $transparent = imagecolorallocatealpha($destination, 255, 255, 255, 127);
            imagefill($destination, 0, 0, $transparent);
        }

        imagecopyresampled($destination, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        // Salvar imagem redimensionada
        switch ($type) {
            case IMAGETYPE_JPEG:
                imagejpeg($destination, $filepath, 85);
                break;
            case IMAGETYPE_PNG:
                imagepng($destination, $filepath, 8);
                break;
            case IMAGETYPE_GIF:
                imagegif($destination, $filepath);
                break;
        }

        imagedestroy($source);
        imagedestroy($destination);

        return true;
    }

    private function formatFileSize($bytes) {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }

    private function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}