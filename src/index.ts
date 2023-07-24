import { Camera } from "./camera";
import { Canvas } from "./canvas";
import { Input } from "./input";
import { Mesh } from "./mesh";
import { Tri } from "./tri";
import { Vec } from "./vector";

var mesh: Mesh = new Mesh([]);

let camera: Camera = new Camera(1);

setup();
mainLoop(0);

window.addEventListener("resize", setup);

function setup() {
    if (mesh.tris.length == 0) {
        Promise.all([
            Canvas.loadImage("./src/tex.jpeg"),
            Mesh.LoadFromObjFile("./src/teapot.obj")
        ]).then(([texture, teapot]) => {

            //mesh = m;
            mesh = new Mesh(
                teapot.tris.map(t => new Tri(...t.p, Vec.make2D(0, 1), Vec.make2D(0, 0), Vec.make2D(1, 0)))
            );

            mesh.translate(Vec.make3D(-0.5, -0.5, 14));
            mesh.rotateY(0.1);
            mesh.rotateZ(0.3);

            mesh.texture = texture;
        });
    }

    const AspectRatio = Canvas.SetupCanvas();
    camera = new Camera(AspectRatio, undefined, camera.pos, camera.rot);
    Input.setup(camera);
}

function mainLoop(elapsed: number) {

    mesh.rotateY(elapsed * Math.PI * 0.1);

    performance.clearMarks();
    performance.mark("FrameStart");

    Input.update(camera, elapsed);
    Canvas.clear(elapsed);

    //project 3D -> 2D normalized
    const projectedTris = mesh.projectTris(camera);

    performance.mark("clippingStart");

    const trisToDraw = projectedTris.reduce((list, tri) => {
        list.push(...camera.frustumClip(tri));
        return list;
    }, [] as Tri[]);

    performance.mark("draw");

    for (const tri of trisToDraw) {
        Canvas.TexturedTriangle(tri, mesh.texture);
    }

    Canvas.swapImageData();

    // wireframe
    // trisToDraw.forEach(t => Canvas.DrawTriangle(t, "#0f0"));

    Canvas.DrawDebugInfo(
        trisToDraw.length,
        performance.measure("projection", "FrameStart", "clippingStart").duration,
        performance.measure("clipping", "clippingStart", "draw").duration,
        performance.measure("clipping", "draw").duration);

    requestAnimationFrame(() => mainLoop(performance.measure("elapsed", "FrameStart").duration / 1000));
}