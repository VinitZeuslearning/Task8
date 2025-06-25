function drawRowHeader(ctx, rowHeight, rowCount, rowStart) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = '#ccc';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';

    for (let r = 0; r < rowCount; r++) {
        const y = r * rowHeight;
        ctx.strokeRect(0, y, ctx.canvas.width, rowHeight);
        ctx.fillText((rowStart + r).toString(), ctx.canvas.width / 2, y + rowHeight / 2);
    }
}


function drawColHeader(ctx, colWidth, colCount, colStartChar) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = '#ccc';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';

    for (let c = 0; c < colCount; c++) {
        const x = c * colWidth;
        const label = getColLabel(colStartChar, c);
        ctx.strokeRect(x, 0, colWidth, ctx.canvas.height);
        ctx.fillText(label, x + colWidth / 2, ctx.canvas.height / 2);
    }
}

// Helper: convert 0 → 'A', 1 → 'B', 26 → 'AA'
function getColLabel(startChar, index) {
    const startCode = startChar.charCodeAt(0);
    let label = '';
    let n = index;
    while (n >= 0) {
        label = String.fromCharCode(startCode + (n % 26)) + label;
        n = Math.floor(n / 26) - 1;
    }
    return label;
}


const rowCanvas = document.getElementById('rowHeaderCanvas');
const colCanvas = document.getElementById('colHeaderCanvas');

const rowCtx = rowCanvas.getContext('2d');
const colCtx = colCanvas.getContext('2d');

drawRowHeader(rowCtx, 25, 20, 1);
drawColHeader(colCtx, 80, 10, 'A');
