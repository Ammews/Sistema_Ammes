const container = document.querySelector('.container');
const canvasArea = document.querySelector('.canvas-area');
const sizeEl = document.querySelector('.size');
let size = sizeEl.value;
const color = document.querySelector('.color');
const resetBtn = document.querySelector('.btn');
const zoomLevelEl = document.querySelector('.zoom-level');

let draw = false;
let isPanning = false;
let startPanX, startPanY;
let translateX = -25; // Initial position
let translateY = -25; // Initial position
let scale = 1; // Initial zoom level

// Border visibility threshold - show borders when zoom level is above this value
const BORDER_THRESHOLD = 0.8;

function populate(size) {
  container.style.setProperty('--size', size);
  for (let i = 0; i < size * size; i++) {
    const div = document.createElement('div');
    div.classList.add('pixel');

    div.addEventListener('mouseover', function() {
      if (!draw) return;
      div.style.backgroundColor = color.value;
    });
    
    div.addEventListener('mousedown', function(e) {
      // Only draw if it's a left mouse click (button 0)
      if (e.button === 0) {
        div.style.backgroundColor = color.value;
      }
    });

    container.appendChild(div);
  }
  
  // Initial border visibility based on zoom level
  updateBorders();
}

// Update the container transform
function updateTransform() {
  container.style.transform = `translate(${translateX}%, ${translateY}%) scale(${scale})`;
  zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
  
  // Update border visibility based on new zoom level
  updateBorders();
}

// Update pixel borders based on zoom level
function updateBorders() {
  const pixels = document.querySelectorAll('.pixel');
  const borderStyle = scale >= BORDER_THRESHOLD ? '1px solid #e0e0e0' : 'none';
  
  pixels.forEach(pixel => {
    pixel.style.border = borderStyle;
  });
}

// Middle mouse button panning
canvasArea.addEventListener('mousedown', function(e) {
  // Middle mouse button (button 1)
  if (e.button === 1) {
    e.preventDefault(); // Prevent default middle-click scrolling behavior
    isPanning = true;
    startPanX = e.clientX;
    startPanY = e.clientY;
    canvasArea.style.cursor = 'grabbing';
  }
});

window.addEventListener('mousemove', function(e) {
  if (isPanning) {
    const diffX = e.clientX - startPanX;
    const diffY = e.clientY - startPanY;
    
    // Adjust panning speed based on zoom level
    translateX += (diffX / container.offsetWidth * 2) / scale;
    translateY += (diffY / container.offsetHeight * 2) / scale;
    
    updateTransform();
    
    startPanX = e.clientX;
    startPanY = e.clientY;
  }
});

window.addEventListener('mouseup', function(e) {
  // Check if middle mouse button was released
  if (e.button === 1 || isPanning) {
    isPanning = false;
    canvasArea.style.cursor = 'default';
  }
});

// Mouse wheel zoom
canvasArea.addEventListener('wheel', function(e) {
  e.preventDefault();
  
  // Get mouse position relative to canvas
  const rect = canvasArea.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  // Calculate mouse position in percentage
  const mouseXPercent = mouseX / canvasArea.offsetWidth * 2;
  const mouseYPercent = mouseY / canvasArea.offsetHeight * 2;

  // Determine zoom direction
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  
  // Calculate new scale with limits
  const newScale = Math.max(0.1, Math.min(10, scale * zoomFactor));
  
  // Adjust the translation to zoom toward mouse position
  if (newScale !== scale) {
    const scaleRatio = newScale / scale;
    translateX = mouseXPercent - (mouseXPercent - translateX) * scaleRatio;
    translateY = mouseYPercent - (mouseYPercent - translateY) * scaleRatio;
    scale = newScale;
    updateTransform();
  }
});

// Standard drawing functionality (left mouse button)
window.addEventListener('mousedown', function(e) {
  if (e.button === 0) { // Left mouse button
    draw = true;
  }
});

window.addEventListener('mouseup', function(e) {
  if (e.button === 0) { // Left mouse button
    draw = false;
  }
});

// Prevent context menu on right-click
canvasArea.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

// Reset functionality
function reset() {
  container.innerHTML = '';
  populate(size);
  // Reset zoom and position
  scale = 1;
  translateX = -25;
  translateY = -25;
  updateTransform();
}

resetBtn.addEventListener('click', reset);

sizeEl.addEventListener('keyup', function() {
  size = sizeEl.value;
  reset();
});

// Initialize
populate(size);
updateTransform();