import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Forum API for users, categories, topics and posts
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    path: str = event.get('queryStringParameters', {}).get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            if path == 'categories':
                cursor.execute('''
                    SELECT c.*, 
                           (SELECT COUNT(*) FROM topics t WHERE t.category_id = c.id AND t.is_archived = FALSE) as topics_count
                    FROM categories c
                    ORDER BY c.id
                ''')
                categories = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps([dict(row) for row in categories], default=str)
                }
            
            elif path == 'topics':
                cursor.execute('''
                    SELECT t.*, 
                           u.username as author_username,
                           u.role as author_role,
                           u.rank as author_rank,
                           u.posts_count as author_posts,
                           u.reputation as author_reputation,
                           c.name as category_name,
                           EXTRACT(EPOCH FROM (NOW() - t.updated_at)) as seconds_ago
                    FROM topics t
                    LEFT JOIN users u ON t.author_id = u.id
                    LEFT JOIN categories c ON t.category_id = c.id
                    WHERE t.is_archived = FALSE
                    ORDER BY t.is_pinned DESC, t.updated_at DESC
                    LIMIT 50
                ''')
                topics = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps([dict(row) for row in topics], default=str)
                }
            
            elif path == 'users':
                user_id = event.get('queryStringParameters', {}).get('id')
                if user_id:
                    cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
                    user = cursor.fetchone()
                    if user:
                        return {
                            'statusCode': 200,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'isBase64Encoded': False,
                            'body': json.dumps(dict(user), default=str)
                        }
                
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'User not found'})
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            if path == 'register':
                username = body_data.get('username')
                email = body_data.get('email')
                password = body_data.get('password', 'demo_pass')
                
                cursor.execute('''
                    INSERT INTO users (username, email, password_hash, role, rank)
                    VALUES (%s, %s, %s, 'user', 'Новичок')
                    RETURNING id, username, email, role, rank, posts_count, reputation
                ''', (username, email, password))
                
                user = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps(dict(user), default=str)
                }
            
            elif path == 'login':
                username = body_data.get('username')
                
                cursor.execute('''
                    SELECT id, username, email, avatar_url, role, rank, posts_count, reputation
                    FROM users 
                    WHERE username = %s
                ''', (username,))
                
                user = cursor.fetchone()
                
                if user:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps(dict(user), default=str)
                    }
                
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Invalid credentials'})
                }
            
            elif path == 'topics':
                title = body_data.get('title')
                category_id = body_data.get('category_id')
                author_id = body_data.get('author_id')
                content = body_data.get('content')
                
                cursor.execute('''
                    INSERT INTO topics (title, category_id, author_id)
                    VALUES (%s, %s, %s)
                    RETURNING id
                ''', (title, category_id, author_id))
                
                topic = cursor.fetchone()
                topic_id = topic['id']
                
                cursor.execute('''
                    INSERT INTO posts (topic_id, author_id, content)
                    VALUES (%s, %s, %s)
                ''', (topic_id, author_id, content))
                
                cursor.execute('UPDATE users SET posts_count = posts_count + 1 WHERE id = %s', (author_id,))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'id': topic_id, 'message': 'Topic created'})
                }
            
            elif path == 'categories':
                name = body_data.get('name')
                description = body_data.get('description')
                icon = body_data.get('icon', 'Folder')
                color = body_data.get('color', 'from-gray-500 to-gray-600')
                
                cursor.execute('''
                    INSERT INTO categories (name, description, icon, color)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                ''', (name, description, icon, color))
                
                category = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps(dict(category), default=str)
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            if path == 'users/role':
                user_id = body_data.get('user_id')
                new_role = body_data.get('role')
                
                cursor.execute('UPDATE users SET role = %s WHERE id = %s', (new_role, user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'message': 'Role updated'})
                }
            
            elif path == 'topics/pin':
                topic_id = body_data.get('topic_id')
                is_pinned = body_data.get('is_pinned')
                
                cursor.execute('UPDATE topics SET is_pinned = %s WHERE id = %s', (is_pinned, topic_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'message': 'Topic pin status updated'})
                }
            
            elif path == 'topics/lock':
                topic_id = body_data.get('topic_id')
                is_locked = body_data.get('is_locked')
                
                cursor.execute('UPDATE topics SET is_locked = %s WHERE id = %s', (is_locked, topic_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'message': 'Topic lock status updated'})
                }
            
            elif path == 'topics/archive':
                topic_id = body_data.get('topic_id')
                
                cursor.execute('UPDATE topics SET is_archived = TRUE WHERE id = %s', (topic_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'message': 'Topic archived'})
                }
        
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Endpoint not found'})
        }
    
    finally:
        cursor.close()
        conn.close()
