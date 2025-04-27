<template>
  <div class="video-player">
    <!-- Навигация -->
    <div class="navigation">
      <button @click="$router.back()" class="back-button">
        ← Назад в галерею
      </button>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="loader-container">
      <div class="loader"></div>
    </div>

    <!-- Ошибка -->
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

      <!-- Информация о тесте -->
      <div v-if="test" class="test-info">
        <h3>Тест для видео:</h3>
        <div class="test-details">
          <p>Время: {{ test.time_limit }} мин</p>
          <p>Вопросов: {{ test.num_questions }}</p>
        </div>
      </div>

      <!-- Информация о лабораторной работе -->
      <div v-if="labTask" class="lab-info">
        <h3>Лабораторная работа:</h3>
        <p>Задание: {{ labTask.name }}</p>
      </div>

      <!-- Кнопки действий -->
      <div class="action-buttons">
        <!-- Тест -->
        <button
            @click="showConfirmation = true"
            :disabled="!test"
            class="test-button"
            :class="{ 'button-disabled': !test }"
        >
          {{ test ? 'Начать тест' : 'Тест недоступен' }}
        </button>

        <!-- Лабораторная работа -->
        <button
            @click="goToLabWork"
            class="lab-button"
            :class="{ 'button-disabled': !labAvailable }"
        >
          {{ labAvailable ? 'Перейти к лабораторной' : 'Лабораторная недоступна' }}
        </button>
      </div>

      <!-- Модальное окно подтверждения теста -->
      <div v-if="showConfirmation" class="confirmation-modal">
        <div class="modal-content">
          <h3>Вы готовы начать тест?</h3>
          <div class="test-preview">
            <p>Время: {{ test.time_limit }} мин</p>
            <p>Вопросов: {{ test.num_questions }}</p>
          </div>
          <div class="modal-buttons">
            <button @click="showConfirmation = false" class="cancel-button">Отмена</button>
            <button @click="startTest" class="confirm-button">Начать</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Состояние компонента
const currentVideo = ref({});
const loading = ref(true);
const error = ref(null);
const test = ref(null);
const labTask = ref(null);
const labAvailable = ref(false);
const showConfirmation = ref(false);

// Получение ID видео из URL
const getVideoId = (url) => {
  const ytRegex = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[2].length === 11) return ytMatch[2];

  const rutubeRegex = /rutube\.ru\/video\/([a-f0-9]{32})/;
  const rutubeMatch = url.match(rutubeRegex);
  if (rutubeMatch) return rutubeMatch[1];

  return null;
};

// Формирование URL для плеера
const embedUrl = computed(() => {
  if (!currentVideo.value.url) return '';
  const platform = currentVideo.value.url.includes('youtube') ? 'youtube' : 'rutube';
  const videoId = getVideoId(currentVideo.value.url);
  return platform === 'youtube'
      ? `https://www.youtube.com/embed/${videoId}?autoplay=0`
      : `https://rutube.ru/play/embed/${videoId}`;
});

// Загрузка данных о видео
const fetchVideo = async () => {
  try {
    const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/videos/${route.params.id}`
    );
    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }
    currentVideo.value = await response.json();
    await Promise.all([
      fetchTestForVideo(currentVideo.value.id),
      fetchLabWorkForVideo(currentVideo.value.id),
    ]);
    error.value = null;
  } catch (err) {
    error.value = `Ошибка загрузки видео: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

// Загрузка связанного теста
const fetchTestForVideo = async (videoId) => {
  try {
    const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/video-tests/${videoId}`
    );
    if (response.ok) {
      test.value = await response.json();
    }
  } catch (err) {
    console.error('Ошибка загрузки теста:', err);
  }
};

// Загрузка связанной лабораторной работы
const fetchLabWorkForVideo = async (videoId) => {
  try {
    const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/video-labworks/${videoId}`
    );
    if (response.ok) {
      const labData = await response.json();
      //console.log(labData.id);
      labTask.value = labData.id;
      labAvailable.value = true;
    }
  } catch (err) {
    console.error('Ошибка загрузки лабораторной работы:', err);
  }
};

// Начать тест
const startTest = () => {
  if (test.value) {
    router.push({
      name: 'test',
      params: { testId: test.value.id.toString() },
    });
    showConfirmation.value = false;
  }
};

// Перейти к лабораторной работе
const goToLabWork = () => {
  if (labAvailable.value && labTask.value) {
    router.push({
      name: 'LabTask', // Используйте имя из router/index.js
      params: { taskId: labTask.value } // Передайте ID задания
    });
  }
};

// Обработка повторной загрузки
const handleRetry = () => {
  error.value = null;
  loading.value = true;
  fetchVideo();
};

// Загрузка при монтировании
onMounted(() => {
  fetchVideo();
});
</script>

<style scoped>
.video-player {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  min-height: 80vh;
  background: #f5f5f5;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.navigation {
  margin-bottom: 20px;
}

.back-button {
  background: #e0e0e0;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: #c0c0c0;
}

.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
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
  padding: 2rem;
  background: #ffebee;
  border-radius: 12px;
  margin: 2rem 0;
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
  margin: 2rem 0;
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-details {
  padding: 20px;
  background: white;
  border-radius: 12px;
  margin: 1rem 0;
}

.title {
  font-size: 1.5em;
  margin-bottom: 15px;
  color: #2c3e50;
}

.description {
  color: #555;
  line-height: 1.6;
}

.test-info,
.lab-info {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid #ddd;
}

.test-details,
.lab-info p {
  margin: 0;
  padding: 5px 0;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.test-button,
.lab-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.test-button {
  background: #4CAF50;
  color: white;
}

.test-button:hover {
  background: #45a049;
}

.button-disabled {
  background: #e7e7e7;
  cursor: not-allowed;
}

.lab-button {
  background: #2962FF;
  color: white;
}

.lab-button:hover {
  background: #204EA8;
}

.confirmation-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.test-preview {
  margin: 20px 0;
  padding: 10px;
  background: #f8f8f8;
  border-radius: 8px;
}

.modal-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.cancel-button {
  background: #e7e7e7;
  color: #555;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
}

.confirm-button {
  background: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
}

.cancel-button:hover {
  background: #d9d9d9;
}

.confirm-button:hover {
  background: #45a049;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>