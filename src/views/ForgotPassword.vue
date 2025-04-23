<template>
  <div class="password-reset-container">
    <div class="password-reset-card">
      <h2>Сброс пароля</h2>
      <form @submit.prevent="sendResetEmail" class="reset-form">
        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="Введите email" 
            required 
            class="input-field"
          />
        </div>
        <button type="submit" class="submit-btn">
          Сбросить пароль
        </button>
        <p v-if="message" :class="['message', message.includes('Ошибка') ? 'error' : 'success']">
          {{ message }}
        </p>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      message: ''
    };
  },
  methods: {
    async sendResetEmail() {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email })
        });

        if (response.ok) {
          this.message = 'Письмо отправлено! Проверьте вашу почту.';
          this.email = '';
        } else {
          this.message = 'Ошибка. Проверьте email и попробуйте еще раз.';
        }
      } catch (error) {
        this.message = 'Ошибка сети. Проверьте подключение.';
      }
    }
  }
};
</script>

<style scoped>
.password-reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f8f9fa;
}

.password-reset-card {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  width: 400px;
  text-align: center;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.input-field {
  padding: 12px 20px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  width: 100%;
  max-width: 350px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: #86b7fe;
  outline: none;
}

.submit-btn {
  padding: 12px 24px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s ease;
}

.submit-btn:hover {
  background: #45a049;
}

.message {
  margin-top: 15px;
  font-size: 14px;
}

.message.error {
  color: #dc3545;
  font-weight: 500;
}

.message.success {
  color: #28a745;
  font-weight: 500;
}

/* Стилизация лейблов */
label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #5a5c69;
}

/* Адаптивность */
@media (max-width: 600px) {
  .password-reset-card {
    width: 90%;
    padding: 30px;
  }
}
</style>