import { Tri } from "./tri";

export namespace Canvas {
    let width: number;
    let height: number;
    let ctx: CanvasRenderingContext2D;
    const frametimes = new Array(10).fill(Infinity);
    let framecount = 0;
    let medianElapsed = 16.6;

    export function SetupCanvas() {
        const canvas = document.querySelector("canvas");
        if (!canvas) throw "canvas not found";
        const _ctx = canvas.getContext("2d");
        if (!_ctx) throw "2D Context could not be created";
        ctx = _ctx;
        width = canvas.getBoundingClientRect().width;
        height = canvas.getBoundingClientRect().height;
        canvas.setAttribute("width", width + "px");
        canvas.setAttribute("height", height + "px");
        const AspectRatio = height / width;
        return AspectRatio;
    }

    export function clear(elapsed: number, color = "#112244") {
        framecount++;
        frametimes[framecount % frametimes.length] = elapsed;
        medianElapsed = frametimes.reduce((a, b) => a + b) / frametimes.length;

        ctx.lineWidth = 0;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
    }

    function NormalizedToScreenSpace(tri: Tri): Tri {
        // Offset into visible normalized space
        tri = Tri.AddVector(tri, { x: 1, y: 1, z: 0 });
        // un-normalize to screen coordinates
        return Tri.MultiplyVector(tri, { x: 0.5 * width, y: 0.5 * height, z: 1 })
    }

    export function DrawTriangle(tri: Tri, color = "#ffffff", lineWidth = 1) {
        const [p1, p2, p3] = NormalizedToScreenSpace(tri);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.stroke();
    }

    export function FillTriangle(tri: Tri, color = "#ffffff", fillStyle?: string, lineWidth = 0) {
        DrawTriangle(tri, color, lineWidth);
        ctx.fillStyle = fillStyle ?? color;
        ctx.fill();
    }

    export function DrawDebugInfo(tris: number, projectionTime: number, clippingTime: number) {
        ctx.fillStyle = "white"
        ctx.fillText((1 / medianElapsed).toFixed(0) + " FPS", 10, 10);
        ctx.fillText("Tris: " + tris, 10, 25);
        ctx.fillText("Projection: " + projectionTime.toFixed(1) + "ms", 10, 40);
        ctx.fillText("Clipping: " + clippingTime.toFixed(1) + "ms", 10, 55);
    }
}