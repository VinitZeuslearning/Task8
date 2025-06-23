const viewport = document.getElementById('viewport');
const content = document.getElementById('content');

const cellWidth = 100;
const cellHeight = 100;
const totalCols = 50;
const totalRows = 30;

const viewportWidth = viewport.clientWidth;
const viewportHeight = viewport.clientHeight;

const cellsInRow = Math.ceil(viewportWidth / cellWidth) + 2;
const cellsInCol = Math.ceil(viewportHeight / cellHeight) + 2;

// Create a pool of reusable divs
const cellPool = [];
for (let i = 0; i < cellsInRow * cellsInCol; i++) {
  const div = document.createElement('div');
  div.className = 'cell';
  content.appendChild(div);
  cellPool.push(div);
}

// Render visible cells based on scroll position
function renderCells() {
  const scrollLeft = viewport.scrollLeft;
  const scrollTop = viewport.scrollTop;

  const startCol = Math.floor(scrollLeft / cellWidth);
  const startRow = Math.floor(scrollTop / cellHeight);

  let poolIndex = 0;

  for (let row = startRow; row < startRow + cellsInCol; row++) {
    if (row >= totalRows) continue;
    for (let col = startCol; col < startCol + cellsInRow; col++) {
      if (col >= totalCols) continue;

      const div = cellPool[poolIndex++];
      div.style.left = (col * cellWidth) + 'px';
      div.style.top = (row * cellHeight) + 'px';
      div.style.background = getColor(col, row);
      div.textContent = `${row},${col}`;
    }
  }

  // Hide unused pool divs
  for (; poolIndex < cellPool.length; poolIndex++) {
    cellPool[poolIndex].style.left = '-9999px';
  }
}

// Helper to generate consistent colors
function getColor(x, y) {
  return '#' + ((x * y * 99991) % 0xFFFFFF).toString(16).padStart(6, '0');
}

viewport.addEventListener('scroll', renderCells);

// Initial render
renderCells();
