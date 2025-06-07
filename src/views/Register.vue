<template>
  <div class="register-page">
    <h2>Регистрация</h2>
    <form @submit.prevent="registerUser">
      <div class="form-group">
        <label for="firstName">Имя:</label>
        <input
            v-model="formData.firstName"
            type="text"
            id="firstName"
            required
            placeholder="Введите имя"
        />
      </div>

      <div class="form-group">
        <label for="lastName">Фамилия:</label>
        <input
            v-model="formData.lastName"
            type="text"
            id="lastName"
            required
            placeholder="Введите фамилию"
        />
      </div>

      <div class="form-group">
        <label for="email">Электронная почта:</label>
        <input
            v-model="formData.email"
            type="email"
            id="email"
            required
            placeholder="Введите email"
        />
      </div>

      <div class="form-group">
        <label for="userType">Тип пользователя:</label>
        <select v-model="formData.userType" id="userType" required>
          <option value="" disabled selected>Выберите тип</option>
          <option value="student">Студент</option>
          <option value="applicant">Абитуриент</option>
          <option value="teacher">Преподаватель</option>
        </select>
      </div>

      <div class="form-group">
        <label for="group">Группа:</label>
        <input
            v-model="formData.group"
            type="text"
            id="group"
            :required="isStudent"
            :disabled="!isStudent"
            placeholder="Введите группу"
        />
        <p v-if="groupError" class="error-message">Группа обязательна для студентов</p>
      </div>


      <div class="form-group">
        <label for="password">Пароль:</label>
        <input
            v-model="formData.password"
            type="password"
            id="password"
            required
            placeholder="Введите пароль"
            @input="validatePassword"
        />
        <div class="password-hints">
          <p :class="{ 'valid': passwordHints.length }">Не менее 8 символов</p>
          <p :class="{ 'valid': passwordHints.uppercase }">Заглавные буквы</p>
          <p :class="{ 'valid': passwordHints.lowercase }">Строчные буквы</p>
          <p :class="{ 'valid': passwordHints.numbers }">Цифры</p>
          <p :class="{ 'valid': passwordHints.specialChars }">Спецсимволы</p>
        </div>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Подтвердите пароль:</label>
        <input
            v-model="formData.confirmPassword"
            type="password"
            id="confirmPassword"
            required
            placeholder="Повторите пароль"
        />
        <p v-if="passwordMismatch" class="error-message">Пароли не совпадают</p>
      </div>

      <button type="submit" :disabled="isLoading || passwordMismatch">
        {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>

      <p v-if="message" :class="isSuccess ? 'success-message' : 'error-message'">
        {{ message }}
      </p>
    </form>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import CryptoJS from 'crypto-js';

export default {
  setup() {
    const formData = ref({
      firstName: '',
      lastName: '',
      email: '',
      userType: '', // Значения: 'student', 'applicant', 'teacher'
      group: '',
      password: '',
      confirmPassword: ''
    });

    const isLoading = ref(false);
    const message = ref('');
    const isSuccess = ref(false);
    const groupError = ref(false);

    // Валидация типа пользователя
    const isValidUserType = computed(() => {
      return ['student', 'applicant', 'teacher'].includes(formData.value.userType);
    });

    // Проверка группы для студентов
    const isStudent = computed(() => formData.value.userType === 'student');

    // Проверка совпадения паролей
    const passwordMismatch = computed(() =>
        formData.value.password !== formData.value.confirmPassword
    );
    const passwordHints = ref({
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      specialChars: false
    });

    const validatePassword = () => {
      const password = formData.value.password;
      passwordHints.value.length = password.length >= 8;
      passwordHints.value.uppercase = /[A-Z]/.test(password);
      passwordHints.value.lowercase = /[a-z]/.test(password);
      passwordHints.value.numbers = /\d/.test(password);
      passwordHints.value.specialChars = /[@$!%*?&]/.test(password);
    };

    const isPasswordValid = computed(() => {
      return Object.values(passwordHints.value).every(Boolean);
    });

    const registerUser = async () => {
      groupError.value = false;

      // Проверки перед отправкой
      if (!isValidUserType.value) {
        message.value = 'Выберите корректный тип пользователя';
        isSuccess.value = false;
        return;
      }

      if (isStudent.value && !formData.value.group) {
        groupError.value = true;
        message.value = 'Группа обязательна для студентов';
        isSuccess.value = false;
        return;
      }

      if (passwordMismatch.value) {
        message.value = 'Пароли не совпадают';
        isSuccess.value = false;
        return;
      }

      if (!isPasswordValid.value) {
        message.value = 'Пароль не соответствует требованиям сложности';
        isSuccess.value = false;
        return;
      }

      try {
        isLoading.value = true;
        message.value = '';

        // Хешируем пароль перед отправкой
        const hashedPassword = CryptoJS.SHA256(formData.value.password).toString();

        // Формируем тело запроса без confirmPassword
        const registrationData = {
          firstName: formData.value.firstName,
          lastName: formData.value.lastName,
          email: formData.value.email,
          userType: formData.value.userType,
          group: formData.value.group || null,
          password: hashedPassword //  Отправляем хеш
        };

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registrationData)
        });

        if (response.ok) {
          isSuccess.value = true;
          message.value = 'Регистрация успешна!';
          setTimeout(() => window.location.href = '/login', 2000);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка сервера');
        }
      } catch (error) {
        isSuccess.value = false;
        message.value = error.message || 'Ошибка сети';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      formData,
      isLoading,
      message,
      isSuccess,
      passwordMismatch,
      isStudent,
      groupError,
      registerUser,
      passwordHints,
      validatePassword
    };
  }
};
</script>

<style scoped>
.register-page {
  max-width: 400px;
  margin: 2rem auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input,
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  margin: 0.5rem 0;
}

.success-message {
  color: #4CAF50;
  margin: 0.5rem 0;
}

.password-hints {
  margin-top: 0.5rem;
  font-size: 0.85em;
}

.password-hints p {
  margin: 0;
  color: #999;
}

.password-hints .valid {
  color: green;
}
</style>