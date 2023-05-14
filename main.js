//Imported Modules
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv").config();

//Main Window
const isDev = true;

const createWindow = () => {
  const win = new BrowserWindow({
    width: isDev ? 1200 : 600,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    win.webContents.openDevTools();
  }

  win.loadFile(path.join(__dirname, "./renderer/index.html"));
};

app.whenReady().then(() => {
  //Initialize Functions
  ipcMain.handle("axios.openAI", openAI);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

//Main Functions
async function openAI(event, sentence) {
  let res = null;

  const env = dotenv.parsed;

  await axios({
    url: "https://api.openai.com/v1/completions",
    method: "post",
    data: {
      model: "text-davinci-003",
      prompt: `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\nHuman: Hello, who are you?\nAI: I am an AI created by OpenAI. How can I help you today?\n\nHuman: ${sentence}\nAI:`,
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.6,
      stop: [" Human:", " AI:"],
    },
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + env.APIKEY_OPENAI,
    },
  })
    .then(function (response) {
      res = response.data;
    })
    .catch(function (error) {
      res = error;
    });

  return res;
}
