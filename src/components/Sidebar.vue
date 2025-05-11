<template>
  <aside class="sidebar">
    <nav>
      <router-link to="/home">Главная</router-link>
      <router-link to="/applicant">Абитурьенту</router-link>
      <!-- Другие ссылки -->
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  padding: 20px;
  background: #f8f9fa;
}

nav a {
  display: block;
  padding: 10px;
  margin: 5px 0;
  text-decoration: none;
  color: #333;
  border-radius: 4px;
}

nav a.router-link-exact-active {
  background: #42b983;
  color: white;
}
</style>