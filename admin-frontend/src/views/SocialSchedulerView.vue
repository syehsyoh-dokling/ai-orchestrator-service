<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const jobs = ref([])
const isLoading = ref(true)
const showModal = ref(false)

const form = ref({
  image_url: '',
  caption: '',
  platforms: ['facebook'], // default
  include_image: true,
  schedule_time: ''
})

// Use the Queue API URL instead of Orchestrator URL
const QUEUE_API_URL = import.meta.env.VITE_QUEUE_API_URL || 'http://localhost:5000'

const fetchJobs = async () => {
  try {
    const response = await axios.get(`${QUEUE_API_URL}/api/queue/social/jobs`)
    jobs.value = response.data
  } catch (error) {
    console.error('Failed to fetch jobs', error)
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
  form.value = { 
    image_url: '', 
    caption: '', 
    platforms: ['facebook'], 
    include_image: true,
    schedule_time: '' 
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveJob = async () => {
  try {
    await axios.post(`${QUEUE_API_URL}/api/queue/social`, form.value)
    closeModal()
    fetchJobs()
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to schedule post')
  }
}

const deleteJob = async (id) => {
  if (confirm('Are you sure you want to delete this pending post?')) {
    try {
      await axios.delete(`${QUEUE_API_URL}/api/queue/social/jobs/${id}`)
      fetchJobs()
    } catch (error) {
      alert('Failed to delete job')
    }
  }
}

onMounted(() => {
  fetchJobs()
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
        <router-link to="/" class="nav-link">Prompt Manager</router-link>
        <router-link to="/social-scheduler" class="nav-link active">Social Scheduler</router-link>
      </div>
      <button @click="handleLogout" class="btn-secondary">Logout</button>
    </nav>

    <!-- Main Content -->
    <main class="container content">
      <div class="page-header">
        <div>
          <h1>Social Media Scheduler</h1>
          <p class="subtitle">Schedule posts to Facebook & Instagram automatically.</p>
        </div>
        <button @click="openCreateModal" class="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Post
        </button>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <div v-else-if="jobs.length === 0" class="empty-state glass-panel">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <h3>No Scheduled Posts</h3>
        <p>Create your first social media post to get started.</p>
        <button @click="openCreateModal" class="btn-primary mt-4">Schedule Post</button>
      </div>

      <div v-else class="prompt-grid">
        <div v-for="job in jobs" :key="job.id" class="glass-panel prompt-card animate-fade-in">
          <div class="card-header">
            <span class="status-badge" :class="job.status">{{ job.status.toUpperCase() }}</span>
            <div class="card-actions">
              <button v-if="job.status === 'delayed' || job.status === 'waiting' || job.status === 'failed'" @click="deleteJob(job.id)" class="icon-btn danger" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
          
          <div class="platforms-info">
            <span v-for="p in job.data.platforms" :key="p" class="platform-chip">{{ p }}</span>
          </div>

          <h3 class="prompt-desc">{{ job.data.caption.substring(0, 50) }}{{ job.data.caption.length > 50 ? '...' : '' }}</h3>
          
          <div v-if="job.data.image_url" class="image-preview">
            <img :src="job.data.image_url" alt="Post media" />
          </div>

          <div class="job-meta">
            <small v-if="job.delay">⏳ Scheduled in: {{ Math.round(job.delay / 60000) }} mins</small>
            <small v-if="job.failedReason" class="error-text">❌ {{ job.failedReason }}</small>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="glass-panel modal-content animate-fade-in">
        <div class="modal-header">
          <h2>Schedule Social Post</h2>
          <button @click="closeModal" class="icon-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form @submit.prevent="saveJob" class="modal-form">
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Platform Target</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" value="facebook" v-model="form.platforms" /> Facebook
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="instagram" v-model="form.platforms" /> Instagram
                </label>
              </div>
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Include Image</label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.include_image" /> Yes
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Image URL (Public URL required for IG)</label>
            <input type="url" v-model="form.image_url" class="form-input" placeholder="https://yourserver.com/public/image.png" :required="form.platforms.includes('instagram')" />
            <small v-if="form.platforms.includes('instagram')" class="helper-text">Instagram requires an image.</small>
          </div>

          <div class="form-group">
            <label class="form-label">Caption</label>
            <textarea v-model="form.caption" class="form-input" rows="4" required placeholder="What's on your mind?"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Schedule Time (Leave blank to post now)</label>
            <input type="datetime-local" v-model="form.schedule_time" class="form-input" />
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Schedule Post</button>
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

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.delayed { background: rgba(245, 158, 11, 0.15); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.3); }
.status-badge.waiting { background: rgba(107, 114, 128, 0.15); color: #d1d5db; border: 1px solid rgba(107, 114, 128, 0.3); }
.status-badge.active { background: rgba(59, 130, 246, 0.15); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3); }
.status-badge.completed { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }
.status-badge.failed { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }

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

.platforms-info {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.platform-chip {
  background: rgba(255,255,255,0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  text-transform: capitalize;
}

.image-preview {
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
  height: 120px;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.job-meta {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.error-text {
  color: var(--error-color);
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

.checkbox-group {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.helper-text {
  display: block;
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 4px;
}

textarea.form-input {
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}
</style>
