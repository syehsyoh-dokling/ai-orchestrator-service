const fs = require('fs');
const os = require('os');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.chat = async (req, res) => {
  try {
    const { text, sourceLang, targetLang, mode } = req.body || {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'BAD_REQUEST', message: 'Field "text" is required and must be a string.' }
      });
    }

    const src = sourceLang || 'auto';
    const tgt = targetLang || 'en';
    const chatMode = mode || 'translate_and_answer';

    const systemPrompt = `
You are a translation and explanation assistant.

Rules:
- Detect the language of the user input if sourceLang is "auto".
- Always translate the user input into the target language.
- If mode is "translate_only": only return the translation.
- If mode is "translate_and_answer": return the translation AND a short helpful answer in the target language.
- Respond strictly as a JSON object with keys:
  - "translation": string
  - "explanation": string (can be empty if translate_only)
Do NOT include any other keys or text outside JSON.
    `.trim();

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify({ text, sourceLang: src, targetLang: tgt, mode: chatMode }) }
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.2
    });

    const raw = completion.choices[0]?.message?.content || '{}';

    let parsed = {};
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse GPT JSON:', e, 'raw content:', raw);
      return res.status(500).json({
        success: false,
        data: null,
        error: { code: 'PARSE_ERROR', message: 'Failed to parse GPT response as JSON.' }
      });
    }

    res.json({
      success: true,
      data: {
        translation: parsed.translation || '',
        explanation: parsed.explanation || '',
        sourceLang: src,
        targetLang: tgt
      },
      error: null
    });
  } catch (err) {
    console.error('Error in translator chat:', err);
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: err?.message || 'Unknown error' }
    });
  }
};

exports.transcribe = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'BAD_REQUEST', message: 'Field "audio" (file) is required.' }
      });
    }

    console.log('Received audio file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const tmpDir = os.tmpdir();
    const tmpPath = path.join(
      tmpDir,
      `upload-${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
    );

    await fs.promises.writeFile(tmpPath, req.file.buffer);

    try {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tmpPath),
        model: 'whisper-1',
        response_format: 'json'
      });

      const text = transcription.text || '';

      return res.json({
        success: true,
        data: { text, detectedLang: 'unknown', durationSec: null },
        error: null
      });
    } finally {
      try {
        await fs.promises.unlink(tmpPath);
      } catch (cleanupErr) {
        console.warn('Failed to cleanup temp file:', cleanupErr);
      }
    }
  } catch (err) {
    console.error('Error in translator transcribe:', err);
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: err?.message || 'Unknown error' }
    });
  }
};
