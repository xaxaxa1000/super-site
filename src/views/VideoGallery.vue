<template>
  <div class="video-gallery">
    <!-- Секция загрузки/ошибок -->
    <div v-if="loading" class="loading-message">Загрузка...</div>
    <div v-else-if="error" class="error-message">
      Ошибка загрузки: {{ error }}
    </div>

    <!-- Основной контент -->
    <div v-else class="gallery-container">
      <!-- Сетка видео -->
      <div class="video-grid">
        <router-link
            v-for="video in videos"
            :key="video.id"
            :to="{ name: 'video', params: { id: video.id } }"
            class="video-card"
        >
          <!-- Превью видео -->
          <div class="thumbnail-container">
            <img
                :src="video.thumbnailUrl"
                alt="Миниатюра видео"
                class="thumbnail"
                loading="lazy"
            >
          </div>

          <!-- Информация о видео -->
          <div class="video-info">
            <h3 class="title">{{ video.title }}</h3>
            <p class="description">{{ video.description }}</p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Хранение данных
const videos = ref([])
const loading = ref(true)
const error = ref(null)

// Парсинг ID видео из URL
// Парсинг ID видео из URL
const getVideoId = (url) => {
  // YouTube
  const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|&v=))([\w-]{11})/i
  const ytMatch = url.match(ytRegex)
  if (ytMatch) return { platform: 'youtube', id: ytMatch[1] }

  // Rutube (обновленное регулярное выражение)
  const rutubeRegex = /rutube\.ru\/video\/(?:[^\/]+\/)?([a-f0-9]{32})/i
  const rutubeMatch = url.match(rutubeRegex)
  if (rutubeMatch) return { platform: 'rutube', id: rutubeMatch[1] }

  return null
}

// Получение URL превью
const getThumbnail = (url) => {
  const videoId = getVideoId(url)
  if (!videoId) return '/placeholder.jpg'

  switch(videoId.platform) {
    case 'youtube':
      return `https://i.ytimg.com/vi/${videoId.id}/hqdefault.jpg`
    case 'rutube':

      return `https://rutube.ru/api/video/${videoId.id}/thumbnail/?redirect=1`
    default:
      return '/placeholder.jpg'
  }
}

// Загрузка данных
const fetchVideos = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/videos`)
    if (!response.ok) throw new Error('Ошибка сети')

    const data = await response.json()
    videos.value = data.map(video => ({
      ...video,
      thumbnailUrl: getThumbnail(video.url)
    }))

  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Жизненный цикл
onMounted(() => {
  fetchVideos()
})
</script>

<style scoped>
.video-gallery {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.video-card {
  text-decoration: none;
  color: inherit;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.video-card:hover {
  transform: translateY(-3px);
}

.thumbnail-container {
  aspect-ratio: 16/9;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info {
  padding: 12px;
}

.title {
  font-size: 1.1em;
  margin-bottom: 8px;
  color: #2c2c2c;
}

.description {
  font-size: 0.9em;
  color: #666;
  line-height: 1.4;
}

.loading-message {
  padding: 20px;
  text-align: center;
  color: #666;
}

.error-message {
  padding: 20px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
}
</style>