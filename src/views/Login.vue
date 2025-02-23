<template>
  <div class="login-page">
    <div class="login-container">
      <h2>Вход</h2>
      <b-form @submit.prevent="handleLogin">
        <!-- Поле для логина -->
        <b-form-group label="Логин" label-for="login">
          <b-form-input
            id="login"
            v-model="credentials.login"
            type="text"
            placeholder="Введите логин"
            required
          ></b-form-input>
        </b-form-group>

        <!-- Поле для пароля -->
        <b-form-group label="Пароль" label-for="password">
          <b-form-input
            id="password"
            v-model="credentials.password"
            type="password"
            placeholder="Введите пароль"
            required
          ></b-form-input>
        </b-form-group>

        <!-- Кнопка входа -->
        <b-button type="submit" variant="primary" block>Войти</b-button>
      </b-form>

      <!-- Дополнительные ссылки -->
      <div class="links">
        <a href="#" @click.prevent="handleForgotPassword">Забыли пароль?</a>
        <b-button variant="outline-secondary" block @click="handleRegister">Зарегистрироваться</b-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      credentials: {
        login: '',
        password: ''
      }
    };
  },
  methods: {
    handleLogin() {
      // Логика для обработки входа
      console.log('Попытка входа:', this.credentials);
      alert(`Логин: ${this.credentials.login}, Пароль: ${this.credentials.password}`);
      // Здесь можно добавить запрос на сервер для проверки данных
    },
    handleForgotPassword() {
      // Логика для восстановления пароля
      alert('Перенаправление на страницу восстановления пароля...');
      // Например, перейти на страницу восстановления пароля
      // this.$router.push('/forgot-password');
    },
    handleRegister() {
      // Логика для регистрации
      alert('Перенаправление на страницу регистрации...');
      // Например, перейти на страницу регистрации
      // this.$router.push('/register');
    }
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.links {
  margin-top: 20px;
  text-align: center;
}

.links a {
  display: block;
  margin-bottom: 10px;
  color: #007bff;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>