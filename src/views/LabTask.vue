<template>
  <div class="lab-container">
    <!-- Список заданий -->
    <div class="task-navigation">
      <h3>Задания:</h3>
      <div
          v-for="(task, index) in tasks"
          :key="task.id"
          @click="selectTask(task.id)"
          :class="{ 'active-task': currentTaskId === task.id }"
          class="task-item"
      >
        {{ index + 1 }}
      </div>
    </div>

    <!-- Информация о текущем задании -->
    <div v-if="task.name" class="lab-info">
      <h2>{{ task.name }}</h2>
      <p>{{ task.description }}</p>
    </div>

    <!-- Блок с перетаскиваемыми элементами -->
    <draggable
        v-model="blocks"
        tag="div"
        item-key="id"
        class="block-container"
        :options="{
        animation: 200,
        handle: null,
        axis: 'x',
        ghostClass: 'ghost-block'
      }"
    >
      <div
          v-for="element in blocks"
          :key="element.id"
          class="draggable-block"
          @dragstart="dragStart"
      >
        <div class="block-content">
          {{ element.content }}
        </div>
      </div>
    </draggable>

    <!-- Кнопки и фидбэк -->
    <div class="control-panel">
      <button
          @click="checkOrder"
          class="btn check-btn"
          :disabled="blocks.length === 0"
      >
        Проверить
      </button>
      <button
          @click="submitLab"
          class="btn finish-btn"
          :disabled="isSubmitted || !isOrderValid"
      >
        {{ isSubmitted ? 'Завершено' : 'Завершить' }}
      </button>
      <div v-if="showFeedback" class="feedback">
        <p :class="feedbackClass">{{ feedbackMessage }}</p>
      </div>
    </div>

    <!-- Результаты -->
    <div v-if="showResults" class="result-popup">
      <div class="result-card">
        <h3>Результат:</h3>
        <p>Статус: <span :class="resultStatusClass">{{ resultStatus }}</span></p>
        <div v-if="!isCorrect" class="correct-order">
          <p>Правильный порядок:</p>
          <div class="order-list">
            {{ correctOrder.map(b => b.content).join(' → ') }}
          </div>
        </div>
        <button @click="goToHomePage" class="return-btn">Вернуться</button>
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
      labId: this.$route.params.labId,
      tasks: [], // Все задания лабораторной
      currentTaskId: null, // Текущее выбранное задание
      task: {}, // Данные текущего задания
      blocks: [], // Перетаскиваемые блоки
      correctOrder: [], // Правильный порядок блоков
      isSubmitted: false,
      showResults: false,
      isCorrect: false,
      feedbackMessage: "",
      showFeedback: false,
      feedbackClass: "",
      resultStatus: "",
      resultStatusClass: ""
    };
  },
  computed: {
    isOrderValid() {
      return this.blocks.length === this.correctOrder.length;
    }
  },
  mounted() {
    this.fetchLabTasks();
  },
  methods: {
    async fetchLabTasks() {
      try {
        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/lab/${this.labId}/tasks`
        );
        const tasks = await response.json();
        this.tasks = tasks;
        if (tasks.length > 0) {
          this.currentTaskId = tasks[0].id;
          this.fetchTaskBlocks(tasks[0].id);
        }
      } catch (error) {
        console.error("Ошибка загрузки заданий:", error);
      }
    },

    async fetchTaskBlocks(taskId) {
      try {
        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/lab/tasks/${taskId}`
        );
        const data = await response.json();
        this.task = data.task;
        this.blocks = data.blocks;
        this.correctOrder = data.blocks.slice().sort(
            (a, b) => a.correct_order - b.correct_order
        );
        this.isSubmitted = false;
      } catch (error) {
        console.error("Ошибка загрузки задания:", error);
      }
    },

    selectTask(taskId) {
      this.currentTaskId = taskId;
      this.fetchTaskBlocks(taskId);
    },

    checkOrder() {
      this.showFeedback = true;
      if (this.isOrderCorrect()) {
        this.feedbackMessage = "Порядок верный!";
        this.feedbackClass = "success";
      } else {
        this.feedbackMessage = "Порядок неверный. Попробуйте еще раз.";
        this.feedbackClass = "error";
      }
    },

    isOrderCorrect() {
      return (
          this.blocks
              .map((b) => b.id)
              .join(",") ===
          this.correctOrder
              .map((b) => b.id)
              .join(",")
      );
    },

    async submitLab() {
      if (!this.isOrderCorrect()) {
        this.feedbackMessage = "Порядок неверный. Попробуйте еще раз";
        this.showFeedback = true;
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) return alert("Авторизуйтесь для отправки");

      try {
        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/lab/results`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                // Удалили task_id
                lab_id: this.labId,
                results: JSON.stringify(this.blocks.map(b => b.id)),
                attempt_time: new Date().toISOString(),
                total_score: this.isOrderCorrect() ? 100 : 0
              }),
            }
        );

        if (response.ok) {
          this.isSubmitted = true;
          this.isCorrect = true;
          this.showResults = true;
          this.resultStatus = "Верно";
          this.resultStatusClass = "success";
        } else {
          throw new Error("Ошибка отправки");
        }
      } catch (error) {
        console.error("Ошибка:", error);
        this.feedbackMessage = "Ошибка сохранения. Попробуйте позже";
      }
    },

    goToHomePage() {
      this.$router.push("/");
    },

    dragStart() {
      this.showFeedback = false;
    },
  },
};
</script>


<style>
/* Основные стили */
body {
  font-family: Arial, sans-serif;
  background: #f5f5f5;
}
.lab-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
/* Навигация заданий */
.task-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.task-item {
  padding: 12px 20px;
  background: #f0f0f0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.2rem;
  min-width: 40px;
  text-align: center;
}
.task-item:hover {
  background: #e0e0e0;
}
.active-task {
  background: #2196F3;
  color: white;
  box-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
  transform: scale(1.05);
}
/* Стили кнопок */
.btn {
  padding: 14px 24px;
  border: 2px solid;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  background: transparent;
  box-sizing: border-box; /* Добавлено для правильного расчета размеров */
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-btn {
  border-color: #2196F3 !important; /* Явное указание цвета */
  color: #2196F3;
}

.finish-btn {
  border-color: #4CAF50 !important; /* Явное указание цвета */
  color: #4CAF50;
}

/* Кнопки и фидбэк */
.control-panel {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  height: 60px;
}

.control-panel .btn {
  height: 44px; /* Фиксированная высота для обеих кнопок */
  margin: 0; /* Убираем возможные отступы */
}
/* Блоки перетаскивания */
.block-container {
  display: flex;
  overflow-x: auto;
  margin: 20px 0;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.draggable-block {
  min-width: 180px;
  height: 100px;
  margin: 0 10px;
  padding: 15px;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 6px;
  cursor: grab;
  transition: transform 0.2s, box-shadow 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}
.draggable-block:hover {
  border-color: #bbb;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.ghost-block {
  opacity: 0.5;
  transform: scale(0.95);
}
.block-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback {
  padding: 15px 30px;
  border-radius: 8px;
  margin-left: 20px;
  min-width: 350px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 15px;
}
.success {
  background: #d1fae5;
  border: 1px solid #10b981;
  color: #10b981;
  padding: 8px 15px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.error {
  background: #fee2e2;
  border: 1px solid #ff7676;
  color: #ff7676;
  padding: 8px 15px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.success::before,
.error::before {
  content: '';
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.success::before {
  background: #10b981;
}
.error::before {
  background: #ff7676;
}
/* Стили для результата */
.result-popup {
  max-width: 500px;
}
.result-card {
  padding: 30px;
}
.correct-order {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 6px solid #6c757d;
}
.order-list {
  font-family: monospace;
  color: #6c757d;
  font-size: 1rem;
  line-height: 1.5;
}
.return-btn {
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  margin-top: 20px;
  cursor: pointer;
  transition: background 0.3s;
}
.return-btn:hover {
  background: #1976D2;
}
</style>