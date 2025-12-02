INSERT INTO categories (name, description, icon, color) VALUES
('Общее', 'Общие обсуждения и новости', 'MessageSquare', 'from-purple-500 to-pink-500'),
('Гайды', 'Полезные руководства и инструкции', 'BookOpen', 'from-blue-500 to-cyan-500'),
('Вакансии', 'Набор в администрацию', 'Briefcase', 'from-orange-500 to-red-500'),
('Обновления', 'Новости и обновления сервера', 'Zap', 'from-green-500 to-emerald-500'),
('Поддержка', 'Помощь и технические вопросы', 'HelpCircle', 'from-yellow-500 to-amber-500'),
('Жалобы', 'Жалобы на игроков и баги', 'AlertTriangle', 'from-red-500 to-rose-500');

INSERT INTO users (username, email, password_hash, role, rank, posts_count, reputation) VALUES
('Admin', 'admin@crmp.com', 'demo_hash_admin', 'admin', 'Администратор', 1500, 9999),
('Helper', 'helper@crmp.com', 'demo_hash_helper', 'moderator', 'Модератор', 523, 2100),
('Developer', 'dev@crmp.com', 'demo_hash_dev', 'admin', 'Разработчик', 342, 4500);
