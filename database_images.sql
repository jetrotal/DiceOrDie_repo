-- Tabela para armazenar informações das imagens dos usuários
CREATE TABLE IF NOT EXISTS user_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    upload_date DATETIME NOT NULL,
    is_profile_picture BOOLEAN DEFAULT 0,
    is_character_image BOOLEAN DEFAULT 0,
    is_table_image BOOLEAN DEFAULT 0,
    character_id INTEGER NULL,
    table_id INTEGER NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES personagens(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES mesas(id) ON DELETE CASCADE
);

-- Índice para melhorar performance nas consultas por usuário
CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON user_images(user_id);

-- Índice para fotos de perfil
CREATE INDEX IF NOT EXISTS idx_user_images_profile ON user_images(user_id, is_profile_picture);

-- Índice para imagens de personagem
CREATE INDEX IF NOT EXISTS idx_user_images_character ON user_images(user_id, is_character_image);

-- Índice para imagens de mesa
CREATE INDEX IF NOT EXISTS idx_user_images_table ON user_images(user_id, is_table_image);