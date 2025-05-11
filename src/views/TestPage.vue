<template>
  <div class="test-container">
    <!-- Навигация по вопросам (только если результаты не показаны) -->
    <div class="question-navigation" v-if="!showResults">
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

    <!-- Таймер и информация (только если результаты не показаны) -->
    <div class="test-info" v-if="!showResults">
      <div class="timer" v-if="test.time_limit">
        Осталось времени: {{ timeLeft }} секунд
      </div>
    </div>

    <!-- Текущий вопрос (только если тест не завершен) -->
    <div v-if="currentQuestion && !showResults" class="current-question">
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

    <!-- Кнопка завершения теста (только если тест не завершен) -->


    <!-- Блок с результатами -->
    <div v-if="showResults" class="results-container">
      <div class="result-card">
        <h2>Результаты теста:</h2>
        <p>Ваш балл: <strong>{{ testResults.score }}%</strong></p>
        <p>Правильных ответов: <strong>{{ testResults.correct }}</strong> из {{ testResults.total }}</p>

        <!-- Правильные ответы -->
        <div v-if="testResults.correctAnswers.length > 0" class="correct-section">
          <h3>Правильно:</h3>
          <div v-for="q in testResults.correctAnswers" :key="q.id" class="answer-item">
            <div class="question-block">
              <p class="question-text">{{ q.question_text }}</p>
              <p class="user-answer">Ваш ответ: {{ getAnswerText(q.id) }}</p>
            </div>
          </div>
        </div>

        <!-- Неправильные ответы -->
        <div v-if="testResults.incorrectAnswers.length > 0" class="incorrect-section">
          <h3>Неправильно:</h3>
          <div v-for="q in testResults.incorrectAnswers" :key="q.id" class="answer-item">
            <div class="question-block">
              <p class="question-text">{{ q.question_text }}</p>
              <p class="user-answer">Ваш ответ: {{ getAnswerText(q.id) }}</p>
              <p class="incorrect-message">Ответ неверный</p>
            </div>
          </div>
        </div>

        <button @click="goToHomePage" class="return-btn">
          Вернуться на главную
        </button>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      testId: this.$route.params.testId,
      test: {},
      questions: [],
      currentQuestionIndex: 0,
      selectedAnswer: null,
      timer: null,
      timeLeft: 0,
      isSubmitted: false,
      isTimerEnded: false,
      answers: {},
      testResults: null,
      showResults: false,
      correctAnswers: [],
      incorrectAnswers: []
    };
  },
  mounted() {
    this.fetchTest();
    this.startTimer();
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    },
    isTestCompleted() {
      return this.currentQuestionIndex >= this.questions.length;
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
        this.timeLeft = this.test.time_limit * 60; // Переводим в секунды
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

      // Если все вопросы пройдены, завершаем тест
      if (this.isTestCompleted) {
        this.finishTest();
      }
    },
    async finishTest() {
      this.isTimerEnded = true;
      await this.submitTest();
    },
    async submitTest() {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Вы не авторизованы');

        const scoreData = this.calculateScore();

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/test-sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            test_id: this.testId,
            answers: this.answers,
            total_score: scoreData.percentage,
            correct_answers: scoreData.correct,
            total_questions: scoreData.total
          })
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
          throw new Error(data.message || `Ошибка ${response.status}`);
        }

        // Собираем правильные/неправильные ответы
        this.correctAnswers = [];
        this.incorrectAnswers = [];
        this.questions.forEach(q => {
          const userAnswerId = this.answers[q.id];
          const correctAnswer = q.answers.find(a => a.is_correct)?.id;
          if (userAnswerId === correctAnswer) {
            this.correctAnswers.push(q);
          } else {
            this.incorrectAnswers.push(q);
          }
        });

        // Сохраняем результаты
        this.testResults = {
          score: scoreData.percentage,
          correct: scoreData.correct,
          total: scoreData.total,
          correctAnswers: this.correctAnswers,
          incorrectAnswers: this.incorrectAnswers
        };
        this.showResults = true;
        clearInterval(this.timer);
      } catch (error) {
        console.error('Полная ошибка:', error);
        alert(`Ошибка сохранения: ${error.message}`);
      }
    },
    calculateScore() {
      let correct = 0;
      const totalQuestions = this.questions.length;
      this.questions.forEach(q => {
        const userAnswerId = this.answers[q.id];
        const correctAnswerId = q.answers.find(a => a.is_correct)?.id;
        if (userAnswerId === correctAnswerId) {
          correct++;
        }
      });
      return {
        correct,
        total: totalQuestions,
        percentage: (correct / totalQuestions) * 100
      };
    },
    getAnswerText(questionId) {
      const answerId = this.answers[questionId];
      const selectedAnswer = this.questions.find(q => q.id === questionId).answers.find(a => a.id === answerId);
      return selectedAnswer ? selectedAnswer.text : 'Не выбрано';
    },
    getCorrectAnswer(questionId) {
      const correctAnswer = this.questions.find(q => q.id === questionId).answers.find(a => a.is_correct);
      return correctAnswer ? correctAnswer.text : 'Ответ не найден';
    },
    goToHomePage() {
      this.$router.push('/');
    }
  }
};
</script>

<style>
/* Стили для блока с результатами */
.results-container {
  margin-top: 40px;
  text-align: center;
}

.result-card {
  background: white;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
}

.correct-section {
  background: #e8f5e9;
  border-left: 4px solid #4CAF50;
  margin: 20px 0;
  padding: 15px;
}

.incorrect-section {
  background: #fbe9e7;
  border-left: 4px solid #ff5252;
  margin: 20px 0;
  padding: 15px;
}

.question-block {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 5px;
  background: #f8f8f8;
}

.question-text {
  font-weight: bold;
  margin-bottom: 5px;
}

.user-answer {
  margin-bottom: 5px;
}

.incorrect-message {
  color: #ff5252;
  font-weight: bold;
}

.return-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.return-btn:hover {
  background: #45a049;
}

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

.finish-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>