// Function to create and style a box element
function createBoxElement(key) {
    const box = document.createElement('div');

    box.textContent = key;
    box.className = "TextBoks";

    // Add event listeners for interactivity
    box.addEventListener('dblclick', function () {
        box.contentEditable = 'true';
        box.focus();
    });

    box.addEventListener('blur', function () {
        box.contentEditable = 'false';
        let newKey = box.textContent.trim();

        if (newKey !== key) {
            // Additional functionality to handle the key change
            console.log('Key changed from', key, 'to', newKey);
            // Update the key
            key = newKey;
        }
    });

    return box;
}



// Function to create a connector box
function createConnectorBox() {
    const connectorBox = document.createElement('div');
    connectorBox.className = "connectorbox"
    return connectorBox;
}

// Function to create a level container
function createLevelContainer() {
    const levelContainer = document.createElement('div');
    levelContainer.className = "levelcontainer";
    return levelContainer;
}

// Function to create a vertical line
function createVerticalLine() {
    const verticalLine = document.createElement('div');
    verticalLine.className = "verticalline"
    return verticalLine;
}
function createLayerDiv() {
    let div = document.createElement("div")
    div.className = "LayerDiv"

    //  div.style.display = 'flex';
    // div.style.justifyContent = 'center';
    //div.style.alignItems = 'center';
    return div
}

// Function to generate boxes based on hierarchy
async function generateBoxes(hierarchy, container, scaleFactor = 1) {
    for (let key in hierarchy) {


        const conceptBox = ReturnsCoceptDiv(key)
        const levelContainer = createLevelContainer();
        const layerdiv = createLayerDiv()

        layerdiv.appendChild(conceptBox);
        let button = await MakeButtonForNewConceptNotAI();
        //! Her fejler den. Fordi denne her burde splittes op i leaf eller ikke leaf. Til 2 forskellige funktioner.
        conceptBox.appendChild(button)
        // Check if this node is a leaf (i.e., has no children)
        const isLeaf = Object.keys(hierarchy[key]).length === 0;

        if (isLeaf) {
            // Hvis det er en leaf, Så Skal den tilføje til levelkontainer
            const button = createButtonForGeneratingNewLowerConcept();

            conceptBox.appendChild(button);
        }
        levelContainer.appendChild(layerdiv)
        if (!isLeaf) {
            // Hvis det ikke leaf så tilføj buttun til layerdiv.
            isNotLeafRepeatReqursion(levelContainer, hierarchy, key, scaleFactor)
        }

        container.appendChild(levelContainer);
    }
}

function MakeChildcontainer() {
    const childContainer = document.createElement('div');
    childContainer.className = "childContainer"
    return childContainer

}




async function makeConceptboxBellow(container) {

    let nameForbox = "New Boks!2"
    // Start at the container (levelcontainer) and navigate down
    const conceptDiv = container.querySelector(".ConceptDiv");

    if (!conceptDiv) {
        console.error("Could not find the '.ConceptDiv'. Please check the DOM structure.");
        return;
    }

    // Find the TextBoks inside the Div_for_concpetButtons
    const textBoksElement = conceptDiv.querySelector(".Div_for_concpetButtons .TextBoks");

    if (!textBoksElement) {
        console.error("Could not find the '.TextBoks' inside '.Div_for_concpetButtons'.");
        return;
    }

    // Get the parent key from the TextBoks
    let nameOfparentkey = textBoksElement.textContent.trim();
    if (!nameOfparentkey) {
        console.error("TextBoks contains no text or invalid value.");
        return;
    }

    console.log('Parent Key:', nameOfparentkey);

    // Insert the new concept into the global hierarchy via the server API
    insertDataIntoGlobalHierarchy(nameOfparentkey, nameForbox);






    const conceptBox = ReturnsCoceptDiv(nameForbox);

    const levelContainer = createLevelContainer();


    levelContainer.appendChild(conceptBox);
    //  let button = await MakeButtonForNewConceptNotAI();


    // Check if this node is a leaf (i.e., has no children)


    const button = await createButtonForGeneratingNewLowerConcept();


    let notaibox = await MakeButtonForNewConceptNotAI()

    button.prepend(notaibox)

    levelContainer.appendChild(button);
    let childContainer = MakeChildcontainer()
    let verticalLine = createVerticalLine();
    levelContainer.appendChild(verticalLine)
    childContainer.appendChild(levelContainer)

    container.appendChild(childContainer);

}

