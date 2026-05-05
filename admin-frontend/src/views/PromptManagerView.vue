<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const prompts = ref([])
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)

const form = ref({
  id: null,
  issue_type: '',
  description: '',
  default_model: 'gemini-3.1-pro',
  template: ''
})

const getHeaders = () => {
  return {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const fetchPrompts = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/prompts`, {
      headers: getHeaders()
    })
    prompts.value = response.data
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      handleLogout()
    }
    console.error('Failed to fetch prompts', error)
  } finally {
    isLoading.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}

const openCreateModal = () => {
  isEditing.value = false
  form.value = { id: null, issue_type: '', description: '', default_model: 'gemini-3.1-pro', template: '' }
  showModal.value = true
}

const openEditModal = (prompt) => {
  isEditing.value = true
  form.value = { ...prompt }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const savePrompt = async () => {
  try {
    if (isEditing.value) {
      await axios.put(`${API_URL}/api/admin/prompts/${form.value.id}`, form.value, { headers: getHeaders() })
    } else {
      await axios.post(`${API_URL}/api/admin/prompts`, form.value, { headers: getHeaders() })
    }
    closeModal()
    fetchPrompts()
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to save prompt')
  }
}

const deletePrompt = async (id) => {
  if (confirm('Are you sure you want to delete this prompt template?')) {
    try {
      await axios.delete(`${API_URL}/api/admin/prompts/${id}`, { headers: getHeaders() })
      fetchPrompts()
    } catch (error) {
      alert('Failed to delete prompt')
    }
  }
}

onMounted(() => {
  fetchPrompts()
})
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- Navbar -->
    <nav class="glass-panel navbar">
      <div class="nav-brand">
        <div class="logo-circle-small">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <h2>AI Orchestrator Admin</h2>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link active">Prompt Manager</router-link>
        <router-link to="/social-scheduler" class="nav-link">Social Scheduler</router-link>
      </div>
      <button @click="handleLogout" class="btn-secondary">Logout</button>
    </nav>

    <!-- Main Content -->
    <main class="container content">
      <div class="page-header">
        <div>
          <h1>Prompt Templates</h1>
          <p class="subtitle">Manage AI instructions for different system issues.</p>
        </div>
        <button @click="openCreateModal" class="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Template
        </button>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <div v-else-if="prompts.length === 0" class="empty-state glass-panel">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <h3>No templates found</h3>
        <p>Create your first prompt template to get started.</p>
        <button @click="openCreateModal" class="btn-primary mt-4">Create Template</button>
      </div>

      <div v-else class="prompt-grid">
        <div v-for="prompt in prompts" :key="prompt.id" class="glass-panel prompt-card animate-fade-in">
          <div class="card-header">
            <span class="issue-badge">{{ prompt.issue_type }}</span>
            <div class="card-actions">
              <button @click="openEditModal(prompt)" class="icon-btn" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button @click="deletePrompt(prompt.id)" class="icon-btn danger" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
          <h3 class="prompt-desc">{{ prompt.description || 'No description provided' }}</h3>
          <div class="model-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            {{ prompt.default_model }}
          </div>
          <div class="template-preview">
            <code>{{ prompt.template.substring(0, 100) }}{{ prompt.template.length > 100 ? '...' : '' }}</code>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="glass-panel modal-content animate-fade-in">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Template' : 'New Template' }}</h2>
          <button @click="closeModal" class="icon-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form @submit.prevent="savePrompt" class="modal-form">
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Issue Type (Unique Key)</label>
              <input type="text" v-model="form.issue_type" class="form-input" required placeholder="e.g. user_matching" :disabled="isEditing" />
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Default Model</label>
              <select v-model="form.default_model" class="form-input">
                <optgroup label="Google">
                  <option value="gemini-3.1-pro">Gemini 3.1 Pro</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </optgroup>
                <optgroup label="OpenAI">
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </optgroup>
                <optgroup label="Anthropic">
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                  <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                </optgroup>
                <optgroup label="Cohere">
                  <option value="command-r-plus">Command R+</option>
                  <option value="command-r">Command R</option>
                </optgroup>
                <optgroup label="Mistral">
                  <option value="mistral-large-latest">Mistral Large</option>
                  <option value="mistral-medium">Mistral Medium</option>
                  <option value="mistral-small">Mistral Small</option>
                </optgroup>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Description</label>
            <input type="text" v-model="form.description" class="form-input" placeholder="Brief description of what this prompt does" />
          </div>

          <div class="form-group">
            <label class="form-label">Prompt Template (Use {{variable_name}} for variables)</label>
            <textarea v-model="form.template" class="form-input" rows="8" required placeholder="You are an AI assistant. Analyze {{data}}..."></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Save Template</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  border-radius: 0;
  border-top: none;
  border-left: none;
  border-right: none;
  margin-bottom: 40px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-circle-small {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.nav-brand h2 {
  font-size: 1.2rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  padding: 8px 12px;
  border-radius: 8px;
}

.nav-link:hover {
  color: white;
  background: rgba(255,255,255,0.05);
}

.nav-link.active {
  color: white;
  background: rgba(123, 66, 246, 0.15);
  border: 1px solid rgba(123, 66, 246, 0.3);
}

.content {
  padding-bottom: 60px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(123, 66, 246, 0.2);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-state svg {
  margin-bottom: 16px;
}

.mt-4 { margin-top: 16px; }

.prompt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.prompt-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.prompt-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(123, 66, 246, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.issue-badge {
  background: rgba(123, 66, 246, 0.15);
  color: #a78bfa;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(123, 66, 246, 0.3);
}

.card-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.icon-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

.prompt-desc {
  font-size: 1.1rem;
  margin-bottom: 12px;
  font-weight: 500;
}

.model-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.template-preview {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  flex-grow: 1;
  border: 1px solid var(--border-color);
}

.template-preview code {
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 600px;
  padding: 32px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 1.5rem;
}

.form-row {
  display: flex;
  gap: 16px;
}

.flex-1 {
  flex: 1;
}

textarea.form-input {
  resize: vertical;
  font-family: monospace;
}

select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

select.form-input option {
  background: var(--surface-color);
  color: white;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}
</style>
