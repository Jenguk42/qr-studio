const qrText = document.getElementById('qrText');
const sizeSelect = document.getElementById('sizeSelect');
const errorSelect = document.getElementById('errorSelect');
const darkColor = document.getElementById('darkColor');
const lightColor = document.getElementById('lightColor');
const darkHex = document.getElementById('darkHex');
const lightHex = document.getElementById('lightHex');
const marginRange = document.getElementById('marginRange');
const marginValue = document.getElementById('marginValue');
const qrCode = document.getElementById('qrCode');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const resetBtn = document.getElementById('resetBtn');
const charCount = document.getElementById('charCount');
const statusPill = document.getElementById('statusPill');

const defaults = {
  text: 'https://www.eventbrite.com',
  size: '768',
  errorCorrectionLevel: 'M',
  dark: '#111111',
  light: '#ffffff',
  margin: 4
};

let renderTimer;
let libraryCheckTimer;

function isValidHex(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function setStatus(message, isError = false) {
  statusPill.textContent = message;
  statusPill.style.background = isError ? '#f8e8e8' : '#f0ece5';
  statusPill.style.color = isError ? '#8c2f2f' : '#635e56';
}

function getCorrectionLevel() {
  if (!window.QRCode || !QRCode.CorrectLevel) return null;
  return QRCode.CorrectLevel[errorSelect.value] ?? QRCode.CorrectLevel.M;
}

function getQuietZonePixels(size) {
  // QRCode.js does not expose a margin option, so we add the quiet zone
  // around the generated code. Four modules is the common default.
  return Math.round((size / 41) * Number(marginRange.value));
}

function renderLibraryError() {
  qrCode.innerHTML = `
    <div class="qr-error">
      <strong>QR library could not load.</strong>
      <span>Check your internet connection and refresh the page.</span>
    </div>`;
  setStatus('Library unavailable', true);
}

function renderQR() {
  const value = qrText.value.trim();
  charCount.textContent = `${qrText.value.length} character${qrText.value.length === 1 ? '' : 's'}`;
  marginValue.textContent = marginRange.value;

  if (!value) {
    qrCode.innerHTML = '';
    setStatus('Enter content', true);
    return;
  }

  if (!window.QRCode || !QRCode.CorrectLevel) {
    renderLibraryError();
    return;
  }

  qrCode.innerHTML = '';
  setStatus('Generating…');

  const size = Number(sizeSelect.value);

  try {
    new QRCode(qrCode, {
      text: value,
      width: size,
      height: size,
      colorDark: darkColor.value,
      colorLight: lightColor.value,
      correctLevel: getCorrectionLevel()
    });

    const output = qrCode.querySelector('canvas, img');
    if (output) {
      output.style.width = '100%';
      output.style.height = 'auto';
      output.style.display = 'block';
    }

    const previewPadding = Math.min(26, 6 + Number(marginRange.value) * 2);
    qrCode.style.padding = `${previewPadding}px`;
    qrCode.style.background = lightColor.value;
    setStatus('Ready');
  } catch (error) {
    console.error(error);
    qrCode.innerHTML = '';
    setStatus('Could not generate', true);
  }
}

function queueRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(renderQR, 100);
}

function syncColor(colorInput, hexInput) {
  colorInput.addEventListener('input', () => {
    hexInput.value = colorInput.value.toUpperCase();
    queueRender();
  });

  hexInput.addEventListener('input', () => {
    if (isValidHex(hexInput.value)) {
      colorInput.value = hexInput.value;
      queueRender();
    }
  });

  hexInput.addEventListener('blur', () => {
    if (!isValidHex(hexInput.value)) {
      hexInput.value = colorInput.value.toUpperCase();
    }
  });
}

function getSourceCanvas() {
  const canvas = qrCode.querySelector('canvas');
  if (canvas) return canvas;

  const img = qrCode.querySelector('img');
  if (!img || !img.complete) return null;

  const temp = document.createElement('canvas');
  temp.width = img.naturalWidth || Number(sizeSelect.value);
  temp.height = img.naturalHeight || Number(sizeSelect.value);
  temp.getContext('2d').drawImage(img, 0, 0, temp.width, temp.height);
  return temp;
}

function downloadQR() {
  const source = getSourceCanvas();
  if (!source) {
    setStatus('Generate a QR first', true);
    return;
  }

  const margin = getQuietZonePixels(source.width);
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = source.width + margin * 2;
  exportCanvas.height = source.height + margin * 2;

  const ctx = exportCanvas.getContext('2d');
  ctx.fillStyle = lightColor.value;
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  ctx.drawImage(source, margin, margin);

  const link = document.createElement('a');
  link.download = 'qr-code.png';
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}

async function copyText() {
  const value = qrText.value;
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    copyBtn.textContent = 'Copied';
  } catch {
    const helper = document.createElement('textarea');
    helper.value = value;
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
    copyBtn.textContent = 'Copied';
  }

  setTimeout(() => {
    copyBtn.textContent = 'Copy text';
  }, 1300);
}

function resetForm() {
  qrText.value = defaults.text;
  sizeSelect.value = defaults.size;
  errorSelect.value = defaults.errorCorrectionLevel;
  darkColor.value = defaults.dark;
  lightColor.value = defaults.light;
  darkHex.value = defaults.dark.toUpperCase();
  lightHex.value = defaults.light.toUpperCase();
  marginRange.value = defaults.margin;
  renderQR();
}

[qrText, sizeSelect, errorSelect, marginRange].forEach((element) => {
  element.addEventListener('input', queueRender);
});

syncColor(darkColor, darkHex);
syncColor(lightColor, lightHex);

downloadBtn.addEventListener('click', downloadQR);
copyBtn.addEventListener('click', copyText);
resetBtn.addEventListener('click', resetForm);

// Give the external library a moment to finish loading, then render.
function initialise() {
  let attempts = 0;
  libraryCheckTimer = setInterval(() => {
    attempts += 1;
    if (window.QRCode && QRCode.CorrectLevel) {
      clearInterval(libraryCheckTimer);
      renderQR();
    } else if (attempts >= 20) {
      clearInterval(libraryCheckTimer);
      renderLibraryError();
    }
  }, 100);
}

initialise();
