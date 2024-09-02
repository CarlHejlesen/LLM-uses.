// Function to create and style a box element
function createBoxElement(key, width, height, margin) {
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

// Function to create a connector box
function createConnectorBox(height, width = '10px') {
    const connectorBox = document.createElement('div');
    connectorBox.style.width = width; // Narrow width for the connector
    connectorBox.style.height = `${height}px`; // Thickness and length of the connector
    connectorBox.style.backgroundColor = 'black';
    return connectorBox;
}

// Function to create a level container
function createLevelContainer(margin) {
    const levelContainer = document.createElement('div');
    levelContainer.style.display = 'flex';
    levelContainer.style.flexDirection = 'column';
    levelContainer.style.alignItems = 'center';
    levelContainer.style.marginBottom = `${margin * 2}px`; // Add some space below each level
    levelContainer.style.marginRight = "20px";
    levelContainer.className = "levelcontainer";
    return levelContainer;
}

// Function to create a vertical line
function createVerticalLine(height) {
    const verticalLine = document.createElement('div');
    verticalLine.style.width = '-webkit-fill-available'; // Full available width
    verticalLine.style.height = `${height}px`;
    verticalLine.style.backgroundColor = 'black';
    return verticalLine;
}

// Function to generate boxes based on hierarchy
function generateBoxes(hierarchy, container, scaleFactor = 1) {
    for (let key in hierarchy) {
        const width = 150 * scaleFactor;
        const height = 100 * scaleFactor;
        const margin = 10 * scaleFactor;

        const box = createBoxElement(key, width, height, margin);
        const levelContainer = createLevelContainer(margin);

        const connectorBox = createConnectorBox(30 * scaleFactor);
        let div_for_connectorBoxAnd_DeleteButton = document.createElement("div")
        div_for_connectorBoxAnd_DeleteButton.appendChild(connectorBox)
        let deletebutten = DeleteButtonSection()
        div_for_connectorBoxAnd_DeleteButton.appendChild(deletebutten)
        levelContainer.appendChild(div_for_connectorBoxAnd_DeleteButton);

        levelContainer.appendChild(box);

        // Check if this node is a leaf (i.e., has no children)
        const isLeaf = Object.keys(hierarchy[key]).length === 0;

        if (isLeaf) {
            const button = createButtonForGeneratingNewLowerConcept();
            levelContainer.appendChild(button);
        }

        if (!isLeaf) {
            const connectorBox = createConnectorBox(30 * scaleFactor);
            levelContainer.appendChild(connectorBox)
            const childContainer = document.createElement('div');
            childContainer.style.display = 'flex';
            childContainer.style.justifyContent = 'center';
            childContainer.style.width = '100%';

            const verticalLine = createVerticalLine(30 * scaleFactor);
            levelContainer.appendChild(verticalLine);

            generateBoxes(hierarchy[key], childContainer, scaleFactor);

            levelContainer.appendChild(childContainer);
        }

        container.appendChild(levelContainer);
    }
}



// Function to create the outer container
function createOuterContainer() {
    const outerContainer = document.createElement('div');
    outerContainer.style.position = 'absolute';
    outerContainer.style.width = '20000px'; // Set a large enough fixed width to accommodate the content
    outerContainer.style.height = '20000px'; // Set a large enough fixed height to accommodate the content
    outerContainer.style.overflow = 'auto'; // Allow scrolling in both directions
    outerContainer.style.display = 'flex';
    outerContainer.style.justifyContent = 'center';
    outerContainer.style.alignItems = 'center';
    return outerContainer;
}

// Function to create the inner container
function createInnerContainer() {
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.backgroundColor = '#f0f0f0'; // Light background for better visibility
    container.style.padding = '50px'; // Some padding around the edges
    container.style.boxSizing = 'border-box';
    container.className = "Innercontainer"
    let context_window = document.createElement("textarea")
    // Set minimum and maximum width and height
    let scaleFactor = 4
    context_window.style.width = `${50 * scaleFactor}px`;
    context_window.style.height = `${50 * scaleFactor}px`;
    context_window.style.minWidth = `${50 * scaleFactor}px`;
    context_window.style.minHeight = `${50 * scaleFactor}px`;
    context_window.style.maxWidth = `${50 * scaleFactor}px`;
    context_window.style.maxHeight = `${50 * scaleFactor}px`;

    // Add the class name
    context_window.className = 'contextwindue';
    container.appendChild(context_window)
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
    let input = document.createElement("input")
    input.value = "Context boks"

    let button = document.createElement("div")
    button.textContent = "Generate New LEVEL!"
    button.style.border = '1px solid black';
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
