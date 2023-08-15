import { Camera } from "./camera";
import { Canvas } from "./canvas";
import { Input } from "./input";
import { Mesh } from "./mesh";
import { RenderPipeline } from "./pipeline";
import { Vec } from "./vector";

var mesh: Mesh = new Mesh([]);

let camera: Camera = new Camera(1);
let pipeline: RenderPipeline = new RenderPipeline(camera, mesh);

setup();
mainLoop(0);

window.addEventListener("resize", setup);

function setup() {
    if (mesh.tris.length == 0) {
        Promise.all([
            Canvas.loadImage("./src/UVGrid.png"),
            Mesh.LoadFromObjFile("./src/teapot.obj")
        ]).then(([texture, teapot]) => {
            mesh = teapot;

            mesh.translate(Vec.make3D(-0.5, -0.5, 8));
            mesh.rotateY(0.1);
            mesh.rotateZ(0.3);

            mesh.texture = texture;
            pipeline = new RenderPipeline(camera, mesh);
            Input.setup(camera, pipeline);
        });
    }

    const AspectRatio = Canvas.SetupCanvas();
    camera = new Camera(AspectRatio, undefined, camera.pos, camera.rot);
    pipeline = new RenderPipeline(camera, mesh);
    Input.setup(camera, pipeline);
}

function mainLoop(elapsed: number) {
    mesh.rotateY(elapsed * Math.PI * 0.1);

    Input.update(camera, elapsed);
    pipeline.render(elapsed);

    requestAnimationFrame(() => mainLoop(performance.measure("elapsed", "FrameStart").duration / 1000));
}