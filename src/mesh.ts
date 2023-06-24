import { Camera } from "./camera";
import { Entity } from "./entity";
import { Tri } from "./tri";
import { IVec3D, Vec3D } from "./vector";

const light: IVec3D = new Vec3D(0.5, 0.5, -1);
const color: IVec3D = { x: 255, y: 255, z: 255 };

export class Mesh extends Entity {
    public normals: IVec3D[];
    public tris: Tri[];
    public colors: Vec3D[];

    public constructor(private rawTris: Tri[]) {
        super();
        this.tris = rawTris;
        this.normals = this.tris.map(Tri.GetNormal);
        this.colors = new Array(rawTris.length);
    }

    public static async LoadFromObjFile(url: string) {
        const text = await (await fetch(url)).text();
        const lines = text.split("\n");
        const verts: Vec3D[] = [];
        const tris: Tri[] = [];
        lines.forEach(line => {
            if (line.startsWith("v")) {
                const [_, x, y, z] = line.split(" ", 4).map(Number);
                verts.push(new Vec3D(x, y, z));
            }
            else if (line.startsWith("f")) {
                const [p1, p2, p3] = line.split(" ", 4).map(Number).filter(i => !isNaN(i)).map(i => verts[i - 1]);
                tris.push([p1, p2, p3]);
            }
        });

        return new Mesh(tris);
    }

    protected update() {
        const worldMat = super.getTransformMatrix()
        this.tris = this.rawTris.map(t => Tri.MultiplyMatrix(t, worldMat));
        this.normals = this.tris.map(Tri.GetNormal);
        this.colors = new Array(this.rawTris.length);
    }

    public projectTris(camera: Camera) {
        const visible = this.tris.map((t, i) => ({ i, d: Vec3D.DotProduct(this.normals[i], Vec3D.Normalize(Vec3D.Subtract(t[0], camera.pos))) }));
        const trisToProject = visible.filter(({ d }) => d < 0);

        const projectedTris = trisToProject.reduce((list, { i: index }) => {
            const tri = this.tris[index];
            const triNormal = this.normals[index];
            // Lighting
            if (!this.colors[index]) {
                const luminance = Math.max(0.1, Vec3D.DotProduct(light, triNormal));
                this.colors[index] = Vec3D.MultiplyConst(color, luminance);
            }
            Object.assign(tri, { lit: this.colors[index] });

            list.push(...camera.project2D(tri));
            return list;
        }, [] as Tri[]);

        projectedTris.sort((a, b) => {
            const z1 = (a[0].z + a[1].z + a[2].z) / 3;
            const z2 = (b[0].z + b[1].z + b[2].z) / 3;
            return z2 - z1;
        });

        performance.mark("clippingStart");

        return projectedTris.reduce((list, tri) => {
            list.push(...camera.frustumClip(tri));
            return list;
        }, [] as Tri[]);
    }

}