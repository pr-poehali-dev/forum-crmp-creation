const API_URL = 'https://functions.poehali.dev/5fe6dfd0-cf77-48b9-a075-90ffa7dda51b';

export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  role: 'user' | 'moderator' | 'admin';
  rank: string;
  posts_count: number;
  reputation: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  topics_count: number;
}

export interface Topic {
  id: number;
  title: string;
  category_id: number;
  author_id: number;
  replies_count: number;
  views_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  author_username?: string;
  author_role?: string;
  author_rank?: string;
  author_posts?: number;
  author_reputation?: number;
  category_name?: string;
  seconds_ago?: number;
}

export const api = {
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_URL}?path=categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async getTopics(): Promise<Topic[]> {
    const response = await fetch(`${API_URL}?path=topics`);
    if (!response.ok) throw new Error('Failed to fetch topics');
    return response.json();
  },

  async register(username: string, email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}?path=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    if (!response.ok) throw new Error('Failed to register');
    return response.json();
  },

  async login(username: string): Promise<User> {
    const response = await fetch(`${API_URL}?path=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async createTopic(title: string, category_id: number, author_id: number, content: string): Promise<{ id: number }> {
    const response = await fetch(`${API_URL}?path=topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category_id, author_id, content })
    });
    if (!response.ok) throw new Error('Failed to create topic');
    return response.json();
  },

  async createCategory(name: string, description: string, icon: string, color: string): Promise<{ id: number }> {
    const response = await fetch(`${API_URL}?path=categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, icon, color })
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  async updateUserRole(user_id: number, role: string): Promise<void> {
    const response = await fetch(`${API_URL}?path=users/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, role })
    });
    if (!response.ok) throw new Error('Failed to update role');
  },

  async toggleTopicPin(topic_id: number, is_pinned: boolean): Promise<void> {
    const response = await fetch(`${API_URL}?path=topics/pin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id, is_pinned })
    });
    if (!response.ok) throw new Error('Failed to toggle pin');
  },

  async toggleTopicLock(topic_id: number, is_locked: boolean): Promise<void> {
    const response = await fetch(`${API_URL}?path=topics/lock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id, is_locked })
    });
    if (!response.ok) throw new Error('Failed to toggle lock');
  },

  async archiveTopic(topic_id: number): Promise<void> {
    const response = await fetch(`${API_URL}?path=topics/archive`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id })
    });
    if (!response.ok) throw new Error('Failed to archive topic');
  }
};