function isNotLeafRepeatReqursion(levelContainer, hierarchy, key, scaleFactor) {

    const childContainer = MakeChildcontainer()
    const verticalLine = createVerticalLine();
    levelContainer.appendChild(verticalLine);

    generateBoxes(hierarchy[key], childContainer, scaleFactor);

    levelContainer.appendChild(childContainer);
}


// Function to create the outer container
function createOuterContainer() {
    const outerContainer = document.createElement('div');
    outerContainer.className = "outerContainer"
    return outerContainer;
}

// Function to create the inner container
function createInnerContainer() {
    const container = document.createElement('div');
    container.className = "InnerContainer";

    let contextWindow = document.createElement("textarea");
    contextWindow.className = 'contextWindow';

    container.appendChild(contextWindow);
    return container;
}


// Scroll to the center of the page
function scrollToCenterOfPage() {
    const xPos = (document.documentElement.scrollWidth - window.innerWidth) / 2;
    const yPos = (document.documentElement.scrollHeight - window.innerHeight) / 2;
    window.scrollTo(xPos, yPos);
}

// Example usage with your hierarchy and scaling factor
const scaleFactor = 1; // Adjust this value to scale the size of all boxes


function createButtonsThatCreateNewMaps() {
    let button = document.createElement("div")
    button.textContent = "Click me to create a new map!"
    button.style.border = '1px solid black';
    let disablebutton = false;
    button.onclick = () => {
        if (!disablebutton) {
            console.log("Words");
            let starterbox = { "Start here": {} }
            let Innercontainer = createInnerContainer()
            generateBoxes(starterbox, Innercontainer, 1)
            button.textContent = ""
            disablebutton = true
            button.appendChild(Innercontainer)
        }
    };

    return button
}

async function GenerateNewLayerUnderExistingConcept(where, firstWord) {

    const nearestDiv = where.closest('.Innercontainer');

    let context = nearestDiv.firstElementChild.value
    context = ": and the Context is:  " + context
    console.log(context)

    let hierarchy = await iterativePrompt(initialPrompt, 1, firstWord, context);

    generateBoxes(hierarchy, where, 1, firstWord)

    where.firstElementChild.remove();
    where.firstElementChild.remove();

}
function createButtonForGeneratingNewLowerConcept() {

    let div_container = document.createElement("div")
    div_container.className = "inputcontextDiv"
    let input = document.createElement("input")

    input.value = "Context boks"

    let button = document.createElement("div")
    button.textContent = "Generate New LEVEL!"
    
    button.className="newLevelButton"
    let disablebutton = false;
    button.onclick = () => {
        // Find den ovenstående søskende <div> (den med teksten "Bus")
        const previousDiv = div_container.previousElementSibling;
        let firstWord = ""
        // Hent teksten fra den forrige div
        if (previousDiv) {
            const textInPreviousDiv = previousDiv.textContent;
            firstWord = textInPreviousDiv
        }
        disablebutton = true;
        // Find containeren (forældreelementet) som ejer denne <div>
        const parentContainer = div_container.parentElement;

        GenerateNewLayerUnderExistingConcept(parentContainer, firstWord)
        div_container.remove()
    };
    div_container.appendChild(input)
    div_container.appendChild(button)
    return div_container
}

function DeleteButtonSection() {
    let button = document.createElement("div")
    button.textContent = "X"
    button.style.font = "5px"
    button.onclick = () => {
        const nearestDiv = button.closest('.levelcontainer');
        nearestDiv.remove();
    }
    return button
}




