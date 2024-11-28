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
  updatePreview();
});

// Update preview
function updatePreview() {
  const html = htmlEditor.value;
  const css = cssEditor.value;
  const js = jsEditor.value;

  const background = css.includes("background-color")
    ? ""
    : "body { background-color: #121212; }";

  const content = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <style>${background} ${css}</style>
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
  navigator.clipboard.writeText(editor.value).then(() => {
    alert(`${type.toUpperCase()} code copied to clipboard!`);
  });
}

// Download code
function downloadCode() {
  const zip = new JSZip();
  if (htmlEditor.value.trim()) zip.file("index.html", htmlEditor.value.trim());
  if (cssEditor.value.trim()) zip.file("style.css", cssEditor.value.trim());
  if (jsEditor.value.trim()) zip.file("script.js", jsEditor.value.trim());

  zip.generateAsync({ type: "blob" }).then((content) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "code_preview.zip";
    a.click();
  });
}

// Clear all fields
function clearAll() {
  htmlEditor.value = "";
  cssEditor.value = "";
  jsEditor.value = "";
  localStorage.clear();
  updatePreview();
}

// Change theme
function changeTheme() {
  const theme = themes[themeSelector.value];
  document.documentElement.style.setProperty("--theme-color", theme.color);
  document.documentElement.style.setProperty("--theme-hover-color", theme.hover);
}

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
  

// Event listeners
[htmlEditor, cssEditor, jsEditor].forEach((editor) => {
  editor.addEventListener("input", () => {
    updatePreview();
    localStorage.setItem(editor.id, editor.value);
  });
});


function changeTheme() {
    const themeSelector = document.getElementById("theme-selector").value;
  
    const themes = {
      default: { main: "#4caf50", hover: "#388e3c" },
      purple: { main: "#a95cc5", hover: "#8b48b1" },
      blue: { main: "#2196f3", hover: "#1976d2" },
    };
  
    const selectedTheme = themes[themeSelector] || themes.default;
  
    // Apply theme colors
    document.documentElement.style.setProperty("--theme-color", selectedTheme.main);
    document.documentElement.style.setProperty("--theme-hover-color", selectedTheme.hover);
  }
  

  