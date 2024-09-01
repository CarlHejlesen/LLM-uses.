// main.js

const { postToLlamaModel } = require('../funktions/postToLLama');


const url="http://localhost:5010/v1/chat/completions"

async function iterativePrompt(initialPrompt, iterations, firstWord, context) {
    let usedWords = [];
    let currentPrompt = initialPrompt + firstWord + context;
  
    for (let i = 0; i < iterations; i++) {
      console.log(`Iteration ${i + 1}: Sending prompt...`);
  
      const result = await postToLlamaModel(currentPrompt, url);
  
      if (result && result.choices && result.choices[0] && result.choices[0].message) {
        const responseText = result.choices[0].message.content.trim();
        console.log(`Response ${i + 1}: ${responseText}`);
  
        // Ekstrakterer de sidste nøgleord fra svaret i formatet {apples, bananas, oranges}
        const lastKeywordsMatch = responseText.match(/\{(.+?)\}/);
        if (lastKeywordsMatch) {
          const lastKeywords = lastKeywordsMatch[1].trim().split(', ');
  
          // Find det første nøgleord, som ikke allerede er brugt
          let nextWord = lastKeywords.find(word => !usedWords.includes(word));
  
          if (nextWord) {
            usedWords.push(nextWord); // Tilføj ordet til listen over brugte ord
            currentPrompt = initialPrompt + `${nextWord}'` +context;
          } else {
            console.log('Alle nøgleord er allerede brugt. Stopper processen.');
            break;
          }
        } else {
          console.error('Kunne ikke finde nøgleordene i det korrekte format.');
          break;
        }
      } else {
        console.error('Modtog ikke et gyldigt svar fra modellen.');
        break;
      }
    }
  }
  
  // Initial prompt
  const initialPrompt = `
 Implementation by category involves making a concept more concrete by providing specific examples within a particular category.
  It helps reduce abstraction by ensuring that no level of concreteness is skipped.
  For example, if we're talking about "fruit," implementing by category would involve mentioning apples, bananas, and oranges as specific examples of fruits.
  I want you to only give me these next catagories, as keywords. like in the ladder example.
  I want you to put the keywords that implements the original word in this format {apples, bananas, oranges}
  Only keep the awsners technical, i dont want brands. 
  Example 1: if i ask you to implement a car, i dont give me "toyota" but "motor"
  Example 2: If i ask you to implement a cpu, i dont want the awnser "Core i7" for that is a specific cpu, i want abstract concepts, so the right awnser could be "Alu, Core, cashe" 
 
  The fist word is:
  `;
  let firstWord ="computer"
  let context =": What is inside the computer"
  // Start the iterative process
  iterativePrompt(initialPrompt, 5, firstWord, context);