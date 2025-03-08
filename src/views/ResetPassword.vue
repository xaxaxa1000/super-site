<template>
  <div class="reset-password">
    <h2>Сброс пароля</h2>
    <form @submit.prevent="submitNewPassword">
      <div class="form-group">
        <label for="password">Новый пароль:</label>
        <input
            v-model="password"
            type="password"
            id="password"
            required
            placeholder="Введите новый пароль"
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Подтвердите пароль:</label>
        <input
            v-model="confirmPassword"
            type="password"
            id="confirmPassword"
            required
            placeholder="Повторите пароль"
        />
        <p v-if="passwordMismatch" class="error-message">
          Пароли не совпадают
        </p>
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Отправка...' : 'Сбросить пароль' }}
      </button>

      <p v-if="message" :class="isSuccess ? 'success-message' : 'error-message'">
        {{ message }}
      </p>
    </form>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();

    const password = ref('');
    const confirmPassword = ref('');
    const isLoading = ref(false);
    const message = ref('');
    const isSuccess = ref(false);

    // Получаем токен из URL
    const token = computed(() => route.query.token);

    // Проверка совпадения паролей
    const passwordMismatch = computed(() => {
      return password.value !== confirmPassword.value;
    });

    const submitNewPassword = async () => {
      if (passwordMismatch.value) {
        message.value = 'Пароли не совпадают';
        isSuccess.value = false;
        return;
      }

      if (!token.value) {
        message.value = 'Неверный токен';
        isSuccess.value = false;
        return;
      }

      try {
        isLoading.value = true;
        message.value = '';

        const response = await fetch('http://localhost:3000/api/reset-password/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: token.value,
            newPassword: password.value
          })
        });

        if (response.ok) {
          isSuccess.value = true;
          message.value = 'Пароль успешно изменен!';
          setTimeout(() => router.push('/login'), 2000);
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
      password,
      confirmPassword,
      passwordMismatch,
      isLoading,
      message,
      isSuccess,
      submitNewPassword
    };
  }
};
</script>

<style scoped>
.reset-password {
  max-width: 400px;
  margin: 2rem auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1.5rem;
}

input {
  width: 100%;
  padding: 8px;
  margin: 5px 0;
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
</style>