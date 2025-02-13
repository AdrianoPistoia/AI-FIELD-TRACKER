const { app, BrowserWindow } = require('electron');
const express = require('express');
const XLSX = require('xlsx');
const OpenAI = require("openai");
const cors = require('cors'); // Import the cors package
const app = express();
const path = require('path'); // Import path
const serverApp = express(); // Create a separate Express app for the server
const port = 8888; // Choose a port (make sure it's not conflicting)
const openai = new OpenAI({
    apiKey: "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",
});


serverApp.use(cors());

serverApp.get('/excel-data', (req, res) => {
    try {
        const workbook = XLSX.readFile(__dirname + '/Diccionario_de_datos.xlsx');
        const sheetName = workbook.SheetNames[0]; // Get the first sheet name
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = [];
        let row = 2;

        while (worksheet[`E${row}`] && worksheet[`F${row}`]) {
            const eValue = worksheet[`E${row}`].v;
            const fValue = worksheet[`F${row}`].v;
            jsonData.push({ e: eValue, f: fValue });
            row++;
        }

        res.json(jsonData);
    } catch (error) {
        console.error("Error processing Excel file:", error);
        res.status(500).send('Error processing Excel file');
    }
});


serverApp.post('/ask-openai', express.json(), async (req, res) => {  // New route for OpenAI
    const prompt = req.body.prompt; // Get the prompt from the client

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 100,
            messages: [{ "role": "user", "content": prompt }],
        });
        res.json({ answer: completion.choices[0].message.content }); // Send back only the answer
    } catch (error) {
        console.error("OpenAI API Error:", error);
        res.status(500).json({ error: "OpenAI API Error" }); // Send error as JSON
    }
});

const server = serverApp.listen(port, () => {  // Store the server object
    console.log(`Electron server listening on port ${port}`);
});

function createWindow() {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // If you have preload.js
            nodeIntegration: false, // Important for security
            contextIsolation: true, // Important for security
        }
    });

    mainWindow.loadFile('index.html'); // Your HTML file

    // Optional: Open DevTools - Remove for PRODUCTION!
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Quit the server when the Electron app quits
app.on('before-quit', () => {
    server.close(() => { // Close the server gracefully
        console.log('Electron server closed.');
    });
});

// preload.js (If you are using it)
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    doSomething: () => {}
})