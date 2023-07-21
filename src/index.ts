import { Camera } from "./camera";
import { Canvas } from "./canvas";
import { Input } from "./input";
import { Mesh } from "./mesh";
import { Tri } from "./tri";
import { Vec } from "./vector";

var mesh: Mesh = new Mesh([]);

let camera: Camera;

setup();
mainLoop(0);

document.querySelector("canvas")?.addEventListener("click", e => {
    (e.target as HTMLCanvasElement).requestPointerLock();
})

window.addEventListener("resize", setup);

function setup() {
    if (mesh.tris.length == 0) {
        Promise.all([
            Canvas.loadImage("./src/tex.jpeg"),
            Mesh.LoadFromObjFile("./src/teapot.obj")
        ]).then(([texture, teapot]) => {
            // axis.translate(Vec.make3D(0,0,5))

            //mesh = m;
            mesh = new Mesh( 
                teapot.tris.map(t => new Tri(...t.p, Vec.make2D(0, 1), Vec.make2D(0, 0), Vec.make2D(1, 0) ))
            //     [

            //     // SOUTH
            //     new Tri(Vec.make3D(0, 0, 0), Vec.make3D(0, 1, 0), Vec.make3D(1, 1, 0), Vec.make2D(0, 1), Vec.make2D(0, 0), Vec.make2D(1, 0)),
            //     new Tri(Vec.make3D(0, 0, 0), Vec.make3D(1, 1, 0), Vec.make3D(1, 0, 0), Vec.make2D(0, 1), Vec.make2D(1, 0), Vec.make2D(1, 1)),

            //     // EAST           																			   
            //     new Tri(Vec.make3D(1, 0, 0), Vec.make3D(1, 1, 0), Vec.make3D(1, 1, 1), Vec.make2D(0, 1), Vec.make2D(0, 0), Vec.make2D(1, 0)),
            //     new Tri(Vec.make3D(1, 0, 0), Vec.make3D(1, 1, 1), Vec.make3D(1, 0, 1), Vec.make2D(0, 1), Vec.make2D(1, 0), Vec.make2D(1, 1)),

            //     // NORTH           																			   
            //     new Tri(Vec.make3D(1, 0, 1), Vec.make3D(1, 1, 1), Vec.make3D(0, 1, 1), Vec.make2D(0, 1), Vec.make2D(0, 0), Vec.make2D(1, 0)),
            //     new Tri(Vec.make3D(1, 0, 1), Vec.make3D(0, 1, 1), Vec.make3D(0, 0, 1), Vec.make2D(0, 1), Vec.make2D(1, 0), Vec.make2D(1, 1)),

            //     // WEST            																			   
            //     new Tri(Vec.make3D(0, 0, 1), Vec.make3D(0, 1, 1), Vec.make3D(0, 1, 0), Vec.make2D(0, 1), Vec.make2D(0, 0), Vec.make2D(1, 0)),
            //     new Tri(Vec.make3D(0, 0, 1), Vec.make3D(0, 1, 0), Vec.make3D(0, 0, 0), Vec.make2D(0, 1), Vec.make2D(1, 0), Vec.make2D(1, 1)),

            //     // TOP             																			   
            //     new Tri(Vec.make3D(0, 1, 0), Vec.make3D(0, 1, 1), Vec.make3D(1, 1, 1), Vec.make2D(0, 1), Vec.make2D(0, 0), Vec.make2D(1, 0)),
            //     new Tri(Vec.make3D(0, 1, 0), Vec.make3D(1, 1, 1), Vec.make3D(1, 1, 0), Vec.make2D(0, 1), Vec.make2D(1, 0), Vec.make2D(1, 1)),

            //     // BOTTOM          																			  
            //     new Tri(Vec.make3D(1, 0, 1), Vec.make3D(0, 0, 1), Vec.make3D(0, 0, 0), Vec.make2D(0, 1), Vec.make2D(0, 0), Vec.make2D(1, 0)),
            //     new Tri(Vec.make3D(1, 0, 1), Vec.make3D(0, 0, 0), Vec.make3D(1, 0, 0), Vec.make2D(0, 1), Vec.make2D(1, 0), Vec.make2D(1, 1)),

            // ]
            
            );

            mesh.translate(Vec.make3D(-0.5, -0.5, 14));

            // mesh = new Mesh([...mesh.tris, ...axis.tris]);
            mesh.texture = texture;

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
        Canvas.TexturedTriangle(tri, mesh.texture);
        // Canvas.DrawTriangle(tri);
    }

    Canvas.DrawDebugInfo(
        trisToDraw.length,
        performance.measure("projection", "FrameStart", "clippingStart").duration,
        performance.measure("clipping", "clippingStart").duration);

    requestAnimationFrame(() => mainLoop(performance.measure("elapsed", "FrameStart").duration / 1000));
}