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

// Получение ID видео из URL YouTube или Rutube
const getVideoId = (url) => {
  if (!url) return null;

  // YouTube
  const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const youtubeMatch = url.match(youtubeRegExp);
  if (youtubeMatch && youtubeMatch[2].length === 11) {
    console.log('getVideoId result for YouTube:', url, ':', youtubeMatch[2]);
    return { platform: 'youtube', id: youtubeMatch[2] };
  }

  // Rutube
  const rutubeRegExp = /rutube\.ru\/video\/([a-f0-9]{32})/;
  const rutubeMatch = url.match(rutubeRegExp);
  if (rutubeMatch) {
    console.log('getVideoId result for Rutube:', url, ':', rutubeMatch[1]);
    return { platform: 'rutube', id: rutubeMatch[1] };
  }

  console.log('getVideoId result for unknown platform:', url, ': null');
  return null;
}

// Получение URL превью
const getThumbnailUrl = (url) => {
  console.log('getThumbnailUrl called with:', url);

  const videoInfo = getVideoId(url);
  if (!videoInfo) return '/placeholder.jpg'; // Fallback если ID не найден

  if (videoInfo.platform === 'youtube') {
    const thumbnailUrl = `https://img.youtube.com/vi/${videoInfo.id}/hqdefault.jpg`;
    console.log('Extracted YouTube thumbnail URL:', thumbnailUrl);
    return thumbnailUrl;
  } else if (videoInfo.platform === 'rutube') {
    const thumbnailUrl = `https://rutube.ru/api/video/${videoInfo.id}/thumbnail/?redirect=1`;
    console.log('Extracted Rutube thumbnail URL:', thumbnailUrl);
    return thumbnailUrl;
  }

  console.log('Unknown platform, returning placeholder');
  return '/placeholder.jpg';
}

const fetchVideos = async () => {
  try {
    console.log('Sending request to:', 'http://localhost:3000/api/videos');

    const response = await fetch('http://localhost:3000/api/videos');

    // Логируем полную информацию о response
    console.log('Raw response:', response);

    if (!response.ok) {
      const errorMessage = `HTTP error! Status: ${response.status}`;
      console.error('Response not OK:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Логируем полученные данные
    console.log('Received data:', data);

    // Добавляем URL превью к каждому видео
    videos.value = data.map(video => ({
      ...video,
      thumbnailUrl: getThumbnailUrl(video.url)
    }));

    error.value = null;

  } catch (err) {
    console.error('Error details:', err);
    error.value = err.message;

  } finally {
    console.log('Loading completed');
    loading.value = false;
  }
}

// Загрузка данных при монтировании компонента
onMounted(() => {
  fetchVideos();
});
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