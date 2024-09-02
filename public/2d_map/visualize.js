function generateBoxes(hierarchy, container, scaleFactor = 1) {
    for (let key in hierarchy) {
        const box = document.createElement('div');

        // Apply scaling factor to width, height, and margin
        const width = 150 * scaleFactor;
        const height = 100 * scaleFactor;
        const margin = 10 * scaleFactor;

        // Styling the box
        box.style.border = '1px solid black';
        box.style.padding = '10px';
        box.style.width = `${width}px`;
        box.style.height = `${height}px`;
        //box.style.marginTop = `${margin*1.5}px`;

        box.style.boxSizing = 'border-box';
        box.style.textAlign = 'center';
        box.style.display = 'flex'; // Skift fra inline-block til flex
        box.style.justifyContent = 'center'; // Centrerer indhold vandret
        box.style.alignItems = 'center'; // Centrerer indhold lodret
        box.textContent = key;
        box.className = "TextBoks";
        

        // Create a container for the current level
        const levelContainer = document.createElement('div');
        levelContainer.style.display = 'flex';
        levelContainer.style.flexDirection = 'column';
        levelContainer.style.alignItems = 'center';
        levelContainer.style.marginBottom = `${margin * 2}px`; // Add some space below each level
        levelContainer.style.marginRight = "20px"
        levelContainer.className = "levelcontainer"

        const connectorBox = document.createElement('div');
        connectorBox.style.width = '10px'; // Narrow width for the connector
        connectorBox.style.height = `${30 * scaleFactor}px`; // Thickness and length of the connector
        connectorBox.style.backgroundColor = 'black';
        levelContainer.appendChild(connectorBox);

        levelContainer.appendChild(box);

        // Add a black box as a connector between layers, but only if there are children
        if (Object.keys(hierarchy[key]).length > 0) {



            const connectorBox = document.createElement('div');
            connectorBox.style.width = '10px'; // Narrow width for the connector
            connectorBox.style.height = `${30 * scaleFactor}px`; // Thickness and length of the connector
            connectorBox.style.backgroundColor = 'black';
            levelContainer.appendChild(connectorBox);


            const verticalLine = document.createElement("div")
            verticalLine.style.width = '-webkit-fill-available'; // Narrow width for the connector
            verticalLine.style.height = `${30 * scaleFactor}px`; // Thickness and length of the connector
            verticalLine.style.backgroundColor = 'black';
            levelContainer.appendChild(verticalLine);

            const childContainer = document.createElement('div');
            childContainer.style.display = 'flex';  // Align children horizontally
            childContainer.style.justifyContent = 'center';  // Center children horizontally
            childContainer.style.width = '100%';

            generateBoxes(hierarchy[key], childContainer, scaleFactor);
            levelContainer.appendChild(childContainer);
        }

        container.appendChild(levelContainer);
    }
}

// Scroll to the center of the page
function scrollToCenterOfPage() {
    const xPos = (document.documentElement.scrollWidth - window.innerWidth) / 2;
    const yPos = (document.documentElement.scrollHeight - window.innerHeight) / 2;

    window.scrollTo(xPos, yPos);
}

// Example usage with your hierarchy and scaling factor
const scaleFactor = 1;  // Adjust this value to scale the size of all boxes

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

// Find or create a container to hold the entire structure
const outerContainer = document.createElement('div');
outerContainer.style.position = 'absolute';
outerContainer.style.width = '20000px'; // Set a large enough fixed width to accommodate the content
outerContainer.style.height = '20000px'; // Set a large enough fixed height to accommodate the content
outerContainer.style.overflow = 'auto';  // Allow scrolling in both directions
outerContainer.style.display = 'flex';
outerContainer.style.justifyContent = 'center';
outerContainer.style.alignItems = 'center';

// Create an inner container that can expand beyond the viewport
const container = document.createElement('div');
container.style.position = 'relative';
container.style.backgroundColor = '#f0f0f0'; // Light background for better visibility
container.style.padding = '50px';  // Some padding around the edges
container.style.boxSizing = 'border-box';

outerContainer.appendChild(container);
document.body.appendChild(outerContainer);

// Generate the boxes and display them in the container
generateBoxes(hierarchy, container, scaleFactor);

// Scroll to center after everything is fully loaded
window.onload = function () {
    setTimeout(() => {
        scrollToCenterOfPage();
    }, 100); // Delay the scroll to allow rendering to complete
};
