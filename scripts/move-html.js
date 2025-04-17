const fs = require('fs-extra');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const popupSrc = path.join(dist, 'src', 'popup', 'Popup.html');
const popupDest = path.join(dist, 'popup.html');
const overlaySrc = path.join(dist, 'src', 'content', 'ui', 'overlay.html');
const overlayDest = path.join(dist, 'overlay.html');

if (fs.existsSync(popupSrc)) {
  fs.moveSync(popupSrc, popupDest, { overwrite: true });
}
if (fs.existsSync(overlaySrc)) {
  fs.moveSync(overlaySrc, overlayDest, { overwrite: true });
}
