# Lumora Chat Desktop

Lumora Chat Desktop is an isolated Electron client for the existing Lumora AI Chat experience. It does not add dependencies to, alter routes in, or change the build configuration of the Lumora website.

## Architecture

- The desktop shell loads only the configured Lumora `/chat` URL.
- Authentication cookies live in Electron's dedicated `persist:lumora-chat` partition.
- Conversations, memories, modes, credits, and settings continue to use the existing Lumora backend.
- Node.js is unavailable to website content. Context isolation, renderer sandboxing, origin validation, and permission filtering remain enabled.

## Local development

Start the Lumora website from the repository root:

```powershell
npm run dev
```

In a second terminal:

```powershell
cd desktop\lumora-chat
npm install
npm run dev
```

The development build opens `http://localhost:3000/chat`.

## Production preview

```powershell
npm run preview:production
```

To test another deployment:

```powershell
$env:LUMORA_WEB_URL = "https://your-domain.example/chat"
npm run dev
```

## Windows installer

```powershell
npm run verify
npm run dist:windows
```

Installers are generated in `dist`. The build creates both an NSIS installer and a portable executable.

## Desktop behavior

- `Ctrl+Shift+L` shows or hides Lumora Chat globally.
- Closing the window keeps Lumora available from the system tray.
- Only Lumora and trusted authentication origins can navigate inside the app.
- Untrusted links open in the default browser.
- Camera/microphone and notifications are allowed only for the configured Lumora origin.
- Window size and login state persist between launches.
