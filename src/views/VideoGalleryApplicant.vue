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
        <div
            v-for="video in videos"
            :key="video.id"
            class="video-card"
            @click="showVideo(video)"
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
        </div>
      </div>

      <!-- Модальное окно -->
      <div v-if="currentVideo" class="modal-overlay" @click="closeVideo">
        <div class="modal-content" @click.stop>
          <button class="close-btn" @click="closeVideo">&times;</button>
          <div class="video-player">
            <iframe
                :src="getEmbedUrl(currentVideo.url)"
                width="720"
                height="405"
                frameborder="0"
                allow="clipboard-write; autoplay"
                allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
//import { getVideoId } from '@/utils' // Проверьте путь к utils.js

// Хранимые данные
const videos = ref([]);
const loading = ref(true);
const error = ref(null);
const currentVideo = ref(null);

// Функция для извлечения ID видео
const getVideoId = (url) => {
  const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|&v=))([\w-]{11})/i;
  const ytMatch = url.match(ytRegex);
  if (ytMatch) return { platform: 'youtube', id: ytMatch[1] };

  const rutubeRegex = /rutube\.ru\/video\/(?:[^\/]+\/)?([a-f0-9]{32})/i;
  const rutubeMatch = url.match(rutubeRegex);
  if (rutubeMatch) return { platform: 'rutube', id: rutubeMatch[1] };

  return null;
};


// Функция получения embed URL
const getEmbedUrl = (url) => {
  const videoId = getVideoId(url);
  console.log(`https://rutube.ru/play/embed/${videoId.id}`);
  if (!videoId) return '';
  switch (videoId.platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId.id}`;
    case 'rutube':
      return `https://rutube.ru/play/embed/${videoId.id}/`;
    default:
      return '';
  }
};// Показ видео в модальном окне
const showVideo = (video) => {
  currentVideo.value = video;
};

// Закрытие модального окна
const closeVideo = () => {
  currentVideo.value = null;
};

// Вместо этого используйте preview_image_url из данных
const fetchVideos = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/videos-applicant`);
    if (!response.ok) throw new Error('Ошибка сети');

    const data = await response.json();
    videos.value = data.map(video => ({
      ...video,
      thumbnailUrl: video.preview_image_url || '/placeholder.jpg' // Используем прямое поле
    }));

  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Получение URL превью
const getThumbnail = (url) => {
  const videoId = getVideoId(url);
  if (!videoId) return '/placeholder.jpg';

  switch (videoId.platform) {
    case 'youtube':
      return `https://i.ytimg.com/vi/ ${videoId.id}/hqdefault.jpg`;
    case 'rutube':
      return `https://rutube.ru/api/video/ ${videoId.id}/thumbnail/?redirect=1`;
    default:
      return '/placeholder.jpg';
  }
};

// Загрузка при монтировании
fetchVideos()
</script>

<style scoped>
/* Основные стили */
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
  cursor: pointer;
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

/* Стили модального окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 80%;
  max-height: 90%;
  overflow: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
  color: #666;
  background: none;
  border: none;
  cursor: pointer;
}

.video-player iframe {
  width: 100%;
  height: 550px;
  border-radius: 4px;
  margin: 20px 0;
}

@media (max-width: 768px) {
  .video-player iframe {
    height: 300px;
  }
}
</style>