const { getDB } = require('../config/database');

exports.getAllPrompts = async (req, res) => {
  try {
    const db = getDB();
    const prompts = await db.all('SELECT * FROM prompts ORDER BY created_at DESC');
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPromptById = async (req, res) => {
  try {
    const db = getDB();
    const prompt = await db.get('SELECT * FROM prompts WHERE id = ?', [req.params.id]);
    if (!prompt) return res.status(404).json({ error: 'Not found' });
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPrompt = async (req, res) => {
  try {
    const { issue_type, template, default_model, description } = req.body;
    const db = getDB();
    
    const result = await db.run(
      'INSERT INTO prompts (issue_type, template, default_model, description) VALUES (?, ?, ?, ?)',
      [issue_type, template, default_model || 'gemini-3.1-pro', description]
    );
    
    res.status(201).json({ id: result.lastID, issue_type, message: 'Created successfully' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'issue_type must be unique' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updatePrompt = async (req, res) => {
  try {
    const { issue_type, template, default_model, description } = req.body;
    const db = getDB();
    
    await db.run(
      'UPDATE prompts SET issue_type = ?, template = ?, default_model = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [issue_type, template, default_model, description, req.params.id]
    );
    
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePrompt = async (req, res) => {
  try {
    const db = getDB();
    await db.run('DELETE FROM prompts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
