-- Update categories table with new default categories
INSERT INTO categories (name, icon, color, type, is_default) VALUES
('Кафе', 'coffee', '#FF453A', 'expense', true),
('Одежда', 'shopping-bag', '#5E5CE6', 'expense', true),
('Связь', 'smartphone', '#64D2FF', 'expense', true),
('Спорт', 'activity', '#30D158', 'expense', true),
('Авто', 'tool', '#AC8E68', 'expense', true),
('Питомцы', 'github', '#FFD60A', 'expense', true),
('Путешествия', 'map', '#0A84FF', 'expense', true),
('Красота', 'sun', '#BF5AF2', 'expense', true),
('Техника', 'monitor', '#64D2FF', 'expense', true),
('Фриланс', 'laptop', '#64D2FF', 'income', true),
('Инвестиции', 'trending-up', '#30D158', 'income', true),
('Кэшбэк', 'percent', '#FF9F0A', 'income', true)
ON CONFLICT DO NOTHING;
