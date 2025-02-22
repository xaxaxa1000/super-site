<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" id="custom">
      <b-navbar-brand href="#">
        <div class="logo mr-2"></div>
        SibTube
      </b-navbar-brand>

      <b-navbar-nav class="ml-auto mr-auto input_size">
        <b-form-input size="sm" class="mr-sm-2" placeholder="Поиск..." />
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
        <b-avatar text="Ю" variant="light" class="mr-2"></b-avatar>
        <span class="align-middle">Юзер</span>
      </b-navbar-nav>
    </b-navbar>
    <b-container fluid>
      <b-row>
        <b-col cols="2">
          <b-sidebar id="sidebar-1" title="Меню управления" bg-variant="primary" text-variant="light">
            <div class="px-3 py-2">
              <b-nav vertical>
                <b-nav-item href="#">Плейлисты</b-nav-item>
                <b-nav-item href="#">История</b-nav-item>
                <b-nav-item href="#">Мои тесты</b-nav-item>
              </b-nav>
            </div>
          </b-sidebar>
        </b-col>
        <b-col cols="8">
          <b-row>
            <b-col cols="12" v-for="(video, index) in videos" :key="index">
              <b-card class="mb-3">
                <b-embed
                  type="iframe"
                  aspect="16by9"
                  :src="video.src"
                  allowfullscreen
                ></b-embed>
                <b-card-title>{{ video.title }}</b-card-title>
                <b-card-text>{{ video.description }}</b-card-text>
              </b-card>
            </b-col>
          </b-row>
        </b-col>
        <b-col cols="2">
          <b-card title="Описание видео">
            <b-card-text>
              Это описание видео. Здесь можно добавить подробную информацию о видео.
            </b-card-text>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      videos: [
        {
          src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          title: 'Видео 1',
          description: 'Описание видео 1'
        },
        {
          src: 'https://www.youtube.com/embed/M7lc1UVf-VE',
          title: 'Видео 2',
          description: 'Описание видео 2'
        },
        {
          src: 'https://www.youtube.com/embed/9bZkp7q19f0',
          title: 'Видео 3',
          description: 'Описание видео 3'
        }
      ]
    };
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.navbar {
  background-color: rgb(2, 104, 125) !important;
}

#custom {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.sidebar {
  background-color: #0056b3 !important;
}

.card {
  margin-top: 20px;
}

.b-sidebar {
  height: 100vh;
}

.logo {
  width: 20px;
  height: 20px;
  background-color: #fff;
  border-radius: 50%;
  display: inline-block;
  margin-right: 10px;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.navbar-nav.ml-auto.mr-auto {
  justify-content: center;
}

.navbar-nav.ml-auto {
  align-items: center;
}

.input_size {
  width: 600px;
}

.align-middle {
  vertical-align: middle;
  margin-left: 5px;
}
</style>