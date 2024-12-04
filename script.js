const htmlEditor = document.getElementById("html-editor");
const cssEditor = document.getElementById("css-editor");
const jsEditor = document.getElementById("js-editor");
const iframe = document.getElementById("preview");

// Auto-save functionality
window.addEventListener("load", () => {
  htmlEditor.textContent = localStorage.getItem("html") || "";
  cssEditor.textContent = localStorage.getItem("css") || "";
  jsEditor.textContent = localStorage.getItem("js") || "";
  Prism.highlightElement(htmlEditor);
  Prism.highlightElement(cssEditor);
  Prism.highlightElement(jsEditor);
  updatePreview(); // Load the preview on page load
  
  // Load saved theme on startup
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.innerHTML = `<i class="fas fa-${savedTheme === 'light' ? 'sun' : 'moon'}"></i>`;
  }
});

// Update preview in iframe
function updatePreview() {
  const html = htmlEditor.textContent;
  const css = cssEditor.textContent;
  const js = jsEditor.textContent;

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
    if (editor.textContent.trim() === "") {
        showCopyPopup("Error: The code box is empty! Please enter some code.", true);  // Pass 'true' for error
        return;
    }

    navigator.clipboard.writeText(editor.textContent).then(() => {
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
    const html = htmlEditor.textContent;
    const css = cssEditor.textContent;
    const js = jsEditor.textContent;

    // Check if all code boxes are empty
    if (html.trim() === "" && css.trim() === "" && js.trim() === "") {
        showCopyPopup("Error: All code boxes are empty! Please enter some code.", true);
        return;
    }

    const zip = new JSZip();
    zip.file("index.html", html);
    zip.file("styles.css", css);
    zip.file("script.js", js);

    zip.generateAsync({ type: "blob" }).then(function(content) {
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(content);
        downloadLink.download = "code.zip";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        showCopyPopup("Code downloaded successfully!", false);
    });
}

// Clear all fields and localStorage
function clearAll() {
  htmlEditor.textContent = "";
  cssEditor.textContent = "";
  jsEditor.textContent = "";
  localStorage.clear();
  Prism.highlightElement(htmlEditor);
  Prism.highlightElement(cssEditor);
  Prism.highlightElement(jsEditor);
  updatePreview(); // Reset the preview after clearing
}

// Delete code from an editor
function deleteCode(type) {
  const editor = type === "html" ? htmlEditor : type === "css" ? cssEditor : jsEditor;
  
  // Check if there's any code to delete
  if (!editor.textContent.trim()) {
    showCopyPopup("Nothing to delete!", true);
    return;
  }

  // Ask for confirmation
  if (confirm(`Are you sure you want to delete all ${type.toUpperCase()} code?`)) {
    editor.textContent = '';
    localStorage.setItem(type, '');
    Prism.highlightElement(editor);
    updatePreview();
    showCopyPopup(`${type.toUpperCase()} code deleted!`, false);
  }
}

// Open preview in new tab
function openPreview() {
  const html = htmlEditor.textContent.trim();
  const css = cssEditor.textContent.trim();
  const js = jsEditor.textContent.trim();
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

// View switching functionality
function changeView(viewType) {
    const main = document.querySelector('main');
    
    // Remove all view classes
    main.classList.remove('view-bottom-preview');
    main.classList.remove('view-left-preview');
    main.classList.remove('view-right-preview');
    
    // Add new view class
    main.classList.add(`view-${viewType}`);
    
    // Update active state of view buttons
    document.querySelectorAll('.view-button').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.view === viewType) {
            button.classList.add('active');
        }
    });

    // Re-initialize resizer for new view
    // Removed resizer initialization
}

// Initialize view buttons
document.querySelectorAll('.view-button').forEach(button => {
    button.addEventListener('click', () => {
        const viewType = button.dataset.view;
        changeView(viewType);
    });
});

// Event listeners for auto-save and update preview
[htmlEditor, cssEditor, jsEditor].forEach((editor) => {
  editor.addEventListener("input", () => {
    updatePreview(); // Update preview whenever input changes
    localStorage.setItem("html", htmlEditor.textContent); // Auto-save to localStorage for HTML
    localStorage.setItem("css", cssEditor.textContent);  // Auto-save to localStorage for CSS
    localStorage.setItem("js", jsEditor.textContent);    // Auto-save to localStorage for JS
    Prism.highlightElement(editor);
  });

  // Handle tab key
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const tabNode = document.createTextNode("    ");
      range.insertNode(tabNode);
      range.setStartAfter(tabNode);
      range.setEndAfter(tabNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
});

// Load layout when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initial layout setup
    initializeDefaultLayout();
    
    // Load any saved layout
    loadLayout();
});

// Initialize default layout
function initializeDefaultLayout() {
    const main = document.querySelector('main');
    const editors = document.querySelector('.editors');
    const preview = document.querySelector('.preview-container');
    
    // Determine current view
    const currentView = Array.from(main.classList)
        .find(cls => cls.startsWith('view-')) || 'view-bottom-preview';
    
    // Set default sizes based on view
    if (currentView === 'view-bottom-preview') {
        editors.style.height = '30%';
        preview.style.height = '70%';
    } else {
        // Left and right preview
        editors.style.width = '30%';
        preview.style.width = '70%';
    }
}

// Load saved view preference
function loadSavedView() {
    const savedView = localStorage.getItem('preferredView');
    if (savedView) {
        changeView(savedView);
    }
}

// Removed resizer functionality
let isResizing = false;
let currentResizer = null;
let startPos = 0;
let startSize = 0;

function initResize(e) {
    // This function is no longer needed
}

function resize(e) {
    // This function is no longer needed
}

function updateSizeDisplay(display, resizer, size) {
    // This function is no longer needed
}

function stopResize() {
    // This function is no longer needed
}

function initializeResizer() {
    // This function is no longer needed
}

// Remove any event listeners related to resizing
function removeResizerEventListeners() {
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
}

// Call this function to clean up any resizer-related setup
document.addEventListener('DOMContentLoaded', removeResizerEventListeners);

// View Mode Popup
const viewModeBtn = document.getElementById('view-mode-btn');
const viewModePopup = document.getElementById('view-mode-popup');

viewModeBtn.addEventListener('click', () => {
  viewModePopup.classList.add('show');
});

// Close popup when clicking outside
viewModePopup.addEventListener('click', (e) => {
  if (e.target === viewModePopup) {
    viewModePopup.classList.remove('show');
  }
});

function changeView(mode) {
  const main = document.querySelector('main');
  main.className = `view-${mode}`;
  viewModePopup.classList.remove('show');
  localStorage.setItem('viewMode', mode);
}

// Load saved view mode
const savedViewMode = localStorage.getItem('viewMode');
if (savedViewMode) {
  changeView(savedViewMode);
}

// Toggle between light and dark theme
function toggleTheme() {
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.setAttribute('data-theme', newTheme);
  themeToggle.innerHTML = `<i class="fas fa-${newTheme === 'light' ? 'sun' : 'moon'}"></i>`;
  
  // Save theme preference
  localStorage.setItem('theme', newTheme);
}

// Add theme toggle click handler
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
