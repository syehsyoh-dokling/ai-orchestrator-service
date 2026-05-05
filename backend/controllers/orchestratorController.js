const { getDB } = require('../config/database');
const { callAIModel } = require('../services/aiProviders');
const crypto = require('crypto');

exports.orchestrate = async (req, res) => {
  try {
    const { issue_type, variables, callback_url } = req.body;

    if (!issue_type) {
      return res.status(400).json({ error: 'issue_type is required' });
    }

    const db = getDB();
    const promptTemplate = await db.get('SELECT * FROM prompts WHERE issue_type = ?', [issue_type]);

    if (!promptTemplate) {
      return res.status(404).json({ error: `Prompt template for issue_type '${issue_type}' not found.` });
    }

    // Inject variables
    let finalPrompt = promptTemplate.template;
    if (variables && typeof variables === 'object') {
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        finalPrompt = finalPrompt.replace(regex, value);
      }
    }

    // Call AI Model
    const model = promptTemplate.default_model;
    const aiResponse = await callAIModel(model, finalPrompt);

    // Save log
    const uniqueId = crypto.randomUUID();
    await db.run(
      'INSERT INTO logs (unique_id, issue_type, prompt_sent, model_used, response_received) VALUES (?, ?, ?, ?, ?)',
      [uniqueId, issue_type, finalPrompt, model, aiResponse]
    );

    // Return response
    return res.json({
      success: true,
      unique_id: uniqueId,
      issue_type,
      model_used: model,
      data: aiResponse
    });

  } catch (error) {
    console.error('Orchestration Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
