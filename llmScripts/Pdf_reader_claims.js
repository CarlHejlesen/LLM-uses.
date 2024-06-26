const fs = require('fs');
const pdfParse = require('pdf-parse');

const MAX_PAGES = 1000;  // Constant to define the number of pages to process

class Claim {
    constructor(text, flag = false) {
        this.text = text;
        this.flag = flag;
    }
}

class Page {
    constructor(number, originalText) {
        this.number = number;
        this.originalText = originalText;
        this.claims = [];
    }

    addClaim(claim) {
        this.claims.push(claim);
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
            const originalText = pageTexts[i];
            const page = new Page(i + 1, originalText);
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
                originalText: page.originalText,
                claims: page.claims.map(claim => ({
                    text: claim.text,
                    flag: claim.flag
                }))
            }))
        };
    }
}

async function main() {
    const pdf = new PDF('./random.pdf');
    await pdf.load();
   // console.log(pdf);
    let pdf_now_with_claims = await getclaim(pdf);

    writeToFile(pdf_now_with_claims.toJSON(), './pdfData.json');
    console.log(`PDF data has been saved to ./pdfData.json`);
}

main();

let help = "If there are no claims just type:No claims. IN the case there is no text, or a weird input dont say anything just text just return a:[]";
let multipleclaimsInASENTENCE = "If there is multiple claims in a sentence, split them up, make the claims as atomic as possible."
let dontsaystuff = "i dont want anything else from you. so dont say anything that i dont request.";
let whatIsACLAIM ="A claim is a statement that asserts something to be true or argued to be true. "
let format = `. i want "JSON array format [{"claim": "claim 1"}, {"claim": "claim 2"}]"`;
let herearethe = ".here are the text:";
let promt_request = "I want you to extract all possible claims from the following text. Also i want you to put the claims in an array format as sutch [claim,claim,claim]"
promt_request = promt_request + help + dontsaystuff +whatIsACLAIM+ multipleclaimsInASENTENCE +format + herearethe;

async function getclaim(pdf) {
    if (pdf instanceof PDF) {
        let pdf_lenght = pdf.pages.length;
        for (let i = 0; i < pdf_lenght; i++) {
            let textcontent = pdf.pages[i].originalText;  // Fixed property name
            let promt = promt_request + textcontent;
            console.log("Loading..... We are a page:"+i+" ....Currently")
            let response = await postToLlamaModel(promt);
            let claims_not_Filtered = response.choices[0].message.content;
            let filtered_claims = extractClaimsArray(claims_not_Filtered)
            for (let j = 0; j < filtered_claims.length; j++) {
                let claimObj = filtered_claims[j];
                let claim = new Claim(claimObj.claim);
                pdf.pages[i].addClaim(claim);
            }
        }
        return pdf;
    }
}

function extractClaimsArray(text) {
    const regex = /\[{"claim": ".*?"}(?:, {"claim": ".*?"})*]/;
    const match = text.match(regex);

    if (match && match[0]) {
        try {
            const claimsArray = JSON.parse(match[0]);
            return claimsArray;
        } catch (error) {
            console.error("Error parsing claims array:", error);
            return [];
        }
    } else {
        return [];
    }
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

function writeToFile(data, filePath) {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData);
}
