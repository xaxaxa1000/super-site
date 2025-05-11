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
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 50 50">
            <path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
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
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''));
  return JSON.parse(jsonPayload);
}

export default {
  computed: {
    isLoggedIn() {
      const token = localStorage.getItem('authToken');
      if (!token) return false;
      try {
        const decoded = parseJwt(token);
        return decoded.exp * 1000 > Date.now();
      } catch (e) {
        return false;
      }
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