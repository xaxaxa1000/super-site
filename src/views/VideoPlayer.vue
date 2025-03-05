<template>
  <div class="video-player">
    <!-- Кнопка назад -->
    <div class="navigation">
      <button @click="$router.back()" class="back-button">
        ← Назад в галерею
      </button>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="loader-container">
      <div class="loader"></div>
    </div>

    <!-- Ошибка загрузки -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">{{ error }}</p>
      <button @click="handleRetry" class="retry-button">Повторить</button>
    </div>

    <!-- Основной контент -->
    <div v-else class="content">
      <!-- Видео плеер -->
      <div class="player-wrapper">
        <iframe
            class="video-iframe"
            :src="embedUrl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
        ></iframe>
      </div>

      <!-- Информация о видео -->
      <div class="video-details">
        <h2 class="title">{{ currentVideo.title }}</h2>
        <p class="description">{{ currentVideo.description || 'Описание отсутствует' }}</p>
      </div>

      <!-- Кнопка тестирования -->
      <div class="action-buttons">
        <button @click="goToTest" class="test-button">Пройти тестирование</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Реактивные данные
const currentVideo = ref({})
const loading = ref(true)
const error = ref(null)

// Получение ID видео из URL
const getVideoId = (url) => {
  // YouTube
  const ytRegex = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/
  const ytMatch = url.match(ytRegex)
  if (ytMatch && ytMatch[2].length === 11) return ytMatch[2]

  // Rutube
  const rutubeRegex = /rutube\.ru\/video\/([a-f0-9]{32})/
  const rutubeMatch = url.match(rutubeRegex)
  if (rutubeMatch) return rutubeMatch[1]

  return null
}

// Формируем URL для встраивания
const embedUrl = computed(() => {
  if (!currentVideo.value.url) return ''

  const platform = currentVideo.value.url.includes('youtube')
      ? 'youtube'
      : 'rutube'
  const videoId = getVideoId(currentVideo.value.url)

  return platform === 'youtube'
      ? `https://www.youtube.com/embed/${videoId}?autoplay=0`
      : `https://rutube.ru/play/embed/${videoId}`
})

// Загрузка данных
const fetchVideo = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/videos/${route.params.id}`)

    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`)
    }

    currentVideo.value = await response.json()
    error.value = null

  } catch (err) {
    console.error('Ошибка загрузки:', err)
    error.value = `Не удалось загрузить видео: ${err.message}`

  } finally {
    loading.value = false
  }
}

// Перезагрузка данных
const handleRetry = () => {
  error.value = null
  loading.value = true
  fetchVideo()
}

// Переход к тестированию
const goToTest = () => {
  router.push({ name: 'test', params: { id: currentVideo.value.id } })
}

// Загружаем при монтировании
onMounted(() => {
  fetchVideo()
})
</script>

<style scoped>
.video-player {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 80vh;
}

.navigation {
  margin-bottom: 20px;
}

.back-button {
  background: #f5f5f5;
  border: 1px solid #ddd;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.back-button:hover {
  background: #e0e0e0;
  transform: translateX(-5px);
}

.loader-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

.error-container {
  text-align: center;
  padding: 40px;
  background: #ffebee;
  border-radius: 8px;
}

.error-text {
  color: #c62828;
  font-size: 1.2em;
  margin-bottom: 15px;
}

.retry-button {
  background: #ff5252;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #e53935;
}

.player-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  margin: 20px 0;
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.video-details {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
}

.title {
  color: #2c3e50;
  margin-bottom: 15px;
}

.description {
  color: #555;
  line-height: 1.6;
}

.action-buttons {
  margin-top: 25px;
}

.test-button {
  background: #4CAF50;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  font-weight: 500;
}

.test-button:hover {
  background: #45a049;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>