<template>
  <div class="profile-container">
    <div class="panel panel-default">
      <div class="panel-heading">
        <div class="d-flex justify-content-between align-items-center">
          <h3 class="panel-title">Профиль пользователя</h3>
          <button
              @click="$router.back()"
              class="btn btn-secondary btn-sm"
          >
            Назад
          </button>
        </div>
      </div>
      <div class="panel-body">
        <div v-if="loading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
        </div>
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
        <div v-else>
          <div class="avatar-container text-center mb-3">
            <img
              v-if="user.avatar_url"
              :src="user.avatar_url"
              alt="Аватар"
              class="rounded-circle profile-avatar"
            />
            <span v-else class="initials">{{ initials }}</span>
          </div>

          <div class="form-group">
            <label>Имя:</label>
            <span>{{ user.first_name }}</span>
          </div>

          <div class="form-group">
            <label>Фамилия:</label>
            <span>{{ user.last_name }}</span>
          </div>

          <div class="form-group">
            <label>Email:</label>
            <span>{{ user.email }}</span>
          </div>

          <div class="form-group">
            <label>Тип пользователя:</label>
            <span>{{ user.user_type }}</span>
          </div>

          <div v-if="user.user_type === 'student'" class="form-group">
            <label>Группа:</label>
            <span>{{ user.study_group }}</span>
          </div>

          <div class="form-group">
            <label>Дата регистрации:</label>
            <span>{{ formattedCreatedAt }}</span>
          </div>

          <div class="text-center">
            <button @click="logout" class="btn btn-danger mt-3">Выйти</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {},
      loading: true,
      error: null
    };
  },
  computed: {
    initials() {
      return (
        (this.user.first_name?.[0] || "") +
        (this.user.last_name?.[0] || "")
      ).toUpperCase();
    },
    formattedCreatedAt() {
      return new Date(this.user.created_at).toLocaleDateString();
    }
  },
  async mounted() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        this.$router.push('/login');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${await response.text()}`);
      }

      this.user = await response.json();
    } catch (error) {
      this.error = error.message;
      console.error('Ошибка получения данных:', error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async logout() {
      localStorage.removeItem('authToken');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.profile-container {
  position: relative;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.panel-default {
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.initials {
  display: inline-block;
  width: 100px;
  height: 100px;
  line-height: 100px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  font-size: 24px;
  text-align: center;
}
</style>