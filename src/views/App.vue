<template>
  <div id="app" class="bg-white text-black">
    <header class="bg-dark py-3">
      <div class="container">
        <h1 class="text-center text-warning">Видеокурс по информационной безопасности</h1>
        <!-- Навигационное меню -->
        <nav class="mt-3">
          <router-link to="/" class="text-warning mx-3">Главная</router-link>
          <router-link to="/video" class="text-warning mx-3">Видео</router-link>
        </nav>
      </div>
    </header>
    
    <!-- Основной контент с роутингом -->
    <main class="py-5">
      <div class="container">
        <router-view></router-view>
      </div>
    </main>

    <footer class="bg-dark py-3 text-center">
      <div class="container">
        <p class="text-warning mb-0">© 2023 Видеокурс по информационной безопасности</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
/* Добавим стили для активных ссылок */
.router-link-exact-active {
  border-bottom: 2px solid #ffc107;
  padding-bottom: 5px;
}

/* Остальные стили остаются без изменений */
body {
  font-family: Arial, sans-serif;
}

.embed-responsive {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  overflow: hidden;
}

.embed-responsive::before {
  display: block;
  content: "";
}

.embed-responsive .embed-responsive-item,
.embed-responsive iframe,
.embed-responsive embed,
.embed-responsive object,
.embed-responsive video {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.embed-responsive-16by9::before {
  padding-top: 56.25%;
}
</style>