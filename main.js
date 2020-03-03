const { app, BrowserWindow, Menu } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  var menu = Menu.buildFromTemplate([
    {
      label: "Debug",
      submenu: [
        {
          label: "Toggle Dev Tools",
          accelerator: "F12",
          click: () => {
            win.webContents.toggleDevTools();
          }
        }
      ]
    }
  ])
  win.loadFile('index.html')

  win.setMenu(menu)
  // Open the DevTools.
  //win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})