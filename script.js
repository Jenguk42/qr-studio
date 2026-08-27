const qrText = document.getElementById("qrText");

const sizeSelect = document.getElementById("sizeSelect");
const errorSelect = document.getElementById("errorSelect");

const darkColor = document.getElementById("darkColor");
const lightColor = document.getElementById("lightColor");

const darkHex = document.getElementById("darkHex");
const lightHex = document.getElementById("lightHex");

const qrCode = document.getElementById("qrCode");

const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");
const resetBtn = document.getElementById("resetBtn");

const charCount = document.getElementById("charCount");
const statusPill = document.getElementById("statusPill");


const defaults = {
  text: "https://www.eventbrite.com",
  size: "768",
  errorCorrectionLevel: "M",
  dark: "#111111",
  light: "#ffffff"
};


let renderTimer;


/* --------------------------------------------------
   Helpers
-------------------------------------------------- */

function isValidHex(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}


function setStatus(message, isError = false) {

  statusPill.textContent = message;

  statusPill.classList.toggle(
    "status-error",
    isError
  );

}


function getCorrectionLevel() {

  if (typeof QRCode === "undefined") {
    return null;
  }

  switch (errorSelect.value) {

    case "L":
      return QRCode.CorrectLevel.L;

    case "Q":
      return QRCode.CorrectLevel.Q;

    case "H":
      return QRCode.CorrectLevel.H;

    case "M":
    default:
      return QRCode.CorrectLevel.M;

  }

}


/* --------------------------------------------------
   Character counter
-------------------------------------------------- */

function updateCharacterCount() {

  const count =
    qrText.value.length;

  charCount.textContent =
    `${count} character${count === 1 ? "" : "s"}`;

}


/* --------------------------------------------------
   QR Preview
-------------------------------------------------- */

function renderQR() {

  updateCharacterCount();

  const value =
    qrText.value.trim();


  qrCode.innerHTML = "";


  if (!value) {

    setStatus(
      "Enter content",
      true
    );

    return;
  }


  if (typeof QRCode === "undefined") {

    setStatus(
      "Library failed to load",
      true
    );

    return;
  }


  try {

    setStatus("Generating...");


    /*
      Preview size is deliberately fixed.

      Export resolution is handled separately
      when the PNG is downloaded.
    */

    new QRCode(qrCode, {

      text: value,

      width: 300,
      height: 300,

      colorDark:
        darkColor.value,

      colorLight:
        lightColor.value,

      correctLevel:
        getCorrectionLevel()

    });


    setStatus("Ready");


  } catch (error) {

    console.error(
      "QR generation failed:",
      error
    );


    qrCode.innerHTML = "";


    setStatus(
      "Could not generate",
      true
    );

  }

}


/* --------------------------------------------------
   Debounced rendering
-------------------------------------------------- */

function queueRender() {

  clearTimeout(renderTimer);


  renderTimer =
    setTimeout(() => {

      renderQR();

    }, 100);

}


/* --------------------------------------------------
   Colour controls
-------------------------------------------------- */

function syncColor(
  colorInput,
  hexInput
) {

  colorInput.addEventListener(
    "input",
    () => {

      hexInput.value =
        colorInput.value.toUpperCase();

      queueRender();

    }
  );


  hexInput.addEventListener(
    "input",
    () => {

      const value =
        hexInput.value.trim();


      if (isValidHex(value)) {

        colorInput.value =
          value;

        queueRender();

      }

    }
  );


  hexInput.addEventListener(
    "blur",
    () => {

      const value =
        hexInput.value.trim();


      if (!isValidHex(value)) {

        hexInput.value =
          colorInput.value.toUpperCase();

      } else {

        hexInput.value =
          value.toUpperCase();

      }

    }
  );

}


/* --------------------------------------------------
   High-resolution PNG export
-------------------------------------------------- */

function downloadQR() {

  const value =
    qrText.value.trim();


  if (!value) {

    setStatus(
      "Enter content",
      true
    );

    return;
  }


  if (typeof QRCode === "undefined") {

    setStatus(
      "Library failed to load",
      true
    );

    return;
  }


  const exportSize =
    Number(sizeSelect.value);


  const tempContainer =
    document.createElement("div");


  tempContainer.className =
    "export-container";


  document.body.appendChild(
    tempContainer
  );


  try {

    new QRCode(tempContainer, {

      text: value,

      width:
        exportSize,

      height:
        exportSize,

      colorDark:
        darkColor.value,

      colorLight:
        lightColor.value,

      correctLevel:
        getCorrectionLevel()

    });


    /*
      qrcodejs creates both a canvas
      and an image in some browsers.

      Canvas is preferred because it
      gives us a clean PNG export.
    */

    requestAnimationFrame(() => {

      const canvas =
        tempContainer.querySelector(
          "canvas"
        );


      const image =
        tempContainer.querySelector(
          "img"
        );


      let dataUrl = null;


      if (
        canvas &&
        canvas.width > 0 &&
        canvas.height > 0
      ) {

        dataUrl =
          canvas.toDataURL(
            "image/png"
          );

      } else if (
        image &&
        image.src
      ) {

        dataUrl =
          image.src;

      }


      if (!dataUrl) {

        tempContainer.remove();

        setStatus(
          "Export failed",
          true
        );

        return;
      }


      const link =
        document.createElement("a");


      link.href =
        dataUrl;


      link.download =
        `qr-code-${exportSize}x${exportSize}.png`;


      document.body.appendChild(
        link
      );


      link.click();


      link.remove();

      tempContainer.remove();


      setStatus("Ready");

    });


  } catch (error) {

    console.error(
      "QR export failed:",
      error
    );


    tempContainer.remove();


    setStatus(
      "Export failed",
      true
    );

  }

}


/* --------------------------------------------------
   Copy text
-------------------------------------------------- */

async function copyText() {

  const value =
    qrText.value;


  if (!value.trim()) {
    return;
  }


  try {

    await navigator.clipboard.writeText(
      value
    );


    copyBtn.textContent =
      "Copied";


    setTimeout(() => {

      copyBtn.textContent =
        "Copy text";

    }, 1300);


  } catch (error) {

    console.error(
      "Copy failed:",
      error
    );


    copyBtn.textContent =
      "Copy failed";


    setTimeout(() => {

      copyBtn.textContent =
        "Copy text";

    }, 1300);

  }

}


/* --------------------------------------------------
   Reset
-------------------------------------------------- */

function resetForm() {

  qrText.value =
    defaults.text;


  sizeSelect.value =
    defaults.size;


  errorSelect.value =
    defaults.errorCorrectionLevel;


  darkColor.value =
    defaults.dark;


  lightColor.value =
    defaults.light;


  darkHex.value =
    defaults.dark.toUpperCase();


  lightHex.value =
    defaults.light.toUpperCase();


  renderQR();

}


/* --------------------------------------------------
   Event listeners
-------------------------------------------------- */

qrText.addEventListener(
  "input",
  queueRender
);


errorSelect.addEventListener(
  "change",
  queueRender
);


/*
  Export size does not affect
  the preview.

  It only controls the downloaded
  PNG resolution.
*/


syncColor(
  darkColor,
  darkHex
);


syncColor(
  lightColor,
  lightHex
);


downloadBtn.addEventListener(
  "click",
  downloadQR
);


copyBtn.addEventListener(
  "click",
  copyText
);


resetBtn.addEventListener(
  "click",
  resetForm
);


/* --------------------------------------------------
   Initial render
-------------------------------------------------- */

renderQR();