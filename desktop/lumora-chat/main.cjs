const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  globalShortcut,
  ipcMain,
  nativeImage,
  Notification,
  session,
  shell,
} = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const APP_NAME = "Lumora Chat";
const LOCAL_CHAT_URL = "http://localhost:3000/chat";
const PRODUCTION_CHAT_URL = "https://lumoraai.online/chat";
const TRUSTED_AUTH_HOSTS = new Set([
  "accounts.google.com",
  "github.com",
  "discord.com",
  "mgirjaamphcgnispdofo.supabase.co",
]);

let mainWindow = null;
let tray = null;
let quitting = false;
let activeChatUrl = null;

function resolveChatUrl() {
  const candidate = process.env.LUMORA_WEB_URL
    || (app.isPackaged ? PRODUCTION_CHAT_URL : LOCAL_CHAT_URL);

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("LUMORA_WEB_URL must be a valid URL.");
  }

  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  if (parsed.protocol !== "https:" && !isLocal) {
    throw new Error("Packaged Lumora Chat builds only load secure HTTPS origins.");
  }

  parsed.hash = "";
  return parsed;
}

function getStateFile() {
  return path.join(app.getPath("userData"), "window-state.json");
}

function readWindowState() {
  const fallback = { width: 1440, height: 920 };
  try {
    const parsed = JSON.parse(fs.readFileSync(getStateFile(), "utf8"));
    if (
      Number.isFinite(parsed.width)
      && Number.isFinite(parsed.height)
      && parsed.width >= 900
      && parsed.height >= 640
    ) {
      return parsed;
    }
  } catch {
    // First launch or an invalid state file uses comfortable defaults.
  }
  return fallback;
}

function saveWindowState() {
  if (!mainWindow || mainWindow.isDestroyed() || mainWindow.isMaximized()) return;
  try {
    fs.writeFileSync(getStateFile(), JSON.stringify(mainWindow.getBounds()));
  } catch (error) {
    console.warn("[Lumora Desktop] Could not save window bounds:", error.message);
  }
}

function iconPath() {
  return path.join(__dirname, "assets", "icon.png");
}

function isTrustedNavigation(target) {
  try {
    const targetUrl = new URL(target);
    return targetUrl.origin === activeChatUrl.origin || TRUSTED_AUTH_HOSTS.has(targetUrl.hostname);
  } catch {
    return false;
  }
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
    return;
  }

  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function toggleMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
  } else if (mainWindow.isVisible() && mainWindow.isFocused()) {
    mainWindow.hide();
  } else {
    showMainWindow();
  }
}

function loadChat() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.loadURL(activeChatUrl.toString());
}

function loadOfflinePage() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.loadFile(path.join(__dirname, "offline.html"), {
    query: { target: activeChatUrl.origin },
  });
}

function createMainWindow() {
  const bounds = readWindowState();
  mainWindow = new BrowserWindow({
    ...bounds,
    minWidth: 900,
    minHeight: 640,
    show: false,
    backgroundColor: "#05050a",
    title: APP_NAME,
    icon: iconPath(),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      partition: "persist:lumora-chat",
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      spellcheck: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isTrustedNavigation(url)) {
      mainWindow.loadURL(url);
    } else if (/^https?:/i.test(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isTrustedNavigation(url)) {
      event.preventDefault();
      if (/^https?:/i.test(url)) shell.openExternal(url);
    }
  });

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (!isMainFrame || errorCode === -3) return;
    console.warn(`[Lumora Desktop] Failed to load ${validatedURL}: ${errorDescription}`);
    loadOfflinePage();
  });

  mainWindow.webContents.on("did-finish-load", () => {
    const current = mainWindow.webContents.getURL();
    if (current.startsWith(activeChatUrl.origin)) {
      mainWindow.webContents.executeJavaScript(
        "document.documentElement.dataset.lumoraDesktop = 'true';",
        true,
      ).catch(() => {});
    }
  });

  mainWindow.webContents.session.on("will-download", (_event, item) => {
    item.once("done", (_doneEvent, state) => {
      if (state === "completed" && Notification.isSupported()) {
        new Notification({
          title: "Download complete",
          body: item.getFilename(),
          icon: iconPath(),
        }).show();
      }
    });
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on("resize", saveWindowState);
  mainWindow.on("move", saveWindowState);
  mainWindow.on("close", (event) => {
    if (!quitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  loadChat();
}

function createTray() {
  const image = nativeImage.createFromPath(iconPath()).resize({ width: 20, height: 20 });
  tray = new Tray(image);
  tray.setToolTip(APP_NAME);
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: "Open Lumora Chat",
      click: showMainWindow,
    },
    {
      label: "New chat",
      click: () => {
        showMainWindow();
        mainWindow.loadURL(new URL("/chat", activeChatUrl.origin).toString());
      },
    },
    { type: "separator" },
    {
      label: "Reload",
      click: loadChat,
    },
    {
      label: "Quit",
      click: () => {
        quitting = true;
        app.quit();
      },
    },
  ]));
  tray.on("click", toggleMainWindow);
}

function createApplicationMenu() {
  const template = [
    {
      label: "Lumora",
      submenu: [
        { label: "New Chat", accelerator: "CmdOrCtrl+N", click: loadChat },
        { label: "Reload", accelerator: "CmdOrCtrl+R", click: loadChat },
        { type: "separator" },
        {
          label: "Quit Lumora Chat",
          accelerator: "Alt+F4",
          click: () => {
            quitting = true;
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "zoomIn" },
        { role: "zoomOut" },
        { role: "resetZoom" },
        { type: "separator" },
        { role: "togglefullscreen" },
        ...(app.isPackaged ? [] : [{ role: "toggleDevTools" }]),
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function configurePermissions() {
  const appSession = session.fromPartition("persist:lumora-chat");
  appSession.setPermissionCheckHandler((_webContents, permission, requestingOrigin) => {
    const trusted = requestingOrigin.startsWith(activeChatUrl.origin);
    return trusted && ["media", "notifications", "clipboard-sanitized-write"].includes(permission);
  });
  appSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const trusted = webContents.getURL().startsWith(activeChatUrl.origin);
    callback(trusted && ["media", "notifications", "clipboard-sanitized-write"].includes(permission));
  });
}

ipcMain.handle("desktop:retry", () => {
  loadChat();
});

ipcMain.handle("desktop:show-notification", (_event, payload) => {
  if (!Notification.isSupported()) return false;
  const title = typeof payload?.title === "string" ? payload.title.slice(0, 80) : APP_NAME;
  const body = typeof payload?.body === "string" ? payload.body.slice(0, 240) : "";
  new Notification({ title, body, icon: iconPath() }).show();
  return true;
});

app.setName(APP_NAME);

const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", showMainWindow);

  app.whenReady().then(() => {
    activeChatUrl = resolveChatUrl();
    configurePermissions();
    createApplicationMenu();
    createMainWindow();
    createTray();

    globalShortcut.register("CommandOrControl+Shift+L", toggleMainWindow);
  });
}

app.on("activate", showMainWindow);
app.on("before-quit", () => {
  quitting = true;
  saveWindowState();
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
app.on("window-all-closed", () => {
  // Keep the tray process available on Windows and macOS.
});
