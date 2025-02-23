<template>
  <div id="app">
    <!-- Шапка -->
    <b-navbar toggleable="lg" type="dark" id="custom">
      <b-navbar-brand href="#">
        <div class="logo mr-2"></div>
        SibTube
      </b-navbar-brand>

      <b-navbar-nav class="ml-auto mr-auto input_size">
        <b-form-input size="sm" class="mr-sm-2" placeholder="Поиск..." />
      </b-navbar-nav>
      
      <div @click="goToLogin" style="cursor: pointer">
       <b-navbar-nav class="ml-auto">
        <b-avatar
         text="Ю"
         variant="light"
         class="mr-2"
        
        ></b-avatar>
       </b-navbar-nav>
      </div>
    </b-navbar>

    <!-- Основной контент -->
    <b-container fluid>
      <b-row>
        <!-- Боковое меню -->
        <b-col cols="2">
          <b-sidebar id="sidebar-1" title="Меню управления" bg-variant="primary" text-variant="light">
            <div class="px-3 py-2">
              <b-nav vertical>
                <b-nav-item to="/">Главная</b-nav-item>
                <b-nav-item to="/video">Видео</b-nav-item>
                <b-nav-item href="#">История</b-nav-item>
                <b-nav-item href="#">Мои тесты</b-nav-item>
              </b-nav>
            </div>
          </b-sidebar>
        </b-col>

        <!-- Область для контента страниц -->
        <b-col cols="10">
          <main>
            <router-view></router-view>
          </main>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'App',

methods: {
  goToLogin() {
    //this.$router.push('/login'); // Программный переход
    window.location.href = '/login.html';
  }
}
};


</script>

<style>
/* Стили остаются без изменений */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.navbar {
  background-color: rgb(2, 104, 125) !important;
}

/* ... остальные стили из оригинального файла ... */
</style>