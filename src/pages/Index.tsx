import { useState, useEffect } from 'react';
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
import { api, User as ApiUser, Category as ApiCategory, Topic as ApiTopic } from '@/lib/api';

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
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loginUsername, setLoginUsername] = useState('');
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, topicsData] = await Promise.all([
        api.getCategories(),
        api.getTopics()
      ]);
      
      setCategories(categoriesData.map(c => ({
        id: String(c.id),
        name: c.name,
        description: c.description,
        topics: c.topics_count,
        icon: c.icon,
        color: c.color
      })));

      setTopics(topicsData.map(t => ({
        id: String(t.id),
        title: t.title,
        author: {
          id: String(t.author_id),
          username: t.author_username || 'Unknown',
          avatar: '',
          role: (t.author_role as UserRole) || 'user',
          rank: t.author_rank || 'Новичок',
          posts: t.author_posts || 0,
          reputation: t.author_reputation || 0
        },
        replies: t.replies_count,
        views: t.views_count,
        lastActivity: formatTimeAgo(t.seconds_ago || 0),
        isPinned: t.is_pinned,
        isLocked: t.is_locked,
        category: String(t.category_id)
      })));

      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Ошибка загрузки данных');
      setLoading(false);
    }
  };

  const formatTimeAgo = (seconds: number): string => {
    if (seconds < 60) return 'только что';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} минут назад`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} часов назад`;
    return `${Math.floor(seconds / 86400)} дней назад`;
  };

  const handleLogin = async () => {
    try {
      const user = await api.login(loginUsername);
      setCurrentUser({
        id: String(user.id),
        username: user.username,
        avatar: user.avatar_url || '',
        role: user.role,
        rank: user.rank,
        posts: user.posts_count,
        reputation: user.reputation
      });
      setIsLoginOpen(false);
      toast.success('Вы успешно вошли в систему!');
    } catch (error) {
      toast.error('Ошибка входа. Проверьте логин.');
    }
  };

  const handleRegister = async () => {
    try {
      const user = await api.register(registerData.username, registerData.email, registerData.password);
      setCurrentUser({
        id: String(user.id),
        username: user.username,
        avatar: user.avatar_url || '',
        role: user.role,
        rank: user.rank,
        posts: user.posts_count,
        reputation: user.reputation
      });
      setIsRegisterOpen(false);
      toast.success('Регистрация прошла успешно!');
    } catch (error) {
      toast.error('Ошибка регистрации. Попробуйте другой логин.');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'moderator': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-muted';
    }
  };

  const deleteTopic = async (topicId: string) => {
    try {
      await api.archiveTopic(Number(topicId));
      setTopics(topics.filter(t => t.id !== topicId));
      toast.success('Тема удалена');
    } catch (error) {
      toast.error('Ошибка удаления темы');
    }
  };

  const togglePin = async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;
    
    try {
      await api.toggleTopicPin(Number(topicId), !topic.isPinned);
      setTopics(topics.map(t => t.id === topicId ? { ...t, isPinned: !t.isPinned } : t));
      toast.success('Статус закрепления изменён');
    } catch (error) {
      toast.error('Ошибка изменения статуса');
    }
  };

  const toggleLock = async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;
    
    try {
      await api.toggleTopicLock(Number(topicId), !topic.isLocked);
      setTopics(topics.map(t => t.id === topicId ? { ...t, isLocked: !t.isLocked } : t));
      toast.success('Статус блокировки изменён');
    } catch (error) {
      toast.error('Ошибка изменения статуса');
    }
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
                        <Input 
                          placeholder="Введите логин" 
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                        />
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
                        <Input 
                          placeholder="Выберите логин"
                          value={registerData.username}
                          onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input 
                          type="email" 
                          placeholder="Введите email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Пароль</Label>
                        <Input 
                          type="password" 
                          placeholder="Придумайте пароль"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        />
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