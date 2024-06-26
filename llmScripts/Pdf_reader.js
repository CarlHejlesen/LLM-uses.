const fs = require('fs');
const pdfParse = require('pdf-parse');

const MAX_PAGES = 1000;  // Constant to define the number of pages to process

class Page {
  constructor(number, sentences) {
    this.number = number;
    this.sentences = sentences;
  }
}

class PDF {
  constructor(filePath) {
    this.filePath = filePath;
    this.pages = [];
  }

  async load() {
    const dataBuffer = fs.readFileSync(this.filePath);
    const data = await pdfParse(dataBuffer);
    const pageTexts = data.text.split('\n\n');

    for (let i = 0; i < Math.min(pageTexts.length, MAX_PAGES); i++) {
      const sentences = pageTexts[i].split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/); // Split text into sentences
      const page = new Page(i + 1, sentences);
      this.pages.push(page);
    }
  }

  getPage(number) {
    return this.pages[number - 1];
  }

  toJSON() {
    return {
      filePath: this.filePath,
      pages: this.pages.map(page => ({
        number: page.number,
        sentences: page.sentences
      }))
    };
  }
}

async function main() {
  const pdf = new PDF('./random.pdf');
  await pdf.load();
  return pdf;
}

async function processPDF() {
  try {
    let pdf_object = await main();

    const outputFilePath = './pdfData.json';
    const jsonData = JSON.stringify(pdf_object.toJSON(), null, 2);
    fs.writeFileSync(outputFilePath, jsonData);
    console.log(`PDF data has been saved to ${outputFilePath}`);

    // Access and print the sentences from page 8 (index 7)
    let sentence = pdf_object.pages[6].sentences; // Adjusted to zero-based index for page 7
    console.log(sentence);
    return sentence;
  } catch (error) {
    console.error(error);
    return null;
  }
}


let list = "Advantages of [Insert topic], Disadvantages of [Insert topic], How [Insert topic] works.";
let fag = "SPO:Languages and Compilers";
let request = "What i want from you:You will awnser as if you have a phd in the topic. Youre awnsers have to be very short, focused and should cut out any information that lacks substance. If there is no Mention of advantages or disadvanges dont mentioned the tags in the analays."
let perfect_promt = "I am currently reading up on this Topic: " + fag + ". Can you extrapolate every variable/aspect of what this sentence tries to communicate? I want you to categorize it by giving it only tags of list: " + list + "" + request + ". Here are the sentences:";

async function execute() {
  //let sentences = await processPDF();
  let pdf_object = await main();




  if (sentences) {
    let promts = await make_prompts(sentences, perfect_promt);
    let answers = await postSentences(promts);


    let findings = await collectFindings(answers)

    let summerizePag = await summerizePage(findings)
    console.log("this is it.")
    console.log(summerizePag)
    makeToFile(summerizePag, "summerization")
  }
}

async function makeToFile(content, filename) {
  try {
    const outputFilePath = `./${filename}.md`;
    const markdownContent = convertToMarkdown(content);
    fs.writeFileSync(outputFilePath, markdownContent);
    console.log(`PDF data has been saved to ${outputFilePath}`);
  } catch (error) {
    console.error("Error writing to file:", error);
  }
}

function convertToMarkdown(content) {
  // Assuming content is an object or array. Adjust the logic based on the actual structure.
  if (Array.isArray(content)) {
    return content.map(item => `- ${item}`).join('\n');
  } else if (typeof content === 'object') {
    return Object.entries(content).map(([key, value]) => `**${key}**: ${value}`).join('\n');
  } else {
    return content.toString();
  }
}



execute();



async function summerizePage(findings) {
  let format = " I want the format for youre output to be as sucth. Dont say what you did, only give the new text"
  let promtMessage = "Please take all of this, remove recurring point variables and tags , also Catagorize it so its structured better. Additionnaly While keeping the same points, remove all unesersary text, and make it as short as possible." + format + ". Here is the text:" + findings

  let response = await postToLlamaModel(promtMessage)
  let page_summer = response.choices[0].message.content;
  return page_summer
}




async function make_prompts(sentences, perfect_prompt) {
  let prompts = [];
  let sentenceLength = sentences.length;
  for (let i = 0; i < sentenceLength; i += 3) {
    let active_sentence = sentences[i] || '';
    if (i + 1 < sentenceLength) active_sentence += ' ' + sentences[i + 1];
    if (i + 2 < sentenceLength) active_sentence += ' ' + sentences[i + 2];
    let prompt = perfect_prompt + ' ' + active_sentence;
    prompts.push(prompt);
  }
  return prompts;
}

async function collectFindings(promt_awnsers) {
  let collected_strings = ""

  let Length = promt_awnsers.length;
  for (let i = 0; i < Length; i++) {
    collected_strings = collected_strings + promt_awnsers[i]
  }

  return collected_strings
}





async function postSentences(prompts) {
  let answers = [];
  while (prompts.length > 0) {
    let message = prompts.shift();
    try {
      let response = await postToLlamaModel(message);
      if (response) {
        let answer = response.choices[0].message.content;
        answers.push(answer);
        console.log(answer);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }
  return answers;
}

async function postToLlamaModel(prompt) {
  const url = 'http://localhost:5010/v1/chat/completions';
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