const url = "http://localhost:5010/v1/chat/completions";
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
    return hierarchy
    // Save the hierarchy to a JSON file

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
let firstWord = "computer"
let context = ": "
// Start the iterative process





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





const hierarchy = {
    "computer": {
        "CPU": {
            "Alu": {
                "Transistor": {
                    "Gate": {
                        "AND": {},
                        "OR": {},
                        "NOT": {}
                    },
                    "Diode": {},
                    "Resistor": {}
                },
                "Gate": {},
                "Wire": {}
            },
            "Core": {},
            "Cache": {},
            "Registers": {},
            "Bus": {}
        },
        "Motherboard": {
            "Circuit Board": {},
            "Printed Circuit Board": {},
            "PCB": {}
        },
        "RAM": {
            "DRAM": {},
            "SDRAM": {},
            "SRAM": {}
        },
        "Storage": {}
    }
};
let globalHierarchy = {}
globalHierarchy.hierarchy

function insertDataIntoGlobalHierarchy() {

}
function RemoveDataFromGlobalHirarchy() {

}


function MakeButtonForNewConceptNotAI() {
    let button = document.createElement("div")
    button.className = "New Concept button"
    button.textContent = "New Concept"
    button.onclick = () => {
        const nearestDiv = button.closest('.levelcontainer');

        let verticalLine = createVerticalLine();
        nearestDiv.appendChild(verticalLine)

        makeConceptboxBellow(nearestDiv)
        var inputContextDiv = nearestDiv.querySelector('div.inputcontextDiv');
        inputContextDiv.remove();

    }
    return button
}


const outerContainer = createOuterContainer();
const container = createInnerContainer();

outerContainer.appendChild(container);



document.body.appendChild(outerContainer);

// Generate the boxes and display them in the container
generateBoxes(hierarchy, container, scaleFactor);

let button = createButtonsThatCreateNewMaps()
outerContainer.appendChild(button)







// Scroll to center after everything is fully loaded
window.onload = function () {
    setTimeout(() => {
        scrollToCenterOfPage();
    }, 100); // Delay the scroll to allow rendering to complete
};





function ReturnsCoceptDiv(text) {

    let conceptBox = createBoxElement(text)

    let conceptDiv = document.createElement("div")
    conceptDiv.className = "ConceptDiv"



    conceptDiv.style.display = 'flex';
    conceptDiv.style.flexDirection = 'column';
    conceptDiv.style.alignItems = 'center';

    // Vi laver conncetor box
    const connectorBox = createConnectorBox();

    conceptDiv.appendChild(connectorBox)
    //Vi laver slet knap til concept
    let deletebutten = DeleteButtonSection()
    conceptDiv.appendChild(deletebutten)

    // Vi laver diven som concept boxen er i .
    let div_for_conceptbox_buttons = document.createElement("div")
    div_for_conceptbox_buttons.className = "Div_for_concpetButtons"

    div_for_conceptbox_buttons.style.display = 'flex';
    div_for_conceptbox_buttons.style.justifyContent = 'center';
    div_for_conceptbox_buttons.style.alignItems = 'center';

    // Venstre og højre plus
    let buttonCreateConceptONsameLevelLeft = createConceptLeft()
    div_for_conceptbox_buttons.appendChild(buttonCreateConceptONsameLevelLeft)

    let buttonCreateConceptONsameLevelRight = createConceptRight()
    div_for_conceptbox_buttons.appendChild(conceptBox)
    div_for_conceptbox_buttons.appendChild(buttonCreateConceptONsameLevelRight)


    conceptDiv.appendChild(div_for_conceptbox_buttons)

    const connectorBox2 = createConnectorBox();

    conceptDiv.appendChild(connectorBox2)

    return conceptDiv
}


