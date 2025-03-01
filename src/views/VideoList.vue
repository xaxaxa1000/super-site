<template>
  <div class="video-list">
    <h1>Video Gallery</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error-message">Error loading videos: {{ error }}</div>
    <div v-else class="video-grid">
      <router-link
          v-for="video in videos"
          :key="video.id"
          :to="{ name: 'VideoPlayer', params: { id: video.id } }"
          class="video-preview"
      >
        <img
            :src="getThumbnailUrl(video.url)"
            alt="Video thumbnail"
            class="thumbnail"
        >
        <h3 class="title">{{ video.title }}</h3>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const videos = ref([])
const loading = ref(true)
const error = ref(null)

// Получение ID видео из URL YouTube
const getVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

// Получение URL превью
const getThumbnailUrl = (url) => {
  const videoId = getVideoId(url)
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

// Загрузка данных с сервера
const fetchVideos = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/videos')
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    videos.value = await response.json()
    error.value = null
  } catch (err) {
    console.error('Error fetching videos:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Загрузка данных при монтировании компонента
onMounted(() => {
  fetchVideos()
})
</script>

<style>
/* Стили остаются без изменений */
.video-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.video-preview {
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s;
  cursor: pointer;
}

.video-preview:hover {
  transform: translateY(-5px);
}

.thumbnail {
  width: 100%;
  height: 180px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.title {
  margin-top: 10px;
  font-size: 1.1em;
  color: #333;
}

.error-message {
  color: #ff4444;
  padding: 20px;
  text-align: center;
}
</style>