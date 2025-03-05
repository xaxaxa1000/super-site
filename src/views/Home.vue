<template>
  <div class="home">
    <Header />       <!-- Шапка -->
    <Sidebar />      <!-- Боковое меню -->
    <div class="content">
      <router-view /> <!-- Здесь отображаются VideoGallery или VideoPlayer -->
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';

export default {
  components: { Header, Sidebar }
};
</script>