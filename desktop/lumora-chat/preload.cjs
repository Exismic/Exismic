const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("lumoraDesktop", Object.freeze({
  isDesktop: true,
  platform: process.platform,
  versions: Object.freeze({
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  }),
  retry: () => ipcRenderer.invoke("desktop:retry"),
  notify: (title, body) => ipcRenderer.invoke("desktop:show-notification", { title, body }),
}));
