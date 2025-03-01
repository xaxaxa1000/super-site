// server.js
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()


// Настройка CORS с логгированием
app.use(cors({
  origin: 'http://localhost:5173', // Укажите адрес вашего фронтенда
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Request-Id']
}))

// Логирование запросов
app.use(morgan('dev'))

// Кастомный логгер для отображения информации о запросах
app.use((req, res, next) => {
  console.log('--------------------------------------------------')
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  console.log('Headers:', req.headers)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body)
  }
  next()
})

// Middleware для парсинга JSON
app.use(express.json())

// Пример базы данных (исправлены повторяющиеся ID)
const videos = [
  {
    id: "zlBWZEJ_nh8",
    title: "Cool Video 1",
    url: "https://www.youtube.com/watch?v=zlBWZEJ_nh8"
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Amazing Video 2",
    url: "https://youtu.be/dQw4w9WgXcQ"
  },
  {
    id: "4UZrsTqkcW4",
    title: "Programming Tutorial",
    url: "https://www.youtube.com/watch?v=4UZrsTqkcW4"
  }
]

// server.js

// ... (предыдущий код)

// Получение списка всех видео
app.get('/api/videos', (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching all videos`)
    const previews = videos.map(video => ({
      id: video.id,
      title: video.title,
      url: video.url
    }))
    res.json(previews)
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error: ${error.message}`)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

// Получение конкретного видео по ID
app.get('/api/videos/:id', (req, res) => {
  try {
    const videoId = req.params.id
    console.log(`[${new Date().toISOString()}] Fetching video with ID: ${videoId}`)

    const video = videos.find(v => v.id === videoId)

    if (!video) {
      console.warn(`[${new Date().toISOString()}] Video not found: ${videoId}`)
      return res.status(404).json({
        message: 'Video not found',
        requestedId: videoId
      })
    }

    res.json(video)
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error: ${error.message}`)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

// Добавьте этот блок перед обработкой 404
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Video API is running',
    availableEndpoints: [
      { method: 'GET', path: '/api/videos', description: 'Список всех видео' },
      { method: 'GET', path: '/api/videos/:id', description: 'Детали видео по ID' }
    ]
  });
});

// Обработка 404 (оставьте этот блок последним)
app.use((req, res) => {
  console.warn(`[${new Date().toISOString()}] 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});


// Централизованная обработка ошибок
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Global Error Handler:`, err)
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  })
})

// Запуск сервера
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('--------------------------------------------------')
  console.log(`[${new Date().toISOString()}] Server started`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Listening on: http://localhost:${PORT}`)
  console.log('--------------------------------------------------')
})