import { Canvas } from "./canvas";
import { Matrix4 } from "./matrix";
import { Mesh } from "./mesh";
import { Tri } from "./tri";
import { IVec3D, Vec3D } from "./vector";

var mesh: Mesh = { tris: [] };

let projectionMatrix: Matrix4;
let Theta = 0;

let camera = new Vec3D(0, 0, 0);
let LookDir = new Vec3D(0, 0, 1);
let Yaw = 0;
let Pitch = 0;
const light: IVec3D = new Vec3D(0.5, 0.5, -1);
const color: IVec3D = { x: 255, y: 255, z: 255 };
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

    Yaw += e.movementX * 0.001;
    Pitch += e.movementY * 0.001;
    Pitch = Math.max(Pitch, -Math.PI / 2.1);
    Pitch = Math.min(Pitch, Math.PI / 2.1);
});

window.addEventListener("resize", setup);

function setup() {
    if (mesh.tris.length === 0) {
        Mesh.LoadFromObjFile("./src/teapot.obj").then(data => mesh = data);
    }

    const AspectRatio = Canvas.SetupCanvas();
    projectionMatrix = Matrix4.MakeProjection(90, AspectRatio, 0.1, 1000);
}

function mainLoop(elapsed: number) {
    performance.clearMarks();
    performance.mark("FrameStart");

    const forward = Vec3D.MultiplyConst(LookDir, 8 * elapsed / 1000);
    const right = Vec3D.MultiplyConst(Vec3D.CrossProduct(LookDir, new Vec3D(0, 1, 0)), 8 * elapsed / 1000);

    const matCameraRot = Matrix4.MultiplyMatrix(
        Matrix4.MakeRotationX(Pitch),
        Matrix4.MakeRotationY(Yaw)
    );

    // look direction rotated around Y Axis
    LookDir = Matrix4.MultiplyVector(new Vec3D(0, 0, 1), matCameraRot);
    // offset to camera position to get world coordinates
    const target = Vec3D.Add(camera, LookDir);
    // point camera at target
    const matCamera = Matrix4.PointAt(camera, target);
    // inverting the camera matrix yields the view matrix
    const matView = Matrix4.QuickInverse(matCamera);

    if (keysPressed["KeyA"]) {
        camera = Vec3D.Subtract(camera, right);
    }

    if (keysPressed["KeyD"]) {
        camera = Vec3D.Add(camera, right);
    }

    if (keysPressed["KeyQ"]) {
        camera.y += 8 * elapsed / 1000;
    }

    if (keysPressed["KeyE"]) {
        camera.y -= 8 * elapsed / 1000;
    }

    if (keysPressed["KeyW"]) {
        camera = Vec3D.Add(camera, forward);
    }

    if (keysPressed["KeyS"]) {
        camera = Vec3D.Subtract(camera, forward);
    }

    if (keysPressed["ArrowLeft"]) {
        Yaw -= 2 * elapsed / 1000;
    }

    if (keysPressed["ArrowRight"]) {
        Yaw += 2 * elapsed / 1000
    }

    if (keysPressed["ArrowUp"]) {
        Pitch = Pitch - 2 * elapsed / 1000;
        Pitch = Math.max(Pitch, -Math.PI / 2.1);

        // TODO: fix translation scaling with Pitch
    }

    if (keysPressed["ArrowDown"]) {
        Pitch += 2 * elapsed / 1000;
        Pitch = Math.min(Pitch, Math.PI / 2.1);
    }

    Canvas.clear(elapsed);

    // Theta += 1 * elapsed / 1000;
    const matRotZ = Matrix4.MakeRotationZ(Theta);
    const matRotX = Matrix4.MakeRotationX(Theta * 0.5);
    const matTrans = Matrix4.MakeTranslation({ x: 0, y: 0, z: 10 });
    let matWorld = Matrix4.MultiplyMatrix(matRotZ, matRotX);
    matWorld = Matrix4.MultiplyMatrix(matWorld, matTrans);
    const matInvertY = Matrix4.makeIdentity();
    matInvertY[1][1] = -1;

    performance.mark("cameraReady");

    const projectedTris: Tri[] = [];

    //Project Triangles
    for (const tri of mesh.tris) {
        let triTransformed = Tri.MultiplyMatrix(tri, matWorld);

        const triNormal = Tri.GetNormal(triTransformed);
        // is the triangle visible?
        if (Vec3D.DotProduct(triNormal, Vec3D.Subtract(triTransformed[0], camera).normalized) < 0) {
            // Lighting
            const luminance = Math.max(0.1, Vec3D.DotProduct(light, triNormal));
            const lit = Vec3D.MultiplyConst(color, luminance);

            //Convert World Space -> View Space
            const triViewed = Tri.MultiplyMatrix(triTransformed, matView);

            // Clip Viewed Triangle against near plane
            let clippedTris = Tri.ClipAgainstPlane(new Vec3D(0, 0, 0.1), new Vec3D(0, 0, 1), triViewed);
            // Clip Viewed Triangle against far plane
            clippedTris = clippedTris.reduce((prev, current) => [...prev, ...Tri.ClipAgainstPlane(new Vec3D(0, 0, 100), new Vec3D(0, 0, -1), current)], [] as Tri[]);

            for (const clippedTri of clippedTris) {
                // Project from 3D -> 2D
                const triProjected = Tri.MultiplyMatrix(clippedTri, projectionMatrix);

                // normalize (frustum) the result of the matrix multiplication
                const [w1, w2, w3] = triProjected.map((p: Vec3D) => 1 / p.w);
                const triFrustum = Tri.MultiplyVectorAsConst(triProjected, new Vec3D(w1, w2, w3));

                // fix invert axis
                const triInverted = Tri.MultiplyMatrix(triFrustum, matInvertY);

                Object.assign(triInverted, { lit });
                projectedTris.push(triInverted);
            }
        }
    }

    projectedTris.sort((a, b) => {
        const z1 = (a[0].z + a[1].z + a[2].z) / 3;
        const z2 = (b[0].z + b[1].z + b[2].z) / 3;
        return z2 - z1;
    });

    performance.mark("clippingStart");

    const trisToDraw: Tri[] = [];

    for (const tri of projectedTris) {
        const listTriangles: Tri[] = [tri];
        let nNewTriangles = 1;

        for (let p = 0; p < 4; p++) {
            let nTrisToAdd: Tri[] = [];
            nNewTriangles = listTriangles.length;
            while (nNewTriangles > 0) {
                // Take triangle from front of queue
                const test = listTriangles[0];
                listTriangles.shift();
                nNewTriangles--;

                // Clip it against a plane. We only need to test each
                // subsequent plane, against subsequent new triangles
                // as all triangles after a plane clip are guaranteed
                // to lie on the inside of the plane.
                switch (p) {
                    case 0: nTrisToAdd = Tri.ClipAgainstPlane(new Vec3D(0, -1, 0), new Vec3D(0, 1, 0), test); break;
                    case 1: nTrisToAdd = Tri.ClipAgainstPlane(new Vec3D(0, 1, 0), new Vec3D(0, -1, 0), test); break;
                    case 2: nTrisToAdd = Tri.ClipAgainstPlane(new Vec3D(-1, 0, 0), new Vec3D(1, 0, 0), test); break;
                    case 3: nTrisToAdd = Tri.ClipAgainstPlane(new Vec3D(1, 0, 0), new Vec3D(-1, 0, 0), test); break;
                }

                // Clipping may yield a variable number of triangles, so
                // add these new ones to the back of the queue for subsequent
                // clipping against next planes
                listTriangles.push(...nTrisToAdd);
            }
        }
        trisToDraw.push(...listTriangles);
    }

    for (const tri of trisToDraw) {
        const lit = (tri as any).lit ?? new Vec3D(255, 255, 255);

        Canvas.FillTriangle(tri, `rgba(${lit.x}, ${lit.y}, ${lit.z})`);
    }


    Canvas.DrawDebugInfo(
        trisToDraw.length,
        performance.measure("projection", "cameraReady", "clippingStart").duration,
        performance.measure("clipping", "clippingStart").duration);

    requestAnimationFrame(() => mainLoop(performance.measure("elapsed", "FrameStart").duration));
}