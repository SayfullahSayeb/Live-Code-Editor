const htmlEditor = document.getElementById("html-editor");
const cssEditor = document.getElementById("css-editor");
const jsEditor = document.getElementById("js-editor");
const iframe = document.getElementById("preview");

// Custom highlighting function that preserves cursor position
function highlightWithCursorPreservation(editor) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  
  // Store cursor position
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(editor);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  const caretOffset = preCaretRange.toString().length;
  
  // Highlight code
  Prism.highlightElement(editor);
  
  // Restore cursor position
  const textNodes = [];
  const walk = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
  while (walk.nextNode()) textNodes.push(walk.currentNode);
  
  let currentLength = 0;
  for (const node of textNodes) {
    const nodeLength = node.length;
    if (currentLength + nodeLength >= caretOffset) {
      const newRange = document.createRange();
      newRange.setStart(node, caretOffset - currentLength);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      break;
    }
    currentLength += nodeLength;
  }
}

// Auto-save functionality
window.addEventListener("load", () => {
  htmlEditor.textContent = localStorage.getItem("html") || "";
  cssEditor.textContent = localStorage.getItem("css") || "";
  jsEditor.textContent = localStorage.getItem("js") || "";
  
  // Initial highlighting
  Prism.highlightElement(htmlEditor);
  Prism.highlightElement(cssEditor);
  Prism.highlightElement(jsEditor);
  
  updatePreview();
  
  // Load saved theme on startup
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.innerHTML = `<i class="fas fa-${savedTheme === 'light' ? 'sun' : 'moon'}"></i>`;
  }
  
  // Load saved view mode preference
  const savedMode = localStorage.getItem('preferredViewMode') || 'bottom';
  changeView(savedMode);
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

  editor.textContent = '';
  localStorage.setItem(type, '');
  Prism.highlightElement(editor);
  updatePreview();
  showCopyPopup(`${type.toUpperCase()} code deleted!`, false);
}

// Open preview in new tab
function openPreview() {
  const html = htmlEditor.textContent.trim();
  const css = cssEditor.textContent.trim();
  const js = jsEditor.textContent.trim();
  
  if (!html && !css && !js) {
    showCopyPopup('Error: Please fill out at least one editor (HTML, CSS, JavaScript) before previewing.', true);
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
  showCopyPopup('Preview opened in new tab!', false);
}

// View Mode Management
const viewModePopup = document.getElementById('view-mode-popup');
const viewModeBackdrop = document.getElementById('view-mode-popup-backdrop');
const mainContainer = document.querySelector('main');

function showViewModePopup() {
  viewModePopup.classList.add('show');
  viewModeBackdrop.style.display = 'block';
}

function hideViewModePopup() {
  viewModePopup.classList.remove('show');
  viewModeBackdrop.style.display = 'none';
}

function changeView(mode) {
  mainContainer.className = ''; // Clear existing classes
  
  switch(mode) {
    case 'bottom':
      mainContainer.classList.add('view-vertical');
      break;
    case 'left':
      mainContainer.classList.add('view-horizontal', 'preview-left');
      break;
    case 'right':
      mainContainer.classList.add('view-horizontal', 'preview-right');
      break;
  }
  
  // Save the view mode preference
  localStorage.setItem('preferredViewMode', mode);
  hideViewModePopup();
  updatePreview(); // Refresh the preview
}

// Event listeners for auto-save and update preview
[htmlEditor, cssEditor, jsEditor].forEach((editor) => {
  let lastContent = editor.textContent;
  
  editor.addEventListener("input", () => {
    // Only highlight if content actually changed
    if (lastContent !== editor.textContent) {
      lastContent = editor.textContent;
      updatePreview();
      localStorage.setItem("html", htmlEditor.textContent);
      localStorage.setItem("css", cssEditor.textContent);
      localStorage.setItem("js", jsEditor.textContent);
      highlightWithCursorPreservation(editor);
    }
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
      
      // Trigger input event to update highlighting
      editor.dispatchEvent(new Event('input'));
    }
  });
});

// Toggle between light and dark theme
function toggleTheme() {
  const root = document.documentElement;
  const currentTheme = root.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  root.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update theme toggle icon
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.innerHTML = `<i class="fas fa-${newTheme === 'light' ? 'sun' : 'moon'}"></i>`;
}

// Add theme toggle click handler
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// Event Listeners
document.getElementById('view-mode-btn').addEventListener('click', showViewModePopup);
viewModeBackdrop.addEventListener('click', hideViewModePopup);

document.getElementById('view-mode-bottom').addEventListener('click', () => changeView('bottom'));
document.getElementById('view-mode-left').addEventListener('click', () => changeView('left'));
document.getElementById('view-mode-right').addEventListener('click', () => changeView('right'));
