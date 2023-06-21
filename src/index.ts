if (document.readyState === "complete") {
    setup();
    mainLoop(0);
} else {
    document.addEventListener("readystatechange", () => {
        if (document.readyState === "complete") {
            setup();
            mainLoop(0);
        }
    });
}

let mesh: Mesh = {tris: []};

let ctx: CanvasRenderingContext2D;
let width: number;
let height: number;
const Near = 0.1;
const Far = 1000;
const FOV = 90;
const FOVRad = 1 / Math.tan(FOV * 0.5 / 180 * Math.PI);
let AspectRatio: number;
let projectionMatrix: Mat4x4;

function setup() {
    window.removeEventListener("resize", setup);

    if (mesh.tris.length === 0) {
        LoadMeshFromFile("./src/Spaceship.obj").then(data => mesh = data);
    }

    const canvas = document.querySelector("canvas");
    if (!canvas) throw "canvas not found";
    const _ctx = canvas.getContext("2d");
    if (!_ctx) throw "2D Context could not be created";
    ctx = _ctx;
    width = canvas.getBoundingClientRect().width;
    height = canvas.getBoundingClientRect().height;
    canvas.setAttribute("width", width + "px");
    canvas.setAttribute("height", height + "px");
    AspectRatio = height / width;
    projectionMatrix = [
        [AspectRatio * FOVRad, 0, 0, 0],
        [0, FOVRad, 0, 0],
        [0, 0, Far / (Far - Near), 1],
        [0, 0, (-Far * Near) / (Far - Near), 0]
    ];

    window.addEventListener("resize", setup);

}

function MultiplyVectorMatrix({ x, y, z }: Vec3D, mat: Mat4x4): Vec3D {
    const w = x * mat[0][3] + y * mat[1][3] + z * mat[2][3] + mat[3][3];
    const result: Vec3D = {
        x: x * mat[0][0] + y * mat[1][0] + z * mat[2][0] + mat[3][0],
        y: x * mat[0][1] + y * mat[1][1] + z * mat[2][1] + mat[3][1],
        z: x * mat[0][2] + y * mat[1][2] + z * mat[2][2] + mat[3][2],
    }
    if (w !== 0) {
        result.x /= w;
        result.y /= w;
        result.z /= w;
    }
    return result;
}

function MultiplyTriMatrix([p1, p2, p3]: Tri, mat: Mat4x4): Tri {
    return [
        MultiplyVectorMatrix(p1, mat),
        MultiplyVectorMatrix(p2, mat),
        MultiplyVectorMatrix(p3, mat),
    ];
}

function MultiplyVectorConst({ x, y, z }: Vec3D, c: number): Vec3D {
    return {
        x: x * c,
        y: y * c,
        z: z * c,
    };
}

function MultiplyTriConst([p1, p2, p3]: Tri, c: number): Tri {
    return [
        MultiplyVectorConst(p1, c),
        MultiplyVectorConst(p2, c),
        MultiplyVectorConst(p3, c),
    ];
}

function AddVectorConst({ x, y, z }: Vec3D, c: number): Vec3D {
    return {
        x: x + c,
        y: y + c,
        z: z + c,
    };
}

function AddTriConst([p1, p2, p3]: Tri, c: number): Tri {
    return [
        AddVectorConst(p1, c),
        AddVectorConst(p2, c),
        AddVectorConst(p3, c),
    ];
}

function AddVector({ x, y, z }: Vec3D, vec: Vec3D): Vec3D {
    return {
        x: x + vec.x,
        y: y + vec.y,
        z: z + vec.z,
    };
}

function SubtractVector({ x, y, z }: Vec3D, vec: Vec3D): Vec3D {
    return {
        x: x - vec.x,
        y: y - vec.y,
        z: z - vec.z,
    };
}

function AddTriVector([p1, p2, p3]: Tri, vec: Vec3D): Tri {
    return [
        AddVector(p1, vec),
        AddVector(p2, vec),
        AddVector(p3, vec),
    ];
}



function MultiplyVector({ x, y, z }: Vec3D, vec: Vec3D): Vec3D {
    return {
        x: x * vec.x,
        y: y * vec.y,
        z: z * vec.z,
    };
}

function MultiplyTriVector([p1, p2, p3]: Tri, vec: Vec3D): Tri {
    return [
        MultiplyVector(p1, vec),
        MultiplyVector(p2, vec),
        MultiplyVector(p3, vec),
    ];
}

function Normalize(v: Vec3D): Vec3D {
    const l = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
    return {
        x: v.x / l,
        y: v.y / l,
        z: v.z / l
    };
}

