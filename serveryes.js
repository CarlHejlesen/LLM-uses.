const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
app.use(express.json());
let jsonData;
let pdfData;

// Middleware to serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS for all routes
app.use(cors());

// Read JSON data when the server starts
const jsonFilePath = path.join(__dirname, 'pdfData.json');
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the JSON file:', err);
        return;
    }
    jsonData = JSON.parse(data);
    console.log('JSON data loaded');
});

// Read PDF data when the server starts
const pdfFilePath = path.join(__dirname, 'random.pdf');
fs.readFile(pdfFilePath, (err, data) => {
    if (err) {
        console.error('Error reading the PDF file:', err);
        return;
    }
    pdfData = data;
    console.log('PDF data loaded');
});

// Endpoint to get the JSON data
app.get('/data', (req, res) => {
    if (jsonData) {
        res.json(jsonData);
    } else {
        res.status(500).send('Error: JSON data not loaded');
    }
});

// Endpoint to get the PDF data
app.get('/pdf', (req, res) => {
    if (pdfData) {
        res.contentType("application/pdf");
        res.send(pdfData);
    } else {
        res.status(500).send('Error: PDF data not loaded');
    }
});

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

let globalHierarchy = {
    hierarchy: hierarchy  // Assign the existing hierarchy object to globalHierarchy
};

// Function to write the globalHierarchy to a file
function writeHierarchyToFile() {
    fs.writeFile('globalHierarchy.json', JSON.stringify(globalHierarchy, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
            console.log('globalHierarchy updated successfully');
        }
    });
}

// POST endpoint to insert data into the globalHierarchy
app.post("/PostObject", (req, res) => {
    const { parentKey, newKey } = req.body;

    console.log(parentKey)
    console.log(newKey)
    console.log(globalHierarchy.hierarchy)  // This will now print the correct hierarchy

    let parentNode = findNodeInHierarchy(globalHierarchy.hierarchy, parentKey);

    if (parentNode) {
        if (!parentNode[newKey]) {
            parentNode[newKey] = {}; // Create an empty object for the new child node
            writeHierarchyToFile(); // Write changes to the file
            res.status(200).json({ message: `'${newKey}' inserted under '${parentKey}'` });
        } else {
            res.status(400).json({ message: `'${newKey}' already exists under '${parentKey}'` });
        }
    } else {
        res.status(404).json({ message: `Parent '${parentKey}' not found` });
    }
});


// POST endpoint to delete data from the globalHierarchy
app.post("/DeleteObject", (req, res) => {
    const { parentKey, keyToRemove } = req.body;

    let parentNode = findNodeInHierarchy(globalHierarchy.hierarchy, parentKey);
    if (parentNode && parentNode[keyToRemove]) {
        delete parentNode[keyToRemove]; // Remove the node
        writeHierarchyToFile(); // Write changes to the file
        res.status(200).json({ message: `'${keyToRemove}' removed from '${parentKey}'` });
    } else {
        res.status(404).json({ message: `'${keyToRemove}' not found under '${parentKey}'` });
    }
});

// POST endpoint to change data in the globalHierarchy
app.post("/ChangeObject", (req, res) => {
    const { parentKey, oldKey, newKey } = req.body;

    console.log(parentKey)
    console.log(oldKey)
    console.log(newKey)
    let parentNode = findNodeInHierarchy(globalHierarchy.hierarchy, parentKey);
    if (parentNode && parentNode[oldKey]) {
        parentNode[newKey] = parentNode[oldKey]; // Copy the old data to the new key
        delete parentNode[oldKey]; // Remove the old key
        writeHierarchyToFile(); // Write changes to the file
        res.status(200).json({ message: `'${oldKey}' changed to '${newKey}' under '${parentKey}'` });
    } else {
        res.status(404).json({ message: `'${oldKey}' not found under '${parentKey}'` });
    }
});

// Helper function to find a node in the hierarchy
function findNodeInHierarchy(hierarchy, key) {
    if (hierarchy[key]) return hierarchy[key]; // Return the node if found

    for (let childKey in hierarchy) {
        let foundNode = findNodeInHierarchy(hierarchy[childKey], key);
        if (foundNode) return foundNode;
    }

    return null; // Return null if the node is not found
}



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
