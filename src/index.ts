import { Camera } from "./camera";
import { Canvas } from "./canvas";
import { Matrix4 } from "./matrix";
import { Mesh } from "./mesh";
import { Tri } from "./tri";
import { Vec3D } from "./vector";

var mesh: Mesh = new Mesh([]);

let camera: Camera;
const keysPressed: Record<KeyboardEvent["code"], boolean> = {};

setup();
mainLoop(0);

document.querySelector("canvas")?.addEventListener("click", e => {
    (e.target as HTMLCanvasElement).requestPointerLock();
})

window.addEventListener("keydown", e => {
    keysPressed[e.code] = true;
    e.preventDefault();
});

window.addEventListener("keyup", e => {
    keysPressed[e.code] = false;
});

window.addEventListener("mousemove", e => {
    if (document.pointerLockElement === null) return;

    camera.rotateY(e.movementX * 0.001);
    camera.rotateX(e.movementY * 0.001);
});

window.addEventListener("resize", setup);

function setup() {
    if (mesh.tris.length === 0) {
        Mesh.LoadFromObjFile("./src/teapot.obj").then(data => {
            mesh = data
            mesh.translate(new Vec3D(0, -2, 5));
        });
    }

    const AspectRatio = Canvas.SetupCanvas();
    camera = new Camera(AspectRatio)
}

function mainLoop(elapsed: number) {
    performance.clearMarks();
    performance.mark("FrameStart");

    const LookDir = camera.getHorizontalLookDirection();
    const forward = Vec3D.MultiplyConst(LookDir, 8 * elapsed / 1000);
    const right = Vec3D.MultiplyConst(Vec3D.CrossProduct(LookDir, new Vec3D(0, 1, 0)), 8 * elapsed / 1000);
    const up = Vec3D.MultiplyConst(new Vec3D(0,1,0), 8 * elapsed / 1000);

    if (keysPressed["KeyA"]) {
        camera.translate(right.inverted);
    }

    if (keysPressed["KeyD"]) {
        camera.translate(right);
    }

    if (keysPressed["KeyQ"]) {
        camera.translate(up);
    }

    if (keysPressed["KeyE"]) {
        camera.translate(up.inverted);
    }

    if (keysPressed["KeyW"]) {
        camera.translate(forward);
    }

    if (keysPressed["KeyS"]) {
        camera.translate(forward.inverted);
    }

    if (keysPressed["ArrowLeft"]) {
        camera.rotateY(-2 * elapsed / 1000);
    }

    if (keysPressed["ArrowRight"]) {
        camera.rotateY(2 * elapsed / 1000);
    }

    if (keysPressed["ArrowUp"]) {
        camera.rotateX(-2 * elapsed / 1000);
    }

    if (keysPressed["ArrowDown"]) {
        camera.rotateX(2 * elapsed / 1000);
    }

    Canvas.clear(elapsed);

    performance.mark("cameraReady");

    // mesh.rotateY(elapsed / 1000);
    //project 3D -> 2D normalized
    const projectedTris = mesh.projectTris(camera);

    projectedTris.sort((a, b) => {
        const z1 = (a[0].z + a[1].z + a[2].z) / 3;
        const z2 = (b[0].z + b[1].z + b[2].z) / 3;
        return z2 - z1;
    });

    performance.mark("clippingStart");

    const trisToDraw = projectedTris.reduce((list, tri) => {
        list.push(...camera.frustumClip(tri));
        return list;
    }, [] as Tri[]);

    for (const tri of trisToDraw) {
        const { r, g, b, a } = (tri as any).lit ?? new Vec3D(255, 255, 255);
        Canvas.FillTriangle(tri, `rgba(${r}, ${g}, ${b}, ${a}`);
    }

    Canvas.DrawDebugInfo(
        trisToDraw.length,
        performance.measure("projection", "cameraReady", "clippingStart").duration,
        performance.measure("clipping", "clippingStart").duration);

    requestAnimationFrame(() => mainLoop(performance.measure("elapsed", "FrameStart").duration));
}