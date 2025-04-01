<template>
  <div>
    <form @submit.prevent="sendResetEmail">
      <input v-model="email" type="email" placeholder="Введите email" required />
      <button type="submit">Сбросить пароль</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      message: ''
    };
  },
  methods: {
    async sendResetEmail() {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email })
        });

        if (response.ok) {
          this.message = 'Письмо отправлено! Проверьте вашу почту.';
        } else {
          this.message = 'Ошибка. Попробуйте еще раз.';
        }
      } catch (error) {
        this.message = 'Ошибка сети.'+error;
      }
    }
  }
};
</script>