const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { CohereClient } = require('cohere-ai');
const { Mistral } = require('@mistralai/mistralai');

/**
 * AI Provider Configuration & Initialization
 * Like AWS Bedrock, this service acts as a unified orchestrator
 * for multiple LLM providers.
 */

// Initialize Providers Lazily based on keys available
const initProviders = () => {
  const providers = {};

  if (process.env.GEMINI_API_KEY) {
    providers.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  
  if (process.env.OPENAI_API_KEY) {
    providers.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    providers.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  if (process.env.COHERE_API_KEY) {
    providers.cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
  }

  if (process.env.MISTRAL_API_KEY) {
    providers.mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
  }

  return providers;
};

/**
 * Route request to appropriate AI model
 * Example model names: 'gemini-1.5-pro', 'gpt-4o', 'claude-3-sonnet-20240229', 'command-r-plus', 'mistral-large-latest'
 */
async function callAIModel(modelName, prompt) {
  const providers = initProviders();
  const lowerModelName = modelName.toLowerCase();

  try {
    // 1. Google Gemini
    if (lowerModelName.includes('gemini')) {
      if (!providers.gemini) throw new Error("GEMINI_API_KEY not configured.");
      const model = providers.gemini.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } 
    
    // 2. OpenAI (GPT)
    else if (lowerModelName.includes('gpt')) {
      if (!providers.openai) throw new Error("OPENAI_API_KEY not configured.");
      const response = await providers.openai.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.choices[0].message.content;
    } 
    
    // 3. Anthropic (Claude)
    else if (lowerModelName.includes('claude')) {
      if (!providers.anthropic) throw new Error("ANTHROPIC_API_KEY not configured.");
      const response = await providers.anthropic.messages.create({
        model: modelName,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.content[0].text;
    } 
    
    // 4. Cohere
    else if (lowerModelName.includes('command')) {
      if (!providers.cohere) throw new Error("COHERE_API_KEY not configured.");
      const response = await providers.cohere.chat({
        message: prompt,
        model: modelName,
      });
      return response.text;
    } 
    
    // 5. Mistral
    else if (lowerModelName.includes('mistral') || lowerModelName.includes('mixtral')) {
      if (!providers.mistral) throw new Error("MISTRAL_API_KEY not configured.");
      const response = await providers.mistral.chat.complete({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.choices[0].message.content;
    } 
    
    // Fallback/Unsupported
    else {
      throw new Error(`Model '${modelName}' is not supported or recognized by the Orchestrator.`);
    }
  } catch (error) {
    console.error(`AI Provider Error [${modelName}]:`, error);
    throw error;
  }
}

module.exports = {
  callAIModel
};
