<template>
  <div class="lab-container">
    <!-- Информация о задании -->
    <div class="lab-info">
      <h2>{{ task.name }}</h2>
      <p>{{ task.description }}</p>
    </div>

    <!-- Блок с перетаскиваемыми элементами -->
    <draggable v-model="blocks" tag="div" item-key="id" class="block-list"  :options="{axis: 'x',handle: null}">
      <div
          v-for="element in blocks"
          :key="element.id"
          class="draggable-block"
      >
        {{ element.content }}
      </div>
    </draggable>

    <!-- Кнопка завершения и статус -->
    <div class="controls">
      <button
          @click="submitLab"
          :disabled="isSubmitted || !isOrderValid"
          class="finish-btn"
      >
        {{ isSubmitted ? 'Завершено' : 'Завершить' }}
      </button>
      <div v-if="showFeedback" class="feedback">
        {{ feedbackMessage }}
      </div>
    </div>

    <!-- Результаты -->
    <div v-if="showResults" class="results-container">
      <div class="result-card">
        <h3>Результат:</h3>
        <p>Статус: <span :class="isCorrect ? 'success' : 'error'">{{ isCorrect ? 'Верно' : 'Неверно' }}</span></p>
        <div v-if="!isCorrect">
          <p>Правильный порядок:</p>
          <div class="correct-order">
            {{ correctOrder.map(b => b.content).join(' → ') }}
          </div>
        </div>
        <button @click="goToHomePage" class="return-btn">
          Вернуться к заданиям
        </button>
      </div>
    </div>
  </div>
</template>


<script>
import { VueDraggableNext } from "vue-draggable-next";
export default {
  components: {
    draggable: VueDraggableNext,
  },
  data() {
    return {
      taskId: this.$route.params.taskId,
      task: {},
      blocks: [],
      correctOrder: [],
      isSubmitted: false,
      showResults: false,
      isCorrect: false,
      feedbackMessage: '',
      drag: false,
      showFeedback: false // Добавьте это свойство
    };
  },
  computed: {
    isOrderValid() {
      return this.blocks.length === this.correctOrder.length;
    }
  },
  mounted() {
    this.fetchLabTask();
  },
  methods: {
    async fetchLabTask() {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/lab/tasks/${this.taskId}`);
        const data = await response.json();
        this.task = data.task;
        console.log('Загруженные блоки:', data.blocks); // Проверьте в консоли
        this.blocks = data.blocks;
        this.correctOrder = data.blocks.slice().sort((a, b) => a.correct_order - b.correct_order);
      } catch (error) {
        console.error('Ошибка загрузки задания:', error);
      }
    },
    checkOrder() {
      this.feedbackMessage = this.isOrderCorrect()
          ? 'Порядок верный!'
          : 'Попробуйте еще раз';
      this.showFeedback = true; // Показываем фидбэк
    },
    isOrderCorrect() {
      return this.blocks
              .map(b => b.id)
              .join(',') ===
          this.correctOrder
              .map(b => b.id)
              .join(',');
    },
    async submitLab() {
      if (!this.isOrderCorrect()) {
        this.feedbackMessage = 'Порядок неверный. Попробуйте еще раз';
        this.showFeedback = true; // Показываем фидбэк
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) return alert('Авторизуйтесь для отправки');

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/lab/results`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            task_id: this.taskId,
            order: this.blocks.map(b => b.id)
          })
        });

        if (response.ok) {
          this.isSubmitted = true;
          this.isCorrect = true;
          this.showResults = true;
        } else {
          throw new Error('Ошибка отправки');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        this.feedbackMessage = 'Ошибка сохранения. Попробуйте позже';
      }
    },
    goToHomePage() {
      this.$router.push('/'); // Укажите ваш путь
    }
  }
};
</script>

<style>
.lab-container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

/* Стили для контейнера с блоками */
.block-list {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  margin: 2rem 0;
  min-height: 100px;
  max-width: 100%;
  resize: horizontal; /* Для растягивания (опционально) */
  border: 1px solid #ddd;
  padding: 5px;
}

/* Стили для отдельных блоков */
.draggable-block {
  width: 150px; /* Фиксированная ширина */
  padding: 15px;
  background: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 5px 10px;
  cursor: grab;
  transition: background 0.3s;
  white-space: nowrap;
}

.draggable-block:hover {
  background: #e0e0e0;
}

.controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.feedback {
  margin-top: 10px;
  font-weight: bold;
}

.feedback.success {
  color: green;
}

.feedback.error {
  color: red;
}

.finish-btn {
  padding: 12px 24px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.finish-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.results-container {
  margin-top: 2rem;
  text-align: center;
}

.result-card {
  background: white;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.correct-order {
  font-weight: bold;
  margin-top: 10px;
  padding: 10px;
  background: #f0f0f0;
  border-radius: 4px;
}

.success {
  color: green;
}

.error {
  color: red;
}

.return-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>