function createConceptLeft() {
    let button = document.createElement("div");
    button.textContent = "+";
    button.style.fontSize = "20px";
    button.style.cursor = "pointer";

    button.onclick = () => {
        // Find den nærmeste .levelcontainer, som er forælder til denne knap
        const currentLevelContainer = button.closest('.levelcontainer');

        // Opret en ny levelcontainer til venstre
        const newLevelContainer = createLevelContainer(); // Brug en margin på 10 eller hvad du ønsker
        const newConceptBox = ReturnsCoceptDiv("Nyt koncept"); // Du kan ændre teksten, hvis det skal være noget dynamisk


        // Tilføj den nye boks til den nye levelcontainer
        newLevelContainer.appendChild(newConceptBox);
        const button22 = createButtonForGeneratingNewLowerConcept();

        newLevelContainer.appendChild(button22)
        let make_new_concept_button = MakeButtonForNewConceptNotAI()

        newLevelContainer.appendChild(make_new_concept_button)

        // Indsæt den nye levelcontainer før den eksisterende levelcontainer
        currentLevelContainer.parentNode.insertBefore(newLevelContainer, currentLevelContainer);
    };

    return button;
}
function createConceptRight() {
    let button = document.createElement("div");
    button.textContent = "+";
    button.style.fontSize = "20px";
    button.style.cursor = "pointer";

    button.onclick = () => {
        // Find den nærmeste .levelcontainer, som er forælder til denne knap
        const currentLevelContainer = button.closest('.levelcontainer');

        // Opret en ny levelcontainer til højre
        const newLevelContainer = createLevelContainer(); // Brug en margin på 10 eller hvad du ønsker
        const newConceptBox = ReturnsCoceptDiv("Nyt koncept"); // Du kan ændre teksten, hvis det skal være noget dynamisk

        // Tilføj den nye boks til den nye levelcontainer
        newLevelContainer.appendChild(newConceptBox);
        const button22 = createButtonForGeneratingNewLowerConcept();
        newLevelContainer.appendChild(button22);
        let make_new_concept_button = MakeButtonForNewConceptNotAI();
        newLevelContainer.appendChild(make_new_concept_button);

        // Indsæt den nye levelcontainer efter den eksisterende levelcontainer
        currentLevelContainer.parentNode.insertBefore(newLevelContainer, currentLevelContainer.nextSibling);
    };

    return button;
}



function MakeReglerOgkarakteristikaBoks() {

}

// Function to create and style a box element  R regler og Karakterisktika.
function createRKBoks(key, width, height) {
    const box = document.createElement('div');
    box.style.border = '1px solid black';
    box.style.padding = '10px';
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;
    box.style.boxSizing = 'border-box';
    box.style.textAlign = 'center';
    box.style.display = 'flex'; // Skift fra inline-block til flex
    box.style.justifyContent = 'center'; // Centrerer indhold vandret
    box.style.alignItems = 'center'; // Centrerer indhold lodret
    box.textContent = key;
    box.className = "TextBoks";

    // Add double-click event to make the text editable
    box.addEventListener('dblclick', function () {
        box.contentEditable = 'true'; // Make the content editable
        box.focus(); // Focus on the box so the user can start typing
    });

    // Add blur event to disable editing and save changes
    box.addEventListener('blur', function () {
        box.contentEditable = 'false'; // Disable editing
        key = box.textContent; // Update the key if needed
        // Optionally, you could also trigger a function here to save changes
    });

    return box;
}




// Function to insert data into globalHierarchy via API
function insertDataIntoGlobalHierarchy(parentKey, newKey) {
    fetch("/PostObject", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ parentKey, newKey })
    })
        .then(response => response.json())
        .then(data => console.log(data.message))
        .catch(error => console.error('Error:', error));
}
// Function to remove data from globalHierarchy via API
function RemoveDataFromGlobalHierarchy(parentKey, keyToRemove) {
    fetch("/DeleteObject", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ parentKey, keyToRemove })
    })
        .then(response => response.json())
        .then(data => console.log(data.message))
        .catch(error => console.error('Error:', error));
}
// Function to change object in globalHierarchy via API
function changeDataInGlobalHierarchy(parentKey, oldKey, newKey) {
    fetch("/ChangeObject", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ parentKey, oldKey, newKey })
    })
        .then(response => response.json())
        .then(data => console.log(data.message))
        .catch(error => console.error('Error:', error));
}
