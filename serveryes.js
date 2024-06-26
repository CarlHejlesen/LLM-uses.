const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
