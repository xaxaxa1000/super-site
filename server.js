const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt'); // Для хеширования паролей
const jwt = require('jsonwebtoken'); // Для работы с JWT
const nodemailer = require('nodemailer');
const uuidv4 = require('uuid').v4; // Исправленный импорт
require('dotenv').config(); // Для загрузки переменных окружения
const crypto = require('crypto');

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

const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Нет токена авторизации' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Проверка наличия userId
    if (!decoded.userId) {
      return res.status(403).json({ message: 'Токен не содержит userId' });
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('JWT error:', error);
    res.status(403).json({ message: 'Неверный или просроченный токен' });
  }
};
const allowedOrigins = [
  'http://localhost:5173',
  'http://25.54.39.23:5173', // Добавьте ваш IP
  'http://localhost:3000', // Бэкенд,
  'http://25.54.39.23:3000' // Бэкенд
];

// Настройка CORS и middleware остаются без изменений
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
  WHERE is_public = 1;
    `);

    res.json(rows);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Получение списка всех публичных видео из таблицы video_applicant
app.get('/api/videos-applicant', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching applicant videos`);

    const [rows] = await pool.query(`
      SELECT id, title, url, preview_image_url, duration 
      FROM video_applicant 
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

    // Хешируем полученный пароль (уже хеш от клиента)
    //const receivedHash = crypto.createHash('sha256').update(password).digest('hex');

    // Сравниваем хеши
    if (password !== user.password_hash) {
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


    // Ссылка для сброса
    const resetLink = `${process.env.SER_FRONTEND}/reset?token=${token}`;

    // HTML-письмо
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Восстановление пароля',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Восстановление пароля</h2>
          <p style="font-size: 16px; color: #555;">
            Мы получили запрос на восстановление пароля. Если это были вы — нажмите кнопку ниже:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #007BFF; color: white; padding: 14px 24px; text-decoration: none; font-size: 16px; border-radius: 4px; display: inline-block;">
              Сбросить пароль
            </a>
          </div>
          <p style="color: #888; font-size: 14px; text-align: center;">
            Ссылка действует 1 час. Если вы не запрашивали сброс пароля — проигнорируйте это письмо.
          </p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
          <p style="text-align: center; color: #aaa; font-size: 12px;">
            © ${new Date().getFullYear()} СИБ ВГТУ. Все права защищены.
          </p>
        </div>
      `
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

    // 3. ❗️Проверка: пароль должен быть SHA-256 хешем (64 символа)
    if (newPassword.length !== 64 || !/^[a-f0-9]{64}$/i.test(newPassword)) {
      return res.status(400).json({ message: 'Пароль должен быть SHA-256 хешем' });
    }

    // 4. Сохранить хеш напрямую в БД (без повторного хеширования)
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      newPassword,
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

app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, userType, group, password } = req.body;

    // Проверка обязательных полей
    if (!firstName || !lastName || !email || !userType || !password) {
      return res.status(400).json({ message: 'Заполните все обязательные поля' });
    }

    // Проверка допустимых типов пользователя
    const validUserTypes = ['student', 'applicant', 'teacher'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({ message: 'Недопустимый тип пользователя' });
    }

    // Проверка группы для студентов
    if (userType === 'student' && !group) {
      return res.status(400).json({ message: 'Группа обязательна для студентов' });
    }

    // Проверка существования пользователя
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // ❗️Проверка: пароль должен быть SHA-256 хешем (64 символа)
    if (password.length !== 64 || !/^[a-f0-9]{64}$/i.test(password)) {
      return res.status(400).json({ message: 'Пароль должен быть SHA-256 хешем' });
    }

    // Сохранение в БД (без хеширования на сервере)
    await pool.query(
        'INSERT INTO users (first_name, last_name, email, user_type, study_group, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
        [firstName, lastName, email, userType, group || null, password] // Пароль уже хеширован
    );

    res.status(200).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Исправленный маршрут /api/user/me
