<template>
  <div class="test-container">
    <!-- Навигация по вопросам -->
    <div class="question-navigation">
      <button
          v-for="(question, index) in questions"
          :key="question.id"
          @click="currentQuestionIndex = index"
          :class="{
          active: currentQuestionIndex === index,
          answered: question.answered,
          unanswered: !question.answered && currentQuestionIndex !== index
        }"
      >
        {{ index + 1 }}
      </button>
    </div>

    <!-- Таймер -->
    <div class="timer" v-if="test.time_limit">
      Осталось времени: {{ timeLeft }} секунд
    </div>

    <!-- Текущий вопрос -->
    <div v-if="currentQuestion" class="current-question">
      <h2>{{ currentQuestion.question_text }}</h2>
      <div
          v-for="answer in currentQuestion.answers"
          :key="answer.id"
          class="answer-option"
          @click="selectAnswer(answer.id)"
          :class="{ selected: selectedAnswer === answer.id }"
      >
        {{ answer.text }}
      </div>
      <button
          @click="submitAnswer"
          :disabled="!selectedAnswer || isSubmitted"
      >
        Подтвердить ответ
      </button>
    </div>

    <!-- Кнопка завершения теста -->
    <button
        v-if="!isTimerEnded"
        @click="finishTest"
        class="finish-btn"
    >
      Завершить тест
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      testId: this.$route.params.testId, // Теперь берем из URL
      test: {},
      questions: [],
      currentQuestionIndex: 0,
      selectedAnswer: null,
      timer: null,
      timeLeft: 0,
      isSubmitted: false,
      isTimerEnded: false,
      answers: {}
    };
  },
  mounted() {
    console.log('testId:', this.testId); // Проверьте ID в консоли
    this.fetchTest();
    this.startTimer();
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    }
  },
  methods: {
    async fetchTest() {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tests/${this.testId}`);
        if (!response.ok) {
          throw new Error(`Ошибка: ${response.status}`);
        }
        const data = await response.json();
        this.test = data.test;
        this.questions = data.questions.map(q => ({
          ...q,
          answered: false
        }));
        this.timeLeft = this.test.time_limit * 60;
      } catch (error) {
        alert('Не удалось загрузить тест. Проверьте ID теста.');
        console.error('Ошибка:', error);
      }
    },
    startTimer() {
      this.timer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          clearInterval(this.timer);
          this.isTimerEnded = true;
          this.submitTest();
        }
      }, 1000);
    },
    selectAnswer(answerId) {
      this.selectedAnswer = answerId;
    },
    async submitAnswer() {
      if (!this.selectedAnswer) return;

      // Отмечаем вопрос как пройденный
      this.questions[this.currentQuestionIndex].answered = true;
      this.answers[this.currentQuestion.id] = this.selectedAnswer;

      // Переход к следующему вопросу
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
      this.isSubmitted = false;
    },
    async finishTest() {
      this.isTimerEnded = true;
      await this.submitTest();
    },
    // В TestPage.vue
    async submitTest() {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Вы не авторизованы');

        // Добавляем полный URL к API
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/test-sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            test_id: this.testId,
            answers: this.answers,
            score: this.calculateScore()
          })
        });

        // Добавляем проверку пустого ответа
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
          throw new Error(data.message || `Ошибка ${response.status}`);
        }

        alert('Тест сохранен!');
      } catch (error) {
        console.error('Полная ошибка:', error);
        alert(`Ошибка сохранения: ${error.message}`);
      }
    },
    calculateScore() {
      let correct = 0;
      this.questions.forEach(q => {
        const userAnswer = this.answers[q.id];
        const correctAnswer = q.answers.find(a => a.is_correct)?.id;
        if (userAnswer === correctAnswer) correct++;
      });
      return (correct / this.questions.length) * 100;
    }
  }
};
</script>

<style>
/* Стили навигации */
.question-navigation {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.question-navigation button {
  padding: 10px 15px;
  background: #f0f0f0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.question-navigation button.active {
  background: #4CAF50;
  color: white;
}

.question-navigation button.answered {
  background: #2196F3;
  color: white;
}

.question-navigation button.unanswered {
  background: #ff4444;
  color: white;
}

/* Стили вопроса */
.current-question {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.answer-option {
  padding: 10px;
  margin: 5px 0;
  background: #f8f8f8;
  border-radius: 4px;
  cursor: pointer;
}

.answer-option.selected {
  background: #4CAF50;
  color: white;
}

.timer {
  font-size: 1.2em;
  margin: 15px 0;
}

.finish-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>

