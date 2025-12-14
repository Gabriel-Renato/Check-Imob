-- Banco de dados para sistema de vistorias
CREATE DATABASE IF NOT EXISTS property_insight CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE property_insight;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'corretor') NOT NULL DEFAULT 'corretor',
    avatar VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de propriedades/imóveis
CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    unit VARCHAR(100) NOT NULL,
    building VARCHAR(255) NULL,
    neighborhood VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city (city),
    INDEX idx_neighborhood (neighborhood)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de cartas/ambientes de vistoria (configuração)
CREATE TABLE IF NOT EXISTS inspection_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    `order` INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de vistorias
CREATE TABLE IF NOT EXISTS inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    corretor_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (corretor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_corretor (corretor_id),
    INDEX idx_property (property_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de inspeções de cartas (dados da vistoria de cada ambiente)
CREATE TABLE IF NOT EXISTS card_inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspection_id INT NOT NULL,
    card_id INT NOT NULL,
    status ENUM('ok', 'defect', 'non_compliant') NULL,
    observation TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES inspection_cards(id) ON DELETE CASCADE,
    UNIQUE KEY unique_inspection_card (inspection_id, card_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de fotos das vistorias
CREATE TABLE IF NOT EXISTS inspection_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    card_inspection_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT NULL,
    mime_type VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_inspection_id) REFERENCES card_inspections(id) ON DELETE CASCADE,
    INDEX idx_card_inspection (card_inspection_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de anotações nas fotos
CREATE TABLE IF NOT EXISTS photo_annotations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    photo_id INT NOT NULL,
    type ENUM('circle', 'arrow', 'point') NOT NULL,
    x DECIMAL(10, 2) NOT NULL,
    y DECIMAL(10, 2) NOT NULL,
    radius DECIMAL(10, 2) NULL,
    end_x DECIMAL(10, 2) NULL,
    end_y DECIMAL(10, 2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (photo_id) REFERENCES inspection_photos(id) ON DELETE CASCADE,
    INDEX idx_photo (photo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir dados iniciais - cartas de vistoria
INSERT INTO inspection_cards (name, icon, `order`) VALUES
('Sala de Estar', 'sofa', 1),
('Cozinha', 'utensils', 2),
('Quarto 1', 'bed-double', 3),
('Quarto 2', 'bed-single', 4),
('Banheiro Social', 'bath', 5),
('Suíte', 'door-open', 6),
('Varanda', 'sun', 7),
('Área de Serviço', 'washing-machine', 8)
ON DUPLICATE KEY UPDATE name=name;

-- Inserir usuários padrão (senha: password123 - hash bcrypt)
-- Para produção, altere essas senhas!
INSERT INTO users (name, email, password, role) VALUES
('Ricardo Mendes', 'admin@vistoria.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Ana Carolina Silva', 'ana.silva@vistoria.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'corretor'),
('Pedro Oliveira', 'pedro.oliveira@vistoria.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'corretor')
ON DUPLICATE KEY UPDATE email=email;