function CrossProduct(a: Vec3D, b: Vec3D): Vec3D {
    const CrossVector = {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
    return Normalize(CrossVector);
}

function GetNormal([p1, p2, p3]: Tri): Vec3D {
    const a = SubtractVector(p2, p1);
    const b = SubtractVector(p3, p2);
    return CrossProduct(a, b);
}

function DotProduct(a: Vec3D, b: Vec3D): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

let Theta = 0;

const camera: Vec3D = { x: 0, y: 0, z: 0 };
const light: Vec3D = { x: 0, y: 0, z: -1 };
const color: Vec3D = { x: 255, y: 255, z: 255 };

function mainLoop(elapsed: number) {
    const time = Date.now();
    console.log(elapsed);
    ctx.fillStyle = "#112244";
    ctx.fillRect(0, 0, width, height);

    Theta += 0.6 * elapsed / 1000;
    const matRotZ: Mat4x4 = [
        [Math.cos(Theta), Math.sin(Theta), 0, 0],
        [-Math.sin(Theta), Math.cos(Theta), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];
    const matRotX: Mat4x4 = [
        [1, 0, 0, 0],
        [0, Math.cos(Theta * 0.5), Math.sin(Theta * 0.5), 0],
        [0, -Math.sin(Theta * 0.5), Math.cos(Theta * 0.5), 0],
        [0, 0, 0, 1],
    ];

    const trisToDraw: Tri[] = [];

    //Draw Triangles
    for (const tri of mesh.tris) {
        let triRotated = MultiplyTriMatrix(tri, matRotZ);
        triRotated = MultiplyTriMatrix(triRotated, matRotX);

        const triTranslated = AddTriVector(triRotated, { x: 0, y: 0, z: 7 });

        const triNormal = GetNormal(triTranslated);
        // is the triangle visible?
        if (DotProduct(triNormal, Normalize(SubtractVector(triTranslated[0], camera))) < 0) { 
            trisToDraw.push(triTranslated);
         }
    }

    trisToDraw.sort((a,b) => {
        const z1 = (a[0].z + a[1].z + a[2].z ) / 3;
        const z2 = (b[0].z + b[1].z + b[2].z ) / 3;
        return z2 - z1;
    });

    for (const tri of trisToDraw) {

        const triNormal = GetNormal(tri);
        let triProjected = MultiplyTriMatrix(tri, projectionMatrix);

        //Scale into view
        triProjected = AddTriConst(triProjected, 1);
        triProjected = MultiplyTriVector(triProjected, { x: 0.5 * width, y: 0.5 * height, z: 1 })

        const lit = MultiplyVectorConst(color, DotProduct(light, triNormal));

        FillTriangle(ctx, triProjected, `rgba(${lit.x}, ${lit.y}, ${lit.z})`);
    }


    requestAnimationFrame(() => mainLoop(Date.now() - time));
}

function DrawTriangle(ctx: CanvasRenderingContext2D, [p1, p2, p3]: Tri, color = "#ffffff", lineWidth = 1) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.closePath();
    ctx.stroke();
}

function FillTriangle(ctx: CanvasRenderingContext2D, tri: Tri, color = "#ffffff", fillStyle?: string, lineWidth = 0) {
    DrawTriangle(ctx, tri, color, lineWidth);
    ctx.fillStyle = fillStyle ?? color;
    ctx.fill();
}

interface Vec3D {
    x: number;
    y: number;
    z: number;
}

type Tri = [Vec3D, Vec3D, Vec3D];

interface Mesh {
    tris: Tri[];
}

type Vec4 = [number, number, number, number];
type Mat4x4 = [Vec4, Vec4, Vec4, Vec4];

async function LoadMeshFromFile(url: string): Promise<Mesh> {
    const text = await (await fetch(url)).text();
    const lines = text.split("\n");
    const verts: Vec3D[] = [];
    const tris: Tri[] = [];
    lines.forEach(line => {
        if (line.startsWith("v")) {
            const [_, x, y, z] = line.split(" ", 4).map(Number);
            verts.push({ x, y, z });
        }
        else if (line.startsWith("f")) {
            const [p1, p2, p3] = line.split(" ", 4).map(Number).filter(i => !isNaN(i)).map(i => verts[i - 1]);
            tris.push([p1, p2, p3]);
        }
    });

    return { tris };
}

// mesh = {
//     tris: [

//         // SOUTH
//         [{ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 0, z: 0 }],
//         [{ x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }],

//         // EAST                                                      
//         [{ x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 }],
//         [{ x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }, { x: 1, y: 0, z: 1 }],

//         // NORTH                                                     
//         [{ x: 1, y: 0, z: 1 }, { x: 1, y: 1, z: 1 }, { x: 0, y: 1, z: 1 }],
//         [{ x: 1, y: 0, z: 1 }, { x: 0, y: 1, z: 1 }, { x: 0, y: 0, z: 1 }],

//         // WEST                                                      
//         [{ x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 1 }, { x: 0, y: 1, z: 0 }],
//         [{ x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 0 }],

//         // TOP                                                       
//         [{ x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }],
//         [{ x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 0 }],

//         // BOTTOM                                                    
//         [{ x: 1, y: 0, z: 1 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 0 }],
//         [{ x: 1, y: 0, z: 1 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }],

//     ]
// };