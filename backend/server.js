require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initDB } = require('./config/database');

const authController = require('./controllers/authController');
const promptController = require('./controllers/promptController');
const orchestratorController = require('./controllers/orchestratorController');
const translatorController = require('./controllers/translatorController');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 4001;

// Konfigurasi multer untuk menerima file audio di memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // max 20 MB
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
// 1. Admin Auth
app.post('/api/admin/login', authController.login);

// 2. Prompt Management (Protected)
app.get('/api/admin/prompts', authController.verifyToken, promptController.getAllPrompts);
app.get('/api/admin/prompts/:id', authController.verifyToken, promptController.getPromptById);
app.post('/api/admin/prompts', authController.verifyToken, promptController.createPrompt);
app.put('/api/admin/prompts/:id', authController.verifyToken, promptController.updatePrompt);
app.delete('/api/admin/prompts/:id', authController.verifyToken, promptController.deletePrompt);

// 3. Orchestration API (For Main BE)
// In a real app, this should be protected by an API key or internal network auth
app.post('/api/orchestrate', orchestratorController.orchestrate);

// 4. Translator Agent API
app.post('/api/translator/chat', translatorController.chat);
app.post('/api/translator/transcribe', upload.single('audio'), translatorController.transcribe);

// Initialize DB and Start Server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`AI Orchestrator running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
