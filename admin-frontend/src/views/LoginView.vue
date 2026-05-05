<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const response = await axios.post(`${API_URL}/api/admin/login`, {
      username: username.value,
      password: password.value
    })
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('username', response.data.username)
      router.push('/')
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to login'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="glass-panel login-card animate-fade-in">
      <div class="login-header">
        <div class="logo-circle">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <h1>AI Orchestrator</h1>
        <p>Sign in to manage prompt templates</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input 
            type="text" 
            v-model="username" 
            class="form-input" 
            placeholder="admin"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">Password</label>
          <input 
            type="password" 
            v-model="password" 
            class="form-input" 
            placeholder="••••••••"
            required
          />
        </div>
        
        <div v-if="error" class="error-msg">
          {{ error }}
        </div>
        
        <button type="submit" class="btn-primary login-btn" :disabled="isLoading">
          <span v-if="isLoading">Authenticating...</span>
          <span v-else>Sign In</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-circle {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  box-shadow: 0 4px 20px rgba(123, 66, 246, 0.4);
}

.login-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.login-header p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.login-btn {
  width: 100%;
  padding: 14px;
  font-size: 1rem;
  margin-top: 10px;
}

.error-msg {
  color: var(--error-color);
  font-size: 0.9rem;
  background: rgba(239, 68, 68, 0.1);
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
}
</style>
