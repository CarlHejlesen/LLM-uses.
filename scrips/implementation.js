// main.js

const { postToLlamaModel } = require('../funktions/postToLLama');

const fs = require('fs');
const path = require('path');

const url = "http://localhost:5010/v1/chat/completions";
const filePath = path.join(__dirname, 'topic.md');

async function iterativePrompt(initialPrompt, iterations, firstWord, context) {
  let hierarchy = {
      [firstWord]: {}
  };

  let currentLayer = [{ parent: firstWord, word: firstWord }];

  for (let i = 0; i < iterations; i++) {
      let nextLayer = [];

      for (let node of currentLayer) {
          const currentPrompt = initialPrompt + node.word + context;
          console.log(`Iteration ${i + 1}: Sending prompt for ${node.word}...`);

          const result = await postToLlamaModel(currentPrompt, url);

          if (result && result.choices && result.choices[0] && result.choices[0].message) {
              const responseText = result.choices[0].message.content.trim();
              console.log(`Response ${i + 1} for ${node.word}: ${responseText}`);

              // Extract the keywords from the response in the format {apples, bananas, oranges}
              const lastKeywordsMatch = responseText.match(/\{(.+?)\}/);
              if (lastKeywordsMatch) {
                  const lastKeywords = lastKeywordsMatch[1].trim().split(', ');

                  // Update the hierarchy with the new keywords under the current word
                  addToHierarchy(hierarchy, node.word, lastKeywords);

                  // Write the hierarchy to the file
                  writeHierarchyToFile(hierarchy);

                  // Prepare the next layer
                  lastKeywords.forEach(keyword => {
                      nextLayer.push({ parent: node.word, word: keyword });
                  });
              } else {
                  console.error(`Could not find keywords in the correct format for ${node.word}.`);
              }
          } else {
              console.error(`Did not receive a valid response for ${node.word}.`);
          }
      }

      if (nextLayer.length === 0) {
          console.log('No more keywords to process. Stopping the process.');
          break;
      }

      currentLayer = nextLayer; // Move to the next layer
  }
}

function addToHierarchy(hierarchy, parentWord, keywords) {
  let currentLevel = findNodeInHierarchy(hierarchy, parentWord);

  if (!currentLevel) {
      console.error(`Parent word "${parentWord}" not found in hierarchy.`);
      return;
  }

  // Add the new keywords under the correct parent
  keywords.forEach(keyword => {
      if (!currentLevel[keyword]) {
          currentLevel[keyword] = {};
      }
  });
}

function findNodeInHierarchy(hierarchy, word) {
  let stack = [hierarchy];
  while (stack.length > 0) {
      let node = stack.pop();
      if (node[word]) {
          return node[word];
      }
      for (let key in node) {
          stack.push(node[key]);
      }
  }
  return null;
}

function writeHierarchyToFile(hierarchy, indentLevel = 0, parentWord = null) {
  const indent = parentWord === null ? '' : '    '.repeat(indentLevel);
  let output = '';

  if (parentWord) {
      output += `${indent}- ${parentWord}\n`;
  }

  const children = parentWord ? hierarchy[parentWord] : hierarchy;
  for (let key in children) {
      output += writeHierarchyToFile(children, parentWord === null ? 0 : indentLevel + 1, key);
  }

  if (indentLevel === 0 && parentWord === null) {
      fs.writeFileSync(filePath, output, { flag: 'w' });
  }

  return output;
}
  
  // Initial prompt
  const initialPrompt = `
 Implementation by category involves making a concept more concrete by providing specific examples within a particular category.
  It helps reduce abstraction by ensuring that no level of concreteness is skipped.
  For example, if we're talking about "fruit," implementing by category would involve mentioning apples, bananas, and oranges as specific examples of fruits.
  I want you to only give me these next catagories, as keywords. like in the ladder example.
  I want you to put the keywords that implements the original word in this format {apples, bananas, oranges}
  You may never under any cirkumstance make that format if its not for the purpurse of awnsering.
  Only keep the awsners technical, i dont want brands. 
  Example 1: if i ask you to implement a car, i dont give me "toyota" but "motor"
  Example 2: If i ask you to implement a cpu, i dont want the awnser "Core i7" for that is a specific cpu, i want abstract concepts, so the right awnser could be "Alu, Core, cashe" 
  Also you may never return a keyword that is from could be considered a layer of abstraction above the keyword that is given
  The fist word is:
  `;
  let firstWord ="computer"
  let context =": What is inside the computer"
  // Start the iterative process
  iterativePrompt(initialPrompt, 2, firstWord, context);



  