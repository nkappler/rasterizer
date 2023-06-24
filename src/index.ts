import { Camera } from "./camera";
import { Canvas } from "./canvas";
import { Input } from "./input";
import { Mesh } from "./mesh";
import { Vec3D } from "./vector";

var mesh: Mesh = new Mesh([]);

let camera: Camera;

setup();
mainLoop(0);

document.querySelector("canvas")?.addEventListener("click", e => {
    (e.target as HTMLCanvasElement).requestPointerLock();
})

window.addEventListener("resize", setup);

function setup() {
    if (mesh.tris.length === 0) {
        Mesh.LoadFromObjFile("./src/teapot.obj").then(data => {
            mesh = data
            mesh.translate(new Vec3D(0, -2, 5));
        });
    }

    const AspectRatio = Canvas.SetupCanvas();
    camera = new Camera(AspectRatio);
    Input.setup(camera);
}

function mainLoop(elapsed: number) {

    performance.clearMarks();
    performance.mark("FrameStart");

    Input.update(camera, elapsed);
    Canvas.clear(elapsed);

    // mesh.rotateY(elapsed);
    //project 3D -> 2D normalized
    const trisToDraw = mesh.projectTris(camera);

    for (const tri of trisToDraw) {
        const { r, g, b, a } = (tri as any).lit ?? new Vec3D(255, 255, 255);
        Canvas.FillTriangle(tri, `rgba(${r}, ${g}, ${b}, ${a}`);
    }

    Canvas.DrawDebugInfo(
        trisToDraw.length,
        performance.measure("projection", "FrameStart", "clippingStart").duration,
        performance.measure("clipping", "clippingStart").duration);

    requestAnimationFrame(() => mainLoop(performance.measure("elapsed", "FrameStart").duration / 1000));
}