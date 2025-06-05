<template>
  <div class="viewport">
    <div class="form-container">
      <div class="panel panel-default">
        <div class="panel-heading position-relative">
          <!-- Кнопка "Назад" -->
          <button
              @click="$router.push('/home')"
              class="back-btn"
          >
            ← Назад
          </button>
          <!-- Заголовок -->
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
              />
            </div>

            <!-- Пароль -->
            <div class="form-group text-left">
              <label for="password">Пароль</label>
              <div class="password-group">
                <input
                    v-model="formData.password"
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    class="form-control"
                    placeholder="Введите пароль"
                    required
                />
                <button
                    type="button"
                    class="toggle-password"
                    @click="showPassword = !showPassword"
                >
                  {{ showPassword ? 'Скрыть' : 'Показать' }}
                </button>
              </div>
            </div>

            <!-- Кнопка входа -->
            <button
                type="submit"
                class="btn btn-primary btn-block mt-4"
                :disabled="isLoading"
            >
              <span v-if="!isLoading">Войти</span>
              <span v-else>Загрузка...</span>
            </button>

            <!-- Ссылки -->
            <div class="text-center links mt-3">
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
    };
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
            email: this.formData.email,
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
};
</script>

<style scoped>
.viewport {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(to bottom right, #e0f7fa, #ffffff);
  padding: 20px;
}

.form-container {
  width: 100%;
  max-width: 420px;
}

.panel-default {
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.panel-default:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.panel-heading {
  padding: 20px;
  background: linear-gradient(to right, #007bff, #0056b3);
  color: white;
  position: relative;
}

.panel-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.5px;
}

.back-btn {
  position: absolute;
  left: 15px;
  top: 15px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.panel-body {
  padding: 30px 20px 40px; /* больше нижнего отступа */
}

.form-control {
  border-radius: 6px;
  border: 1px solid #ccc;
  padding: 10px 12px;
  font-size: 15px;
  transition: border-color 0.3s ease;
}
.password-group {
  display: flex;
  position: relative;
}

.password-group .form-control {
  flex: 1;
  border-radius: 6px 0 0 6px;
  border-right: none;
}

.toggle-password {
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  border-left: none;
  border-radius: 0 6px 6px 0;
  color: #555;
  cursor: pointer;
  padding: 10px 15px;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.toggle-password:hover {
  background-color: #e0e0e0;
}

/* Для фокусировки - стилизация всей группы */
.password-group:focus-within {
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  border-radius: 6px;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.input-group-btn .btn {
  display: flex;
  border-radius: 0 6px 6px 0;
  border-left: none;
  background-color: #f1f1f1;
  color: #555;
  transition: background-color 0.3s ease;
}

.input-group-btn .btn:hover {
  background-color: #e0e0e0;
}

.btn-primary {
  background: linear-gradient(to right, #007bff, #0056b3);
  border: none;
  color: white;
  padding: 12px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.btn-primary:hover {
  background: linear-gradient(to right, #0069d9, #004080);
  transform: scale(1.03);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.links {
  margin-top: 15px;
}

.links a {
  color: #007bff;
  text-decoration: none;
  margin: 0 10px;
  font-size: 14px;
  transition: color 0.3s ease;
}

.links a:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>