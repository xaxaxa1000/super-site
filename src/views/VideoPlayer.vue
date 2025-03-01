<template>
  <div class="video-player">
    <div class="back-button">
      <button @click="$router.back()">← Back to List</button>
    </div>
    
    <div class="player-container">
      <iframe
        class="video-iframe"
        :src="embedUrl"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
      <h2 class="video-title">{{ currentVideo.title }}</h2>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const videos = ref([]) // В реальном приложении данные с бэкенда
const currentVideo = ref(null)

// Пример данных (должны совпадать с VideoList.vue)
const exampleVideos = [
  {
    id: 1,
    title: "Cool Video 1",
    url: "https://www.youtube.com/watch?v=zlBWZEJ_nh8"
  },
  {
    id: 2,
    title: "Amazing Video 2",
    url: "https://youtu.be/dQw4w9WgXcQ"
  }
]

const getVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

const embedUrl = computed(() => {
  if (!currentVideo.value) return ''
  const videoId = getVideoId(currentVideo.value.url)
  return `https://www.youtube.com/embed/${videoId}?autoplay=1`
})

onMounted(async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/videos/${route.params.id}`)
    if (!response.ok) throw new Error('Video not found')
    currentVideo.value = await response.json()
  } catch (error) {
    console.error('Error loading video:', error)
    // Можно добавить редирект на 404 страницу
  }
})
</script>

<style>
.video-player {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.back-button {
  margin-bottom: 20px;
}

.back-button button {
  padding: 8px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.back-button button:hover {
  background: #e0e0e0;
}

.player-container {
  max-width: 800px;
  margin: 0 auto;
}

.video-iframe {
  width: 100%;
  height: 450px;
  border: none;
  border-radius: 8px;
}

.video-title {
  margin-top: 20px;
  color: #333;
}
</style>