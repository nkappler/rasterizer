import { Canvas } from "./canvas";
import { Matrix4 } from "./matrix";
import { Mesh } from "./mesh";
import { Tri } from "./tri";
import { IVec3D, Vec3D } from "./vector";

var mesh: Mesh = { tris: [] };

let projectionMatrix: Matrix4;
let Theta = 0;

const camera = new Vec3D(0, 0, 0);
const light: IVec3D = new Vec3D(0, 0, -1);
const color: IVec3D = { x: 255, y: 255, z: 255 };

setup();
mainLoop(0);

function setup() {
    window.removeEventListener("resize", setup);

    if (mesh.tris.length === 0) {
        Mesh.LoadFromObjFile("./src/Spaceship.obj").then(data => mesh = data);
    }

    const AspectRatio = Canvas.SetupCanvas();
    projectionMatrix = Matrix4.MakeProjection(90, AspectRatio, 0.1, 1000);

    window.addEventListener("resize", setup);
}

function mainLoop(elapsed: number) {
    const time = Date.now();
    Canvas.clear(elapsed);

    Theta += 1 * elapsed / 1000;
    const matRotZ = Matrix4.MakeRotationZ(Theta);
    const matRotX = Matrix4.MakeRotationX(Theta * 0.5);
    const matTrans = Matrix4.MakeTranslation({ x: 0, y: 0, z: 10 });
    let matWorld = Matrix4.MultiplyMatrix(matRotZ, matRotX);
    matWorld = Matrix4.MultiplyMatrix(matWorld, matTrans);

    const trisToDraw: Tri[] = [];

    //Draw Triangles
    for (const tri of mesh.tris) {
        let triTransformed = Tri.MultiplyMatrix(tri, matWorld);
        const triNormal = Tri.GetNormal(triTransformed);
        // is the triangle visible?
        if (Vec3D.DotProduct(triNormal, Vec3D.Subtract(triTransformed[0], camera).normalized) < 0) {
            trisToDraw.push(triTransformed);
        }
    }

    trisToDraw.sort((a, b) => {
        const z1 = (a[0].z + a[1].z + a[2].z) / 3;
        const z2 = (b[0].z + b[1].z + b[2].z) / 3;
        return z2 - z1;
    });

    for (const tri of trisToDraw) {
        const triNormal = Tri.GetNormal(tri);
        let triProjected = Tri.MultiplyMatrix(tri, projectionMatrix);

        // normalize (frustum) the result of the matrix multiplication
        const [x, y, z] = triProjected.map((p: Vec3D) => 1 / p.w);
        triProjected = Tri.MultiplyVectorAsConst(triProjected, new Vec3D(x, y, z));

        const lit = Vec3D.MultiplyConst(color, Vec3D.DotProduct(light, triNormal));

        Canvas.FillTriangle(triProjected, `rgba(${lit.x}, ${lit.y}, ${lit.z})`);
    }

    Canvas.DrawDebugInfo(trisToDraw.length);

    requestAnimationFrame(() => mainLoop(Date.now() - time));
}