app.get('/api/user/me', authenticateToken, async (req, res) => { // ✅ Добавлен middleware
  try {
    // Теперь req.userId доступен из middleware
    const [user] = await pool.query(`
      SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        avatar_url, 
        created_at, 
        study_group, 
        user_type 
      FROM users 
      WHERE id = ?`,
        [req.userId] // ✅ Используем userId из middleware
    );

    if (!user[0]) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user[0]);
  } catch (error) {
    console.error('User fetch error:', error.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/api/tests/:id', async (req, res) => {
  try {
    const testId = req.params.id;
    const [test] = await pool.query('SELECT * FROM tests WHERE id = ?', [testId]);
    if (!test[0]) {
      return res.status(404).json({ message: 'Тест не найден' });
    }

    // Выбираем случайные вопросы из пула
    const [questions] = await pool.query(`
      SELECT
        q.id,
        q.question_text,
        q.question_type,
        GROUP_CONCAT(
            JSON_OBJECT(
                'id', a.id,
                'text', a.answer_text,
                'is_correct', a.is_correct
            )
              SEPARATOR ','
        ) AS answers_json
      FROM questions q
             JOIN answers a ON q.id = a.question_id
             JOIN test_questions tq ON q.id = tq.question_id
      WHERE tq.test_id = ?
      GROUP BY q.id, q.question_text, q.question_type
      ORDER BY RAND() -- Случайная сортировка
      LIMIT ? -- Ограничиваем количество
    `, [testId, test[0].num_questions]);

    // Преобразуем JSON-строку в массив
    questions.forEach(question => {
      question.answers = JSON.parse(`[${question.answers_json}]`);
    });

    res.json({
      test: test[0],
      questions: questions
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

app.post('/api/test-sessions', authenticateToken, async (req, res) => {
  try {
    const {
      test_id,
      answers,
      total_score,
      correct_answers,
      total_questions
    } = req.body;
    const userId = req.userId;

    await pool.query(`
      INSERT INTO test_sessions (
        user_id,
        test_id,
        total_score,
        correct_answers,
        total_questions,
        answers_data
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      userId,
      test_id,
      total_score,
      correct_answers,
      total_questions,
      JSON.stringify(answers)
    ]);

    res.status(201).json({ message: 'Тест сохранен' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/video-tests/:videoId', async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const [test] = await pool.query(`
      SELECT t.* 
      FROM tests t 
      JOIN video_tests vt ON t.id = vt.test_id 
      WHERE vt.video_id = ?
    `, [videoId]);

    if (test.length === 0) return res.status(404).json({ message: 'Тест не найден' });
    res.json(test[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Оставьте только один обработчик:
app.post('/api/lab/results', authenticateToken, async (req, res) => {
  try {
    const { lab_id, results, attempt_time, total_score } = req.body;
    const userId = req.userId;

    // Убедитесь, что lab_id существует (можно добавить проверку)
    // ...

    // Удалили task_id из запроса
    await pool.query(`
      INSERT INTO lab_results (user_id, lab_id, results, attempt_time, total_score)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, lab_id, results, attempt_time, total_score]);

    res.status(201).json({ message: 'Результат сохранен' });
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});



// Маршруты для связи видео и лабораторных заданий
app.get('/api/video-labworks/:videoId', async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const [lab] = await pool.query(`
      SELECT lt.*
      FROM lab_tasks lt
      JOIN video_lab_links vll ON lt.id = vll.task_id
      WHERE vll.video_id = ?
    `, [videoId]);
    res.json(lab[0] || { message: 'Лабораторная не найдена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение задания по ID
app.get('/api/lab/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const [task] = await pool.query('SELECT * FROM lab_tasks WHERE id = ?', [taskId]);
    if (!task[0]) return res.status(404).json({ message: 'Задание не найдено' });

    // Получение блоков задания
    const [blocks] = await pool.query(`
      SELECT * 
      FROM lab_blocks 
      WHERE task_id = ?
      ORDER BY correct_order
    `, [taskId]);

    res.json({ task: task[0], blocks });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Новый маршрут: Получение всех заданий лабораторной по lab_id
app.get('/api/lab/:labId/tasks', async (req, res) => {
  try {
    const labId = req.params.labId;
    const [tasks] = await pool.query(`
      SELECT * 
      FROM lab_tasks 
      WHERE lab_id = ?
      ORDER BY created_at ASC
    `, [labId]);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
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
    error: process.env.NODE_ENV === 'development' ? err : {},

  });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log('--------------------------------------------------');
  console.log(`[${new Date().toISOString()}] Server started`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Listening on: http://localhost:${PORT}`);
  console.log('--------------------------------------------------');
});