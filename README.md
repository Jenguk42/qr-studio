# QR Studio

A lightweight, privacy-first QR code generator built as a front-end portfolio project.

## Features
- Generate QR codes from URLs or plain text
- Real-time browser preview
- PNG export at multiple resolutions
- Custom foreground and background colours
- Adjustable quiet zone / margin
- Error correction controls
- Responsive desktop and mobile layout
- No server-side processing

## Privacy
QR Studio runs entirely in the browser. The content entered into the generator is not uploaded, stored or transmitted by the app.

## Tech stack
- HTML5
- CSS3
- Vanilla JavaScript
- `qrcode` via jsDelivr CDN
- GitHub Pages compatible

## Deploy with GitHub Pages
1. Create a repository such as `qr-studio`.
2. Upload the project files to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose `main` and `/ (root)`.
6. Save.

Your site will be published at a URL similar to:

`https://your-username.github.io/qr-studio/`

## Portfolio description
**QR Studio — Client-side QR Code Generator**

A responsive front-end web application for generating and exporting custom QR codes directly in the browser. Designed with a privacy-first approach, all content is processed locally without server-side storage or transmission.

## Future improvements
- SVG export
- Logo embedding
- Wi-Fi, email, SMS and phone presets
- Dark mode
- Saved themes
- PWA/offline support
- Automated tests
- TypeScript migration

## License
MIT
