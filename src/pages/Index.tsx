import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type UserRole = 'user' | 'moderator' | 'admin';

interface User {
  id: string;
  username: string;
  avatar: string;
  role: UserRole;
  rank: string;
  posts: number;
  reputation: number;
}

interface Topic {
  id: string;
  title: string;
  author: User;
  replies: number;
  views: number;
  lastActivity: string;
  isPinned: boolean;
  isLocked: boolean;
  category: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  topics: number;
  icon: string;
  color: string;
}

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('forum');
  const [topics, setTopics] = useState<Topic[]>([
    {
      id: '1',
      title: 'Добро пожаловать на форум CRMP!',
      author: { id: '1', username: 'Admin', avatar: '', role: 'admin', rank: 'Администратор', posts: 1500, reputation: 9999 },
      replies: 42,
      views: 1203,
      lastActivity: '2 часа назад',
      isPinned: true,
      isLocked: false,
      category: 'general'
    },
    {
      id: '2',
      title: 'Правила форума - обязательно к прочтению',
      author: { id: '1', username: 'Admin', avatar: '', role: 'admin', rank: 'Администратор', posts: 1500, reputation: 9999 },
      replies: 15,
      views: 856,
      lastActivity: '5 часов назад',
      isPinned: true,
      isLocked: true,
      category: 'general'
    },
    {
      id: '3',
      title: 'Как начать играть на сервере? Гайд для новичков',
      author: { id: '2', username: 'Helper', avatar: '', role: 'moderator', rank: 'Модератор', posts: 523, reputation: 2100 },
      replies: 89,
      views: 3421,
      lastActivity: '15 минут назад',
      isPinned: false,
      isLocked: false,
      category: 'guides'
    },
    {
      id: '4',
      title: 'Набор в администрацию сервера',
      author: { id: '1', username: 'Admin', avatar: '', role: 'admin', rank: 'Администратор', posts: 1500, reputation: 9999 },
      replies: 156,
      views: 5234,
      lastActivity: '1 час назад',
      isPinned: false,
      isLocked: false,
      category: 'jobs'
    },
    {
      id: '5',
      title: 'Обновление 2.0 - Новые возможности!',
      author: { id: '3', username: 'Developer', avatar: '', role: 'admin', rank: 'Разработчик', posts: 342, reputation: 4500 },
      replies: 234,
      views: 8912,
      lastActivity: '30 минут назад',
      isPinned: false,
      isLocked: false,
      category: 'updates'
    }
  ]);

  const [categories] = useState<Category[]>([
    { id: 'general', name: 'Общее', description: 'Общие обсуждения и новости', topics: 245, icon: 'MessageSquare', color: 'from-purple-500 to-pink-500' },
    { id: 'guides', name: 'Гайды', description: 'Полезные руководства и инструкции', topics: 89, icon: 'BookOpen', color: 'from-blue-500 to-cyan-500' },
    { id: 'jobs', name: 'Вакансии', description: 'Набор в администрацию', topics: 34, icon: 'Briefcase', color: 'from-orange-500 to-red-500' },
    { id: 'updates', name: 'Обновления', description: 'Новости и обновления сервера', topics: 56, icon: 'Zap', color: 'from-green-500 to-emerald-500' },
    { id: 'support', name: 'Поддержка', description: 'Помощь и технические вопросы', topics: 178, icon: 'HelpCircle', color: 'from-yellow-500 to-amber-500' },
    { id: 'reports', name: 'Жалобы', description: 'Жалобы на игроков и баги', topics: 123, icon: 'AlertTriangle', color: 'from-red-500 to-rose-500' }
  ]);

  const handleLogin = () => {
    setCurrentUser({
      id: '999',
      username: 'Player_123',
      avatar: '',
      role: 'user',
      rank: 'Новичок',
      posts: 5,
      reputation: 10
    });
    setIsLoginOpen(false);
    toast.success('Вы успешно вошли в систему!');
  };

  const handleRegister = () => {
    setCurrentUser({
      id: '999',
      username: 'NewPlayer',
      avatar: '',
      role: 'user',
      rank: 'Новичок',
      posts: 0,
      reputation: 0
    });
    setIsRegisterOpen(false);
    toast.success('Регистрация прошла успешно!');
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'moderator': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-muted';
    }
  };

  const deleteTopic = (topicId: string) => {
    setTopics(topics.filter(t => t.id !== topicId));
    toast.success('Тема удалена');
  };

  const togglePin = (topicId: string) => {
    setTopics(topics.map(t => t.id === topicId ? { ...t, isPinned: !t.isPinned } : t));
    toast.success('Статус закрепления изменён');
  };

  const toggleLock = (topicId: string) => {
    setTopics(topics.map(t => t.id === topicId ? { ...t, isLocked: !t.isLocked } : t));
    toast.success('Статус блокировки изменён');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Icon name="Gamepad2" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  CRMP Forum
                </h1>
                <p className="text-xs text-muted-foreground">Официальный форум сервера</p>
              </div>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('profile')}>
                  <Avatar className="w-6 h-6 mr-2">
                    <AvatarFallback className="bg-primary text-xs">
                      {currentUser.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  {currentUser.username}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCurrentUser(null)}>
                  <Icon name="LogOut" size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Войти</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Вход в систему</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Логин</Label>
                        <Input placeholder="Введите логин" />
                      </div>
                      <div>
                        <Label>Пароль</Label>
                        <Input type="password" placeholder="Введите пароль" />
                      </div>
                      <Button className="w-full" onClick={handleLogin}>Войти</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">Регистрация</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Регистрация</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Логин</Label>
                        <Input placeholder="Выберите логин" />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input type="email" placeholder="Введите email" />
                      </div>
                      <div>
                        <Label>Пароль</Label>
                        <Input type="password" placeholder="Придумайте пароль" />
                      </div>
                      <Button className="w-full" onClick={handleRegister}>Зарегистрироваться</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="forum">
              <Icon name="Home" size={16} className="mr-2" />
              Главная
            </TabsTrigger>
            {currentUser && (
              <TabsTrigger value="profile">
                <Icon name="User" size={16} className="mr-2" />
                Профиль
              </TabsTrigger>
            )}
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="admin">
                <Icon name="Shield" size={16} className="mr-2" />
                Администрирование
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="forum" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in">
                  <div className={`h-2 bg-gradient-to-r ${category.color}`} />
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon name={category.icon as any} size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          {category.topics} тем
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="animate-fade-in">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="TrendingUp" size={24} className="text-primary" />
                    <h2 className="text-xl font-bold">Активные темы</h2>
                  </div>
                  {currentUser && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Icon name="Plus" size={16} className="mr-2" />
                          Создать тему
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Новая тема</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Раздел</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите раздел" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Заголовок</Label>
                            <Input placeholder="Введите заголовок темы" />
                          </div>
                          <div>
                            <Label>Сообщение</Label>
                            <Textarea placeholder="Напишите ваше сообщение" rows={6} />
                          </div>
                          <Button className="w-full" onClick={() => toast.success('Тема создана!')}>
                            Опубликовать
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              <div className="divide-y divide-border">
                {topics.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map((topic) => (
                  <div key={topic.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className={`${getRoleBadgeColor(topic.author.role)} text-white`}>
                          {topic.author.username[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {topic.isPinned && (
                                <Badge variant="default" className="text-xs">
                                  <Icon name="Pin" size={12} className="mr-1" />
                                  Закреплено
                                </Badge>
                              )}
                              {topic.isLocked && (
                                <Badge variant="secondary" className="text-xs">
                                  <Icon name="Lock" size={12} className="mr-1" />
                                  Закрыто
                                </Badge>
                              )}
                              <h3 className="font-semibold text-base hover:text-primary transition-colors cursor-pointer">
                                {topic.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                Автор: 
                                <span className={`font-medium ${topic.author.role === 'admin' ? 'text-primary' : topic.author.role === 'moderator' ? 'text-blue-400' : ''}`}>
                                  {topic.author.username}
                                </span>
                                <Badge variant="outline" className="text-xs ml-1">{topic.author.rank}</Badge>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="MessageSquare" size={14} />
                            {topic.replies}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Eye" size={14} />
                            {topic.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Clock" size={14} />
                            {topic.lastActivity}
                          </span>
                        </div>

                        {currentUser?.role === 'admin' && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" onClick={() => togglePin(topic.id)}>
                              <Icon name="Pin" size={14} />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toggleLock(topic.id)}>
                              <Icon name="Lock" size={14} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteTopic(topic.id)}>
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {currentUser && (
            <TabsContent value="profile" className="space-y-6">
              <Card className="animate-fade-in">
                <div className="p-6">
                  <div className="flex items-start gap-6 mb-6">
                    <Avatar className="w-24 h-24">
                      <AvatarFallback className={`${getRoleBadgeColor(currentUser.role)} text-white text-3xl`}>
                        {currentUser.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold">{currentUser.username}</h2>
                        <Badge className={getRoleBadgeColor(currentUser.role)}>
                          {currentUser.role === 'admin' ? 'Администратор' : currentUser.role === 'moderator' ? 'Модератор' : 'Пользователь'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">Ранг: {currentUser.rank}</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-lg bg-muted">
                          <div className="text-2xl font-bold text-primary">{currentUser.posts}</div>
                          <div className="text-xs text-muted-foreground">Сообщений</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted">
                          <div className="text-2xl font-bold text-secondary">{currentUser.reputation}</div>
                          <div className="text-xs text-muted-foreground">Репутация</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted">
                          <div className="text-2xl font-bold text-accent">Активен</div>
                          <div className="text-xs text-muted-foreground">Статус</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )}

          {currentUser?.role === 'admin' && (
            <TabsContent value="admin" className="space-y-6">
              <Card className="animate-fade-in">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Icon name="Shield" size={24} className="text-primary" />
                    Панель администратора
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Icon name="Users" size={18} />
                      Управление пользователями
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>P</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">Player_456</div>
                            <div className="text-xs text-muted-foreground">Новичок</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Select defaultValue="user">
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Пользователь</SelectItem>
                              <SelectItem value="moderator">Модератор</SelectItem>
                              <SelectItem value="admin">Администратор</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={() => toast.success('Роль изменена')}>
                            Сохранить
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Icon name="FolderPlus" size={18} />
                      Создать новый раздел
                    </h3>
                    <div className="grid gap-4">
                      <Input placeholder="Название раздела" />
                      <Input placeholder="Описание раздела" />
                      <Button onClick={() => toast.success('Раздел создан!')}>
                        <Icon name="Plus" size={16} className="mr-2" />
                        Создать раздел
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Icon name="Activity" size={18} />
                      Статистика форума
                    </h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <Card className="p-4 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                        <div className="text-3xl font-bold text-primary mb-1">1,234</div>
                        <div className="text-sm text-muted-foreground">Всего пользователей</div>
                      </Card>
                      <Card className="p-4 text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                        <div className="text-3xl font-bold text-blue-500 mb-1">6,789</div>
                        <div className="text-sm text-muted-foreground">Всего тем</div>
                      </Card>
                      <Card className="p-4 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                        <div className="text-3xl font-bold text-green-500 mb-1">45,123</div>
                        <div className="text-sm text-muted-foreground">Всего сообщений</div>
                      </Card>
                      <Card className="p-4 text-center bg-gradient-to-br from-orange-500/10 to-red-500/10">
                        <div className="text-3xl font-bold text-orange-500 mb-1">234</div>
                        <div className="text-sm text-muted-foreground">Онлайн сейчас</div>
                      </Card>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Icon name="Gamepad2" size={20} className="text-white" />
              </div>
              <div>
                <div className="font-bold">CRMP Forum</div>
                <div className="text-xs text-muted-foreground">© 2024 Все права защищены</div>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">О нас</a>
              <a href="#" className="hover:text-primary transition-colors">Правила</a>
              <a href="#" className="hover:text-primary transition-colors">Поддержка</a>
              <a href="#" className="hover:text-primary transition-colors">Контакты</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
