// llamaModel.js

async function postToLlamaModel(prompt, url) {
    
    const data = {
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error posting to LLaMA model:', error);
      return null;
    }
  }
  
  module.exports = { postToLlamaModel };