import { Camera } from "./camera";
import { Entity } from "./entity";
import { Matrix4 } from "./matrix";
import { Tri } from "./tri";
import { IVec3D, Vec3D } from "./vector";

const light: IVec3D = new Vec3D(0.5, 0.5, -1);
const color: IVec3D = { x: 255, y: 255, z: 255 };

export class Mesh extends Entity{
    public normals: Vec3D[];
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
        return this.tris.reduce((list, tri, index) => {
            const triNormal = this.normals[index];
            // is the triangle visible?
            if (camera.isFacingTowards(triNormal, tri[0])) {
                // Lighting
                if (!this.colors[index]) {
                    const luminance = Math.max(0.1, Vec3D.DotProduct(light, triNormal));
                    this.colors[index] = Vec3D.MultiplyConst(color, luminance);
                }
                Object.assign(tri, { lit: this.colors[index] });

                list.push(...camera.project2D(tri));
            }
            return list;
        },[] as Tri[]);
    }

}