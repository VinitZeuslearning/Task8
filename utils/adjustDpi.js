
/**
 * Method which adjust the dpi of the canva element
 * 
 * @param {DOMElement} canvaElm  
 */

export default function adjustCanvasDPI(canvaElm, ctx) {
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = Math.round( canvaElm.clientWidth );
    const cssHeight = Math.round( canvaElm.clientHeight );

    // Set the internal pixel size of the canvas

    canvaElm.width = Math.round( cssWidth * dpr );
    canvaElm.height = Math.round( cssHeight * dpr );

    console.log(`height ${cssHeight} width ${cssWidth}`)

    // Set the CSS size so it stays visually the same size on screen
    canvaElm.style.width = `${cssWidth}px`;
    canvaElm.style.height = `${cssHeight}px`;

    // this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}