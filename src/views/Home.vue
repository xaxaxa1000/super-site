<template>
  <div class="video-page">
    <h1>Video Gallery</h1>
    <div v-if="loading">Loading...</div>
    <div v-else class="video-grid">
      <div v-for="video in videos" :key="video.id" class="video-item">
        <iframe
          class="video-iframe"
          :src="getYoutubeEmbedUrl(video.url)"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        <h3>{{ video.title }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const videos = ref([
  // Пример данных (в реальном приложении данные будут приходить с бэкенда)
  {
    id: 1,
    title: "Пример видео с YouTube",
    url: "https://www.youtube.com/watch?v=zlBWZEJ_nh8"
  },
  {
    id: 2,
    title: "Короткая ссылка YouTube",
    url: "https://youtu.be/dQw4w9WgXcQ"
  }
])

const loading = ref(false)

// Функция для преобразования YouTube URL в embed-версию
const getYoutubeEmbedUrl = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  const videoId = (match && match[2].length === 11) ? match[2] : null
  return `https://www.youtube.com/embed/${videoId}`
}
</script>

<style>
.video-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.video-item {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
}

.video-iframe {
  width: 100%;
  height: 200px;
  border: none;
  border-radius: 4px;
}
</style>