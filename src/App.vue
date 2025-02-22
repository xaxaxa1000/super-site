<template>
  <div id="app" class="bg-white text-black">
    <header class="bg-dark py-3">
      <div class="container">
        <h1 class="text-center text-warning">Видеокурс по информационной безопасности</h1>
      </div>
    </header>
    <main class="py-5">
      <div class="container">
        <div class="row">
          <div class="col-md-8">
            <div class="card mb-4 shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-dark">Введение в информационную безопасность</h5>
                <p class="card-text text-secondary">
                  В этом модуле вы узнаете о базовых понятиях информационной безопасности, ее целях и важности.
                </p>
                <div class="embed-responsive embed-responsive-16by9">
                  <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>
                </div>
              </div>
            </div>
            <div class="card mb-4 shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-dark">Основы кибербезопасности</h5>
                <p class="card-text text-secondary">
                  Изучите основные аспекты кибербезопасности, включая методы защиты данных и системы.
                </p>
                <div class="embed-responsive embed-responsive-16by9">
                  <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>
                </div>
              </div>
            </div>
            <!-- Добавьте больше видео по аналогии -->
          </div>
          <div class="col-md-4">
            <div class="card mb-4 shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-dark">Ресурсы</h5>
                <ul class="list-unstyled">
                  <li><a href="#" class="text-warning">Методические материалы</a></li>
                  <li><a href="#" class="text-warning">Тестовые задания</a></li>
                  <li><a href="#" class="text-warning">Дополнительная литература</a></li>
                </ul>
              </div>
            </div>
            <div class="card mb-4 shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-dark">Контакты</h5>
                <p class="card-text text-secondary">
                  Если у вас есть вопросы, свяжитесь с нами:
                </p>
                <p class="card-text text-secondary">
                  Email: <a href="mailto:info@infosec-course.com" class="text-warning">info@infosec-course.com</a>
                </p>
                <p class="card-text text-secondary">
                  Телефон: <a href="tel:+1234567890" class="text-warning">+123 456 7890</a>
                </p>
              </div>
            </div>
          </div>
        </div>
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