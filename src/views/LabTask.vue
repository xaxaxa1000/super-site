<template>
  <div class="lab-container">
    <!-- Список заданий -->
    <div class="task-navigation">
      <h3>Задания:</h3>
      <div
          v-for="(task, index) in tasks"
          :key="task.id"
          @click="selectTask(task.id)"
          :class="{
    'active-task': currentTaskId === task.id,
    'completed-task': completedTasks.includes(task.id)
  }"
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
    <div v-if="task.type === 'move'">
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
    </div>
    <div v-else-if="task.type === 'move-wrong'">
      <!-- Две линии -->
      <div class="line-container answer-line">
        <h4 class="line-title">
          <span class="line-icon">📝</span> Перетащите сюда правильные блоки
        </h4>
        <!-- Основная линия (line 0) -->
        <draggable
            v-model="mainLine"
            class="block-container"
            group="common"
            item-key="id"
            :animation="200"
            :ghost-class="'ghost-block'"
            :swap-threshold="0.5"
        >
          <div
              v-for="block in mainLine"
              :key="block.id"
              class="draggable-block"
              :class="{ 'correct-block': block.correct }"
              @dragstart="dragStart"
          >
            {{ block.content }}
          </div>
        </draggable>
      </div>
      <div class="line-container storage-line">
        <h4 class="line-title">
          <span class="line-icon">🧩</span> Доступные блоки
        </h4>
        <!-- Дополнительная линия (line 1) -->
        <draggable
            v-model="extraLine"
            class="block-container"
            group="common"
            item-key="id"
            :animation="200"
            :ghost-class="'ghost-block'"
            :swap-threshold="0.5"
        >
          <div
              v-for="block in extraLine"
              :key="block.id"
              class="draggable-block"
              :class="{ 'correct-block': block.correct }"
              @dragstart="dragStart"
          >
            {{ block.content }}
          </div>
        </draggable>
      </div>
    </div>
    <!-- Placeholder для других типов -->
    <div v-else>
      <div class="unsupported-type">
        <p>Тип задания {{ task.type }} не поддерживается</p>
      </div>
    </div>
    <!-- Кнопки и фидбэк -->
    <div class="control-panel">
      <button
          @click="checkOrder"
          class="btn check-btn"
          :disabled="(task.type === 'move' ? blocks.length === 0 : mainLine.length === 0) || isCheckDisabled"
      >
        Проверить
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
        <div v-if="!isLabSubmitted && !isCorrect" class="correct-order">
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
      resultStatusClass: "",
      completedTasks: [],
      submittedBlocks: {}, // Хранит ID блоков для каждого завершенного задания
      isLabSubmitted: false, // Флаг завершения всей лабораторной
      mainLine: [],   // Блоки основной линии (line 0)
      extraLine: [],  // Блоки дополнительной линии (line 1)
      correctMainOrder: [], // Правильный порядок для mainLine

    };
  },
  computed: {
    isOrderValid() {
      return this.blocks.length === this.correctOrder.length;
    },
    isCheckDisabled() {
      return this.completedTasks.includes(this.currentTaskId)
          || (this.task.type === 'move' && this.blocks.length === 0)
          || (this.task.type === 'move-wrong' && this.mainLine.length === 0);
    },
  },
  mounted() {
    this.fetchLabTasks();
  },
  methods: {
    shuffleArray(array) {
      return array.slice().sort(() => 0.5 - Math.random());
    },
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
        console.log(this.mainLine)
        // Очистка предыдущих данных
        this.blocks = [];
        this.mainLine = [];
        this.extraLine = [];
        this.correctOrder = [];
        this.correctMainOrder = [];

        if (this.task.type === 'move') {
          // Для move: исключаем блоки с correct_order = -1
          const filteredBlocks = data.blocks.filter(block => block.correct_order >= 0);
          this.blocks = this.shuffleArray(filteredBlocks);
          this.correctOrder = filteredBlocks
              .slice()
              .sort((a, b) => a.correct_order - b.correct_order);
        } else if (this.task.type === 'move-wrong') {
          // Для move-wrong: фильтруем блоки по line и correct_order
          // Основная линия (line 0) содержит только блоки с correct_order >= 0
          //this.mainLine = this.shuffleArray(
          //    data.blocks
          //        .filter(block => block.line === 0 && block.correct_order >= 0)
          //);
          // Дополнительная линия (line 1) содержит все остальные блоки
          //this.extraLine = this.shuffleArray(
          //    data.blocks
          //        .filter(block => block.line === 1 || block.correct_order === -1)
          //);
          this.mainLine = this.shuffleArray(
              data.blocks
                  .filter(block => block.line === 0 )
          );
          // Дополнительная линия (line 1) содержит все остальные блоки
          this.extraLine = this.shuffleArray(
              data.blocks
                  .filter(block => block.line === 1 )
          );
          // Правильный порядок для mainLine
          this.correctMainOrder = data.blocks
              .filter(block => block.correct_order >= 0) // Включаем все правильные блоки
              .sort((a, b) => a.correct_order - b.correct_order); // Сортируем по правильному порядку
        }
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
      if (this.task.type === 'move') {
        this.showFeedback = true;
        if (this.isOrderCorrect()) {
          this.feedbackMessage = "Порядок верный!";
          this.feedbackClass = "success";

          // Сохраняем результаты текущего задания
          this.submittedBlocks[this.currentTaskId] = this.blocks.map(b => b.id);
          this.completedTasks.push(this.currentTaskId);

          // Проверяем завершение всех заданий
          if (this.completedTasks.length === this.tasks.length) {
            this.submitLab(); // Автоматически отправляем результаты
          }

          // Переходим к следующему заданию или показываем результаты
          const currentIdx = this.tasks.findIndex(t => t.id === this.currentTaskId);
          const nextTask = this.tasks[currentIdx + 1];
          if (nextTask) {
            this.selectTask(nextTask.id);
          } else {
            this.showResults = true; // Показываем финальный экран
          }
        } else {
          this.feedbackMessage = "Порядок неверный. Попробуйте еще раз.";
          this.feedbackClass = "error";
        }
      }else if (this.task.type === 'move-wrong') {
        this.showFeedback = true;

        // В методе checkOrder() для task.type === 'move-wrong':
        const isOrderCorrect =
            this.mainLine.length === this.correctMainOrder.length &&
            this.mainLine.every((block, index) =>
                block.id === this.correctMainOrder[index]?.id
            );

        if (isOrderCorrect) {
          this.feedbackMessage = "Порядок верный!";
          this.feedbackClass = "success";
          this.completedTasks.push(this.currentTaskId);
        } else {
          this.feedbackMessage = "Порядок неверный. Попробуйте еще раз.";
          this.feedbackClass = "error";
        }
      }
    },

    isOrderCorrect() {
      // Проверяем только блоки с correct_order >= 0
      const filteredBlocks = this.blocks.filter(block => block.correct_order >= 0);
      return (
          filteredBlocks
              .map(b => b.id)
              .join(",") ===
          this.correctOrder
              .map(b => b.id)
              .join(",")
      );
    },

    // В методе submitLab()
    async submitLab() {
      const token = localStorage.getItem("authToken");
      if (!token) return alert("Авторизуйтесь для отправки");

      try {
        // Формируем массив ID блоков текущего задания в правильном порядке
        const blocksOrder = this.blocks.map(block => block.id);

        // Если нужно сохранить данные всех заданий, используйте submittedBlocks:
        // const allResults = this.submittedBlocks; // Убедитесь, что он инициализирован

        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/lab/results`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                lab_id: this.labId,
                results: JSON.stringify(blocksOrder), // Отправляем массив ID как JSON
                attempt_time: new Date().toISOString(),
                total_score: this.isOrderCorrect() ? 100 : 0
              }),
            }
        );

        if (response.ok) {
          this.isLabSubmitted = true;
          this.showResults = true;
          this.resultStatus = "Лабораторная завершена!";
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

.line-container {
  margin: 20px 0;
  padding: 15px;
  border-radius: 8px;
  transition: all 0.3s;
}
.answer-line {
  background: #f8fafd;
  border: 2px dashed #2196F3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
}
.storage-line {
  background: #f9f9f9;
  border: 2px solid #e0e0e0;
}

.line-title {
  margin: 0 0 15px 0;
  color: #555;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.line-icon {
  font-size: 20px;
}

/* Стили для блоков в разных линиях */
.answer-line .draggable-block {
  border: 2px solid #2196F3;
  background: #e3f2fd;
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
.completed-task {
  background: #4CAF50 !important;
  color: white !important;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5) !important;
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
  color: #4CAF50;
  font-weight: bold;
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 40px auto;
}

.result-card h3 {
  color: #2196F3;
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