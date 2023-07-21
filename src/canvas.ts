import { Tri } from "./tri";

export interface Texture extends ImageData {
    colors: string[];
}

export namespace Canvas {
    let width: number;
    let height: number;
    let ctx: CanvasRenderingContext2D;
    const frametimes = new Array(10).fill(Infinity);
    let depthBuffer: number[];
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

        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 0;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        depthBuffer = new Array(width * height).fill(0);
    }

    export async function loadImage(path: string) {
        return new Promise<Texture>(res => {
            const img = document.createElement("img");
            img.src = path;
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const colors: string[] = [];
                for (let i = 0; i < imageData.data.length; i += 4) {
                    colors.push(`rgba(${imageData.data.slice(i, i + 4).join(",")})`);
                }
                res(Object.assign(imageData, { colors }));
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
        const { p: [p1, p2, p3], t: [t1, t2, t3] } = NormalizedToScreenSpace(tri);
        let { x: x1, y: y1 } = p1;
        let { x: x2, y: y2 } = p2;
        let { x: x3, y: y3 } = p3;
        let { u: u1, v: v1, w: w1 } = t1;
        let { u: u2, v: v2, w: w2 } = t2;
        let { u: u3, v: v3, w: w3 } = t3;

        [y1, y2, y3] = [y1, y2, y3].map(Math.round);

        if (y2 < y1) {
            [x1, x2] = [x2, x1];
            [y1, y2] = [y2, y1];
            [u1, u2] = [u2, u1];
            [v1, v2] = [v2, v1];
            [w1, w2] = [w2, w1];
        }
        if (y3 < y1) {
            [x1, x3] = [x3, x1];
            [y1, y3] = [y3, y1];
            [u1, u3] = [u3, u1];
            [v1, v3] = [v3, v1];
            [w1, w3] = [w3, w1];
        }
        if (y3 < y2) {
            [x2, x3] = [x3, x2];
            [y2, y3] = [y3, y2];
            [u2, u3] = [u3, u2];
            [v2, v3] = [v3, v2];
            [w2, w3] = [w3, w2];
        }

        let dx1 = x2 - x1;
        let dy1 = y2 - y1;
        let du1 = u2 - u1;
        let dv1 = v2 - v1;
        let dw1 = w2 - w1;

        const dx2 = x3 - x1;
        const dy2 = y3 - y1;
        const du2 = u3 - u1;
        const dv2 = v3 - v1;
        const dw2 = w3 - w1;

        let tex_u = 0, tex_v = 0, tex_w = 0;

        let dax_step = 0, dbx_step = 0,
            du1_step = 0, dv1_step = 0,
            du2_step = 0, dv2_step = 0,
            dw1_step = 0, dw2_step = 0;

        if (dy1) {
            dax_step = dx1 / Math.abs(dy1);
            du1_step = du1 / Math.abs(dy1);
            dv1_step = dv1 / Math.abs(dy1);
            dw1_step = dw1 / Math.abs(dy1);
        }

        if (dy2) {
            dbx_step = dx2 / Math.abs(dy2);
            du2_step = du2 / Math.abs(dy2);
            dv2_step = dv2 / Math.abs(dy2);
            dw2_step = dw2 / Math.abs(dy2);
        }


        if (dy1) {
            for (let i = y1; i <= y2; i++) {
                let ax = Math.round(x1 + (i - y1) * dax_step);
                let bx = Math.round(x1 + (i - y1) * dbx_step);

                let tex_su = u1 + (i - y1) * du1_step;
                let tex_sv = v1 + (i - y1) * dv1_step;
                let tex_sw = w1 + (i - y1) * dw1_step;

                let tex_eu = u1 + (i - y1) * du2_step;
                let tex_ev = v1 + (i - y1) * dv2_step;
                let tex_ew = w1 + (i - y1) * dw2_step;

                if (ax > bx) {
                    [ax, bx] = [bx, ax];
                    [tex_su, tex_eu] = [tex_eu, tex_su];
                    [tex_sv, tex_ev] = [tex_ev, tex_sv];
                    [tex_sw, tex_ew] = [tex_ew, tex_sw];
                }

                tex_u = tex_su;
                tex_v = tex_sv;
                tex_w = tex_sw;

                const t_step = 1 / (bx - ax);
                let t = 0;


                for (let j = ax; j < bx; j++) {

                    tex_u = (1 - t) * tex_su + t * tex_eu;
                    tex_v = (1 - t) * tex_sv + t * tex_ev;
                    tex_w = (1 - t) * tex_sw + t * tex_ew;

                    if (tex_w > depthBuffer[i * width + j]) {
                        DrawPixel(j, i, SampleColor(tex_u / tex_w, tex_v / tex_w, tex));
                        depthBuffer[i * width + j] = tex_w;
                    }

                    t += t_step;
                }
            }
        }

        dy1 = y3 - y2;
        dx1 = x3 - x2;
        dv1 = v3 - v2;
        du1 = u3 - u2;
        dw1 = w3 - w2;

        if (dy1) dax_step = dx1 / Math.abs(dy1);
        if (dy2) dbx_step = dx2 / Math.abs(dy2);

        du1_step = 0, dv1_step = 0;
        if (dy1) du1_step = du1 / Math.abs(dy1);
        if (dy1) dv1_step = dv1 / Math.abs(dy1);
        if (dy1) dw1_step = dw1 / Math.abs(dy1);

        if (dy1) {
            for (let i = y2; i <= y3; i++) {
                let ax = Math.round(x2 + (i - y2) * dax_step);
                let bx = Math.round(x1 + (i - y1) * dbx_step);

                let tex_su = u2 + (i - y2) * du1_step;
                let tex_sv = v2 + (i - y2) * dv1_step;
                let tex_sw = w2 + (i - y2) * dw1_step;

                let tex_eu = u1 + (i - y1) * du2_step;
                let tex_ev = v1 + (i - y1) * dv2_step;
                let tex_ew = w1 + (i - y1) * dw2_step;

                if (ax > bx) {
                    [ax, bx] = [bx, ax];
                    [tex_su, tex_eu] = [tex_eu, tex_su];
                    [tex_sv, tex_ev] = [tex_ev, tex_sv];
                    [tex_sw, tex_ew] = [tex_ew, tex_sw];
                }

                tex_u = tex_su;
                tex_v = tex_sv;
                tex_w = tex_sw;

                const tstep = 1 / (bx - ax);
                let t = 0;

                for (let j = ax; j < bx; j++) {
                    tex_u = (1 - t) * tex_su + t * tex_eu;
                    tex_v = (1 - t) * tex_sv + t * tex_ev;
                    tex_w = (1 - t) * tex_sw + t * tex_ew;

                    if (tex_w > depthBuffer[i * width + j]) {
                        DrawPixel(j, i, SampleColor(tex_u / tex_w, tex_v / tex_w, tex));
                        depthBuffer[i * width + j] = tex_w;
                    }
                    t += tstep;
                }
            }
        }

    }

    function SampleColor(u: number, v: number, tex: Texture) {
        const col = Math.floor(u * (tex.width) - 0.001);
        const row = Math.floor(v * (tex.height) - 0.001);
        let i = (col + tex.width * row);
        return tex.colors[i];
    }

    function DrawPixel(x: number, y: number, color: string) {
        ctx.fillStyle = color;
        // on firefox (and chrome I think) we need a half pixel offset to get opaque pixels, in safari we don't.
        ctx.fillRect(x, y, 1, 1);
    }

    export function DrawDebugInfo(tris: number, projectionTime: number, clippingTime: number) {
        ctx.fillStyle = "white"
        ctx.fillText((1 / medianElapsed).toFixed(0) + " FPS", 10, 10);
        ctx.fillText("Tris: " + tris, 10, 25);
        ctx.fillText("Projection: " + projectionTime.toFixed(1) + "ms", 10, 40);
        ctx.fillText("Clipping: " + clippingTime.toFixed(1) + "ms", 10, 55);
    }
}