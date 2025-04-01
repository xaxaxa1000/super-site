<template>
  <header class="youtube-header">
    <!-- Левая часть: Логотип -->
    <div class="header-left">
      <router-link to="/home" class="logo">
        <!-- Иконка меню (бургер) -->
        <span class="menu-icon">≡</span>
        <!-- Логотип -->
        <img src="@/assets/logo.png" alt="Logo" class="logo-image" />
      </router-link>
    </div>

    <!-- Центральная часть: Поиск -->
    <div class="header-center">
      <div class="search-container">
        <input type="text" placeholder="Поиск" class="search-input" />
        <button class="search-button">
          <svg viewBox="0 0 24 24" class="search-icon">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5a6.471 6.471 0 0 0-3.03 1.27L12 10.5l-1.27-1.27A6.471 6.471 0 0 0 7.5 9.5a6.471 6.471 0 0 0-6 6.5h.79l.28.27A6.471 6.471 0 0 0 9.5 16a6.471 6.471 0 0 0 6-6.5zm-7 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Правая часть: Кнопка пользователя -->
    <div class="header-right">
      <router-link
          :to="isLoggedIn ? '/profile' : '/login'"
          class="user-button"
      >
        <svg
            viewBox="0 0 24 24"
            class="user-icon"
            :class="{ 'active': isLoggedIn }"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </router-link>
    </div>
  </header>
</template>

<script>
export default {
  computed: {
    // Проверяем наличие токена в localStorage
    isLoggedIn() {
      return localStorage.getItem('authToken') !== null;
    }
  }
};
</script>

<style scoped>
.user-icon.active {
  fill: #007bff;
  transition: fill 0.3s;
}
.youtube-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 56px;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 24px;
  margin-right: 15px;
  cursor: pointer;
}

.logo-image {
  height: 24px;
  width: auto;
}

.header-center {
  flex: 1;
  margin: 0 20px;
}

.search-container {
  display: flex;
  align-items: center;
  background: #f1f1f1;
  border-radius: 2px;
  padding: 5px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 5px;
  font-size: 14px;
}

.search-button {
  background: transparent;
  border: none;
  padding: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.search-icon {
  fill: #606060;
  width: 20px;
  height: 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-button {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;
}

.user-button:hover {
  background: #f1f1f1;
}

.user-icon {
  fill: #606060;
  width: 24px;
  height: 24px;
}
</style>