const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt'); // Для хеширования паролей
const jwt = require('jsonwebtoken'); // Для работы с JWT
const nodemailer = require('nodemailer');
const uuidv4 = require('uuid').v4; // Исправленный импорт
require('dotenv').config(); // Для загрузки переменных окружения

const app = express();

// Настройка подключения к MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, // Ваш пользователь MySQL
  password: process.env.DB_PASSWORD, // Ваш пароль
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Настройка CORS и middleware остаются без изменений
app.use(cors({
  origin: process.env.SER_FRONTEND,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());

// Кастомный логгер
app.use((req, res, next) => {
  console.log('--------------------------------------------------');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Получение списка всех публичных видео
app.get('/api/videos', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching all videos`);

    const [rows] = await pool.query(`
      SELECT id, title, url, preview_image_url, duration 
      FROM videos 
      WHERE is_public = 1
    `);

    res.json(rows);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Получение конкретного видео по ID
app.get('/api/videos/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    console.log(`[${new Date().toISOString()}] Fetching video with ID: ${videoId}`);

    const [rows] = await pool.query(`
      SELECT * 
      FROM videos 
      WHERE id = ?
    `, [videoId]);

    if (rows.length === 0) {
      console.warn(`[${new Date().toISOString()}] Video not found: ${videoId}`);
      return res.status(404).json({ message: 'Video not found', requestedId: videoId });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Остальные маршруты и middleware остаются без изменений
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Video API is running',
    availableEndpoints: [
      { method: 'GET', path: '/api/videos', description: 'Список всех публичных видео' },
      { method: 'GET', path: '/api/videos/:id', description: 'Детали видео по ID' }
    ]
  });
});

// Маршрут аутентификации
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверяем обязательные поля
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Ищем пользователя в БД
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Сравниваем хеши паролей
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Генерируем JWT-токен
    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Настройка Nodemailer (пример для Gmail)
const transporter = nodemailer.createTransport({
  service: 'yandex',
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD // Используйте environment variables для безопасности!
  }
});

// Маршрут для запроса сброса пароля
// Добавьте async перед (req, res)
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Проверка существования пользователя
    const [user] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(404).send('Пользователь не найден');
    }

    // Генерация токена
    const token = uuidv4(); // Теперь работает!
    const expiresAt = new Date(Date.now() + 3600000); // 1 час

    // Сохранение токена в БД
    await pool.query('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [
      user[0].id,
      token,
      expiresAt
    ]);

    // Отправка письма
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Сброс пароля',
      text: `Перейдите по ссылке: ${process.env.SER_FRONTEND}/reset?token=${token}`
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error(error);
        res.status(500).send('Ошибка отправки письма');
      } else {
        res.status(200).send('Письмо отправлено');
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).send('Ошибка сервера');
  }
});

// Маршрут подтверждения сброса пароля
app.post('/api/reset-password/confirm', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // 1. Найти токен в БД
    const [tokens] = await pool.query('SELECT * FROM password_reset_tokens WHERE token = ?', [token]);
    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Неверный или просроченный токен' });
    }

    const resetToken = tokens[0];
    const now = new Date();

    // 2. Проверить срок действия токена (например, 1 час)
    if (now > resetToken.expires_at) {
      return res.status(400).json({ message: 'Срок действия токена истек' });
    }

    // 3. Хешировать новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Обновить пароль пользователя
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      hashedPassword,
      resetToken.user_id
    ]);

    // 5. Удалить использованный токен
    await pool.query('DELETE FROM password_reset_tokens WHERE token = ?', [token]);

    res.status(200).json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обработка 404
app.use((req, res) => {
  console.warn(`[${new Date().toISOString()}] 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// Централизованная обработка ошибок
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Global Error Handler:`, err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('--------------------------------------------------');
  console.log(`[${new Date().toISOString()}] Server started`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Listening on: http://localhost:${PORT}`);
  console.log('--------------------------------------------------');
});