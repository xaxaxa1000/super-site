<template>
  <div>
    <h1>Страница с видео</h1>
    <p>Здесь можно разместить видео.</p>
    <button @click="goBack">Вернуться назад</button>
  </div>
</template>

<script>
export default {
  name: 'Video',
  methods: {
    goBack() {
      this.$router.go(-1); // Возврат на предыдущую страницу
    },
  },
};
</script>

<style scoped>
button {
  padding: 10px 20px;
  background-color: green;
  color: white;
  border: none;
  cursor: pointer;
}
</style>