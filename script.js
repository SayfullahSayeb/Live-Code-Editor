const htmlEditor = document.getElementById("html-editor");
const cssEditor = document.getElementById("css-editor");
const jsEditor = document.getElementById("js-editor");
const iframe = document.getElementById("preview");
const themeSelector = document.getElementById("theme-selector");

const themes = {
  default: { color: "#4caf50", hover: "#388e3c" },
  purple: { color: "#a29bfe", hover: "#836fa9" },
  green: { color: "#55efc4", hover: "#39bba3" },
  yellow: { color: "#fdcb6e", hover: "#d7a153" },
  blue: { color: "#74b9ff", hover: "#539dc7" },
};

// Auto-save functionality
window.addEventListener("load", () => {
  htmlEditor.value = localStorage.getItem("html") || "";
  cssEditor.value = localStorage.getItem("css") || "";
  jsEditor.value = localStorage.getItem("js") || "";
  updatePreview(); // Load the preview on page load
});

// Update preview in iframe
function updatePreview() {
  const html = htmlEditor.value;
  const css = cssEditor.value;
  const js = jsEditor.value;

  const hasBackgroundColor = /background-color/.test(css);

  const content = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <style>
        body { background-color: ${hasBackgroundColor ? "inherit" : "#fff"}; }
        ${css}
      </style>
    </head>
    <body>
      ${html}
      <script>${js}<\/script>
    </body>
    </html>`;
  iframe.srcdoc = content;
}

// Copy code to clipboard
function copyCode(type) {
    const editor = type === "html" ? htmlEditor : type === "css" ? cssEditor : jsEditor;

    // Check if the code box is empty
    if (editor.value.trim() === "") {
        showCopyPopup("Error: The code box is empty! Please enter some code.", true);  // Pass 'true' for error
        return;
    }

    navigator.clipboard.writeText(editor.value).then(() => {
        showCopyPopup(`${type.toUpperCase()} code copied!`, false);  // Pass 'false' for success
    });
}

// Show the copy popup and apply the blur effect
function showCopyPopup(message, isError) {
    const copyPopup = document.getElementById("copy-popup"); // Get popup element
    const backdrop = document.getElementById("copy-popup-backdrop"); // Get the backdrop

    // Show the popup and backdrop
    copyPopup.textContent = message;
    copyPopup.style.display = "block";
    backdrop.style.display = "block";

    // Add error class if isError is true (red background)
    if (isError) {
        copyPopup.classList.add("error");
    } else {
        copyPopup.classList.remove("error");
    }

    // Fade in the popup with opacity transition
    setTimeout(() => {
        copyPopup.style.opacity = 1;
    }, 10); // Small delay to allow styles to apply

    setTimeout(() => {
        // Hide the popup and backdrop after 2 seconds
        copyPopup.style.opacity = 0; // Fade out
        setTimeout(() => {
            copyPopup.style.display = "none"; // Completely hide after fade
            backdrop.style.display = "none";
        }, 100); // Allow time for the fade out before hiding
    }, 2000); // Show for 2 seconds
}

// Download code as a zip file
function downloadCode() {
    // Check if all code boxes are empty
    if (!htmlEditor.value.trim() && !cssEditor.value.trim() && !jsEditor.value.trim()) {
      // Show an error if all boxes are empty
      showCopyPopup("Error: No code to download! Please add code to at least one editor.", true);
      return; // Prevent zip download if no code
    }
  
    const zip = new JSZip();
  
    // Add files to the zip if they have content
    if (htmlEditor.value.trim()) zip.file("index.html", htmlEditor.value.trim());
    if (cssEditor.value.trim()) zip.file("style.css", cssEditor.value.trim());
    if (jsEditor.value.trim()) zip.file("script.js", jsEditor.value.trim());
  
    // Generate and trigger download of the zip
    zip.generateAsync({ type: "blob" }).then(content => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = "code_preview.zip";
      a.click();
    });
  }
  

// Clear all fields and localStorage
function clearAll() {
  htmlEditor.value = "";
  cssEditor.value = "";
  jsEditor.value = "";
  localStorage.clear();
  updatePreview(); // Reset the preview after clearing
}

// Change theme
function changeTheme() {
  const theme = themes[themeSelector.value];
  document.documentElement.style.setProperty("--theme-color", theme.color);
  document.documentElement.style.setProperty("--theme-hover-color", theme.hover);
}

// Function for error handling when opening the preview
function openPreview() {
  const html = htmlEditor.value.trim();
  const css = cssEditor.value.trim();
  const js = jsEditor.value.trim();
  if (!html && !css && !js) {
    let errorPopup = document.getElementById('new-tab-error');
    if (!errorPopup) {
      errorPopup = document.createElement('div');
      errorPopup.id = 'new-tab-error';
      errorPopup.textContent = 'Error: Please fill out at least one editor (HTML, CSS, JavaScript) before previewing.';
      document.body.appendChild(errorPopup);
    }
    errorPopup.classList.add('show');

    let errorBackdrop = document.getElementById('new-tab-error-backdrop');
    if (!errorBackdrop) {
      errorBackdrop = document.createElement('div');
      errorBackdrop.id = 'new-tab-error-backdrop';
      document.body.appendChild(errorBackdrop);
    }
    errorBackdrop.classList.add('show');

    setTimeout(() => {
      errorPopup.classList.remove('show');
      errorBackdrop.classList.remove('show');
      setTimeout(() => {
        errorPopup.remove();
        errorBackdrop.remove();
      }, 300);
    }, 3000);

    return;
  }

  const content = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <style>
        body { background-color: #fff; }
        ${css}
      </style>
    </head>
    <body>
      ${html}
      <script>${js}<\/script>
    </body>
    </html>
  `;

  const newTab = window.open();
  newTab.document.write(content);
  newTab.document.close();
}



// Event listeners for auto-save and update preview
[htmlEditor, cssEditor, jsEditor].forEach((editor) => {
  editor.addEventListener("input", () => {
    updatePreview(); // Update preview whenever input changes
    localStorage.setItem("html", htmlEditor.value); // Auto-save to localStorage for HTML
    localStorage.setItem("css", cssEditor.value);  // Auto-save to localStorage for CSS
    localStorage.setItem("js", jsEditor.value);    // Auto-save to localStorage for JS
  });
});
