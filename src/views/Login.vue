<template>
  <div class="viewport">
    <div class="form-container">
      <div class="panel panel-default">
        <div class="panel-heading">
          <h3 class="panel-title text-center">Вход</h3>
        </div>
        <div class="panel-body">
          <form @submit.prevent="handleLogin">
            <!-- Email -->
            <div class="form-group text-left">
              <label for="email">Email</label>
              <input
                  v-model="formData.email"
                  type="email"
                  id="email"
                  class="form-control"
                  placeholder="Введите email"
                  required
              >
            </div>

            <!-- Пароль -->
            <div class="form-group text-left">
              <label for="password">Пароль</label>
              <div class="input-group">
                <input
                    v-model="formData.password"
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    class="form-control"
                    placeholder="Введите пароль"
                    required
                >
                <span class="input-group-btn">
                  <button
                      type="button"
                      class="btn btn-default"
                      @click="showPassword = !showPassword"
                  >
                    {{ showPassword ? 'Скрыть' : 'Показать' }}
                  </button>
                </span>
              </div>
            </div>

            <!-- Кнопка входа -->
            <button
                type="submit"
                class="btn btn-primary btn-block"
                :disabled="isLoading"
            >
              <span v-if="!isLoading">Войти</span>
              <span v-else>Загрузка...</span>
            </button>

            <!-- Ссылки -->
            <div class="text-center links">
              <router-link to="/register">Зарегистрироваться</router-link>
              <router-link to="/forgot-password">Забыли пароль?</router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        email: '',
        password: ''
      },
      showPassword: false,
      isLoading: false
    }
  },
  methods: {
    async handleLogin() {
      try {
        this.isLoading = true;

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // Исправлено с this.email на this.formData.email
            email: this.formData.email,
            // Исправлено с this.password на this.formData.password
            password: this.formData.password
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Ошибка ${response.status}: ${errorData.message}`);
        }

        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        this.$router.push('/home');

      } catch (error) {
        alert(error.message);
        console.error('Ошибка входа:', error);

      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.viewport {
  position: relative;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.form-container {
  position: absolute;
  left: 50%;
  top: 20%; /* Форма будет на 40% от верха */
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 400px;
  padding: 0 15px;
}

.panel-default {
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.panel-title {
  font-size: 24px;
  font-weight: 500;
  color: #333;
}

.form-control {
  border-radius: 4px;
  border: 1px solid #ddd;
}

.input-group-btn .btn {
  border-radius: 0 4px 4px 0;
  border-left: 0;
}

.links {
  margin-top: 15px;
}

.links a {
  color: #337ab7;
  text-decoration: none;
  margin: 0 10px;
}

.links a:hover {
  text-decoration: underline;
}

.btn-primary {
  background-color: #337ab7;
  border-color: #2e6da4;
}

.btn-primary:hover {
  background-color: #286090;
  border-color: #204d74;
}
</style>