import { Tri } from "./tri";
import { IVec2D, IVec3D, Vec } from "./vector";

export interface Texture extends ImageData {
    colors: string[];
    colorsUInt8: Uint8ClampedArray[];
}

export namespace Canvas {
    let width: number;
    let height: number;
    let ctx: CanvasRenderingContext2D;
    const frametimes = new Array(10).fill(Infinity);

    const HalfMax32UInt = 2 ** 16 - 1;
    let depthBuffer: Uint32Array = new Uint32Array();
    let emptyDepthBuffer: Uint32Array = new Uint32Array();

    let imageData = new ImageData(new Uint8ClampedArray(4), 1);
    let emptyImageData = new ImageData(new Uint8ClampedArray(4), 1);

    let framecount = 0;
    let medianElapsed = 16.6;
    let backgroundColor: string;

    export function SetupCanvas(_backgroundColor = "#112244") {
        const canvas = document.querySelector("canvas");
        if (!canvas) throw "canvas not found";
        const _ctx = canvas.getContext("2d");
        if (!_ctx) throw "2D Context could not be created";
        ctx = _ctx;
        width = Math.round(canvas.getBoundingClientRect().width);
        height = Math.round(canvas.getBoundingClientRect().height);
        canvas.setAttribute("width", width + "px");
        canvas.setAttribute("height", height + "px");

        ctx.lineWidth = 0;
        backgroundColor = _backgroundColor;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        emptyImageData = ctx.getImageData(0, 0, width, height);
        imageData = ctx.getImageData(0, 0, width, height);
        emptyDepthBuffer = new Uint32Array(width * height).fill(0);
        depthBuffer = new Uint32Array(width * height);

        const AspectRatio = height / width;
        return AspectRatio;
    }

    export function clear(elapsed: number) {
        framecount++;
        frametimes[framecount % frametimes.length] = elapsed;
        medianElapsed = frametimes.reduce((a, b) => a + b) / frametimes.length;

        ctx.lineWidth = 0;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        imageData.data.set(emptyImageData.data);
        depthBuffer.set(emptyDepthBuffer);
    }

    export async function loadImage(path: string) {
        return new Promise<Texture>(res => {
            const img = document.createElement("img");
            img.src = path;
            img.onload = () => {
                ctx.canvas.width = img.width;
                ctx.canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const tex = ctx.getImageData(0, 0, img.width, img.height);
                const colors: string[] = [];
                const colorsUInt8: Uint8ClampedArray[] = [];
                for (let i = 0; i < tex.data.length; i += 4) {
                    const color = tex.data.slice(i, i + 4)
                    colorsUInt8.push(color);
                    colors.push(`rgba(${color.join(",")})`);
                }
                res(Object.assign(tex, { colors, colorsUInt8 }));
                ctx.canvas.width = width;
                ctx.canvas.height = height;
            };
        });
    }

    function NormalizedToScreenSpace(tri: Tri): Tri {
        // Offset consto visible normalized space
        tri = Tri.AddVector(tri, { x: 1, y: 1, z: 0, w: 1 });
        // un-normalize to screen coordinates
        return Tri.MultiplyVector(tri, { x: 0.5 * width, y: 0.5 * height, z: 1, w: 1 })
    }

    export function DrawTriangle(tri: Tri, color = "#ffffff", lineWidth = 1) {
        const [p1, p2, p3] = NormalizedToScreenSpace(tri).p;
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

    export function TexturedTriangle(tri: Tri, tex: Texture) {
        const { p, t: [t1, t2, t3] } = NormalizedToScreenSpace(tri);

        // we are in cartesian space now so we should treat vertices as integer coordinates now, as we loop over them later
        const [p1, p2, p3] = p.map(({ x, y }) => Vec.make3D(Math.round(x), Math.round(y)));

        // sort the points by their y value
        if (p2.y < p1.y) {
            Vec.swap(p1, p2);
            Vec.swap2D(t1, t2);
        }
        if (p3.y < p1.y) {
            Vec.swap(p3, p1);
            Vec.swap2D(t3, t1);
        }
        if (p3.y < p2.y) {
            Vec.swap(p3, p2);
            Vec.swap2D(t3, t2);
        }

        // if y3 and y1 are the same, the triangle isn't visible, since it occupies 0 rows of pixels
        if (p3.y == p1.y) { return; }
        const { uvStep: uvStepRight, xStep: xStepRight } = getStep(p1, p3, t1, t3);

        if (p2.y != p1.y) {
            const { uvStep: uvStepLeft, xStep: xStepLeft } = getStep(p1, p2, t1, t2);

            rasterize(p1.y, p2.y, p1.x, p1.x,
                Vec.make3Dfrom2D(t1), Vec.make3Dfrom2D(t1),
                xStepLeft, xStepRight,
                uvStepLeft, uvStepRight,
                tex, tri.l);
        }

        if (p3.y != p2.y) {
            // we need to interpolate the starting values for rightX and uvRight, since it has been already interpolated half way in the first rasterize call
            const y1y2 = p2.y - p1.y;
            const rightX = p1.x + xStepRight * y1y2;
            const rightUV = Vec.Add(Vec.make3Dfrom2D(t1), Vec.MultiplyConst(uvStepRight, y1y2));

            const { uvStep: uvStepLeft, xStep: xStepLeft } = getStep(p2, p3, t2, t3);

            rasterize(p2.y, p3.y, p2.x, rightX,
                Vec.make3Dfrom2D(t2), rightUV,
                xStepLeft, xStepRight,
                uvStepLeft, uvStepRight,
                tex, tri.l);
        }
    }

    function getStep(p1: IVec3D, p2: IVec3D, t1: IVec2D, t2: IVec2D) {
        const y1y2 = p2.y - p1.y;
        const x1x2 = p2.x - p1.x;
        const t1t2 = Vec.make3D(
            t2.u - t1.u,
            t2.v - t1.v,
            t2.w - t1.w
        );
        return {
            xStep: x1x2 / y1y2,
            uvStep: Vec.MultiplyConst(t1t2, 1 / y1y2)
        };
    }

    function rasterize(
        startRow: number, endRow: number,
        xLeft: number, xRight: number,
        uvLeft: IVec3D, uvRight: IVec3D,
        xStepLeft: number, xStepRight: number,
        uvStepLeft: IVec3D, uvStepRight: IVec3D,
        tex: Texture, luminance: number
    ): void {
        // xLeft might be identical to xRight in the beginning but they propagate in different directions.
        // if the left side is larger than the right side, swap the points
        if (xLeft + xStepLeft > xRight + xStepRight) {
            return rasterize(
                startRow, endRow,
                xRight, xLeft,
                uvRight, uvLeft,
                xStepRight, xStepLeft,
                uvStepRight, uvStepLeft,
                tex, luminance);
        }

        // get a reference to the texture width and height instead of aquiring it for each pixel of the tri
        const { width: texWidth, height: texHeight } = tex;

        const lerpResult = Vec.make3D();

        for (let i = startRow; i <= endRow; i++) {
            const currentStep = i - startRow;
            const startCol = Math.round(xLeft + currentStep * xStepLeft);
            const endCol = Math.round(xRight + currentStep * xStepRight);

            const tex_start = Vec.Add(uvLeft, Vec.MultiplyConst(uvStepLeft, currentStep));
            const tex_end = Vec.Add(uvRight, Vec.MultiplyConst(uvStepRight, currentStep));

            const t_step = 1 / (endCol - startCol);
            let t = 0;

            for (let j = startCol; j < endCol; j++) {
                Vec.lerp(tex_start, tex_end, t, lerpResult);
                const { x: tex_u, y: tex_v, z: tex_w } = lerpResult;

                if ((tex_w * HalfMax32UInt) > depthBuffer[i * width + j]) {
                    DrawPixel(j, i, SampleColorUInt8(tex_u / tex_w, tex_v / tex_w, tex, texWidth, texHeight), luminance);
                    depthBuffer[i * width + j] = tex_w * HalfMax32UInt;
                }
                t += t_step;
            }
        }
    }

    function SampleColorUInt8(u: number, v: number, tex: Texture, width: number, height: number) {
        // due to rounding errors and all javascript numbers being floating point,
        // u and v can end up being slightly below zero (e.g. -0.0000000001), hence the Math.trunc
        const col = Math.trunc(u * width);
        const row = Math.trunc(v * height);
        return tex.colorsUInt8[col + width * row];
    }

    function DrawPixel(x: number, y: number, [r, g, b, a]: Uint8ClampedArray, luminance: number) {
        let i = (x + width * y) * 4;
        imageData.data[i] = r * luminance;
        imageData.data[i + 1] = g * luminance;
        imageData.data[i + 2] = b * luminance;
        imageData.data[i + 3] = a;
    }

    export function swapImageData() {
        ctx.putImageData(imageData, 0, 0);
    }

    export function DrawDebugInfo(tris: number, projectionTime: number, clippingTime: number, drawTime: number) {
        ctx.fillStyle = "#888"
        ctx.fillText((1 / medianElapsed).toFixed(0) + " FPS", 10, 10);
        ctx.fillText("Tris: " + tris, 10, 25);
        ctx.fillText("Projection: " + projectionTime.toFixed(1) + "ms", 10, 40);
        ctx.fillText("Clipping: " + clippingTime.toFixed(1) + "ms", 10, 55);
        ctx.fillText("Draw: " + drawTime.toFixed(1) + "ms", 10, 70);
    }
}