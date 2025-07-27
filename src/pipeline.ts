import { Camera } from "./camera";
import { Canvas } from "./canvas";
import { Mesh } from "./mesh";
import { Tri } from "./tri";

const Identity = (tris: Tri[]) => tris;
const white = [255, 255, 255];

export class RenderPipeline {
    private renderSteps: [
        typeof Identity,
        typeof Identity,
        typeof Identity,
        typeof Identity,
        typeof Identity,
        typeof Identity,
        typeof Identity,
    ]

    public constructor(private cam: Camera, private mesh: Mesh) {
        this.renderSteps = [
            this.backFaceCulling.bind(this),
            this.lighting.bind(this),
            this.project.bind(this),
            this.clip.bind(this),
            this.drawTexture.bind(this),
            Identity, // wireframe
            this.debugInfo.bind(this)
        ];
    }

    private backFaceCulling() {
        this.mesh.cullTris(this.cam);
        return [];
    }

    private lighting() {
        this.mesh.illuminate();
        return [];
    }

    public project() {
        return this.mesh.tris.flatMap(t => this.cam.project2D(t));
    }

    private clip(tris: Tri[]) {
        performance.mark("clippingStart");
        return tris.flatMap(tri => this.cam.frustumClip(tri));
    }

    private drawTexture(tris: Tri[]) {
        performance.mark("draw");

        for (const tri of tris) {
            Canvas.TexturedTriangle(tri, this.mesh.texture);
        }
        Canvas.swapImageData();

        return tris;
    }

    private draw(tris: Tri[]) {
        performance.mark("draw");
        tris = tris.sort((a, b) => {
            const z1 = (a.p[0].z + a.p[1].z + a.p[2].z) / 3;
            const z2 = (b.p[0].z + b.p[1].z + b.p[2].z) / 3;
            return z2 - z1;
        });

        for (const tri of tris) {
            const fill = "#" + white.map(c => Math.round(c * tri.l).toString(16)).join("");
            Canvas.FillTriangle(tri, fill);
        }

        return tris;
    }

    private drawVoid(tris: Tri[]) {
        performance.mark("draw");

        return tris;
    }

    private wireframe(tris: Tri[]) {
        tris.forEach(t => Canvas.DrawTriangle(t, "#0f0"));
        return tris;
    }

    private debugInfo(tris: Tri[]) {
        Canvas.DrawDebugInfo(
            tris.length,
            performance.measure("projection", "FrameStart", "clippingStart").duration,
            performance.measure("clipping", "clippingStart", "draw").duration,
            performance.measure("clipping", "draw").duration);

        return tris;
    }

    public render(elapsed: number) {
        performance.clearMarks();
        performance.mark("FrameStart");
        (this.renderSteps[4] === this.draw || this.renderSteps[4].name !== "bound drawTexture")
            ? Canvas.clearCTX(elapsed)
            : Canvas.clear(elapsed);

        this.renderSteps.reduce((tris, step) => step(tris), [] as Tri[]);
    }

    public toggleWireFrame() {
        this.renderSteps[5] = this.renderSteps[3] === this.wireframe ? Identity : this.wireframe;
    }

    public toggleCulling() {
        this.renderSteps[0] = this.renderSteps[0].name === "bound backFaceCulling" ? Identity : this.backFaceCulling.bind(this);
    }

    public toggleShading() {
        this.renderSteps[1] = this.renderSteps[1].name === "bound lighting" ? Identity : this.lighting.bind(this);
    }

    public toggleTexture() {
        if (this.renderSteps[4] === this.draw) {
            this.renderSteps[4] = this.drawVoid;
            this.renderSteps[5] = this.wireframe;
        } else if (this.renderSteps[4].name === "bound drawTexture") {
            this.renderSteps[4] = this.draw;
            this.renderSteps[5] = Identity;
        } else {
            this.renderSteps[4] = this.drawTexture.bind(this);
            this.renderSteps[5] = Identity;
        }
    }
}