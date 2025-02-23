const express = require('express');
const app = express();
const port = 3000;

// Middleware для обработки JSON
app.use(express.json());

// Простой GET-маршрут
app.get('/', (req, res) => {
  res.send('Добро пожаловать на мой сервер!');
});

// Маршрут с параметром
app.get('/user/:name', (req, res) => {
  res.send(`Привет, ${req.params.name}!`);
});

// POST-маршрут
app.post('/api/data', (req, res) => {
  console.log('Получены данные:', req.body);
  res.json({ status: 'Данные получены', data: req.body });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});