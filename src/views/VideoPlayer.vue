<template>
  <div class="video-player">
    <div class="back-button">
      <button @click="$router.back()" class="back-btn">
        ← Back to Gallery
      </button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="handleRetry" class="retry-btn">Try Again</button>
    </div>

    <div v-else class="player-container">
      <div class="video-wrapper">
        <iframe
            class="video-iframe"
            :src="embedUrl"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
        ></iframe>
      </div>
      <h2 class="video-title">{{ currentVideo.title }}</h2>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const currentVideo = ref(null)
const loading = ref(true)
const error = ref(null)

// Утилита для получения ID видео из ссылки
const getVideoId = (url) => {
  if (!url) return null

  // YouTube
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) return youtubeMatch[1]

  // Rutube
  const rutubeRegex = /rutube\.ru\/video\/([a-f0-9]{32})/
  const rutubeMatch = url.match(rutubeRegex)
  if (rutubeMatch) return rutubeMatch[1]

  return null
}

// Утилита для определения платформы видео
const getPlatform = (url) => {
  if (!url) return null
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/rutube\.ru/.test(url)) return 'rutube'
  return null
}

const fetchVideo = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/videos/${route.params.id}`)

    // Проверка статуса ответа
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    // Проверка типа контента
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text() // Получаем полный ответ
      console.error('Server returned non-JSON response:', text)
      throw new Error('Invalid response format: expected JSON')
    }

    // Парсинг JSON
    currentVideo.value = await response.json()
    error.value = null
  } catch (err) {
    console.error('Error loading video:', err)
    error.value = err.message || 'Failed to load video data'
  } finally {
    loading.value = false
  }
}

// Вычисляем URL для встраивания видео
const embedUrl = computed(() => {
  if (!currentVideo.value?.url) return ''

  const platform = getPlatform(currentVideo.value.url)
  const videoId = getVideoId(currentVideo.value.url)

  if (platform === 'youtube') {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0`
  } else if (platform === 'rutube') {
    return `https://rutube.ru/play/embed/${videoId}`
  }

  return ''
})

// Вычисляем URL для превью видео
const thumbnailUrl = computed(() => {
  if (!currentVideo.value?.url) return ''

  const platform = getPlatform(currentVideo.value.url)
  const videoId = getVideoId(currentVideo.value.url)

  if (platform === 'youtube') {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  } else if (platform === 'rutube') {
    return `https://rutube.ru/api/video/${videoId}/thumbnail/?redirect=1`
  }

  return ''
})

const handleRetry = () => {
  error.value = null
  loading.value = true
  fetchVideo()
}

fetchVideo()
</script>



<style scoped>
.video-player {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.back-btn {
  padding: 0.8rem 1.5rem;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e0e0e0;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.error-container {
  text-align: center;
  padding: 2rem;
}

.error-message {
  color: #ff4444;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  margin: 1rem 0;
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-title {
  font-size: 1.5rem;
  color: #333;
  margin: 1rem 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>