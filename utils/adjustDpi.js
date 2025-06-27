
export default function adjustCanvasDPI(canvaElm, ctx) {
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvaElm.clientWidth;
    const cssHeight = canvaElm.clientHeight;

    // Set the internal pixel size of the canvas

    canvaElm.width = cssWidth * dpr;
    canvaElm.height = cssHeight * dpr;

    // Set the CSS size so it stays visually the same size on screen
    canvaElm.style.width = `${cssWidth}px`;
    canvaElm.style.height = `${cssHeight}px`;

    // this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}