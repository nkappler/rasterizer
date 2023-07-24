import { Camera } from "./camera";
import { Texture } from "./canvas";
import { Entity } from "./entity";
import { Tri } from "./tri";
import { IVec3D, Vec } from "./vector";

const light: IVec3D = Vec.Normalize(Vec.make3D(0.5, 0.5, -1));
const color: IVec3D = Vec.make3D(255, 255, 255);

export class Mesh extends Entity {
    public normals: IVec3D[];
    public tris: Tri[];
    public luminances: number[];
    public texture: Texture = null as any;

    public constructor(private rawTris: Tri[]) {
        super();
        this.tris = rawTris;
        this.normals = this.tris.map(Tri.GetNormal);
        this.luminances = new Array(rawTris.length);
    }

    public static async LoadFromObjFile(url: string) {
        const text = await (await fetch(url)).text();
        const lines = text.split("\n");
        const verts: IVec3D[] = [];
        const tris: Tri[] = [];
        lines.forEach(line => {
            if (line.startsWith("v")) {
                const [_, x, y, z] = line.split(" ", 4).map(Number);
                verts.push(Vec.make3D(x, y, z));
            }
            else if (line.startsWith("f")) {
                const [p1, p2, p3] = line.split(" ", 4).map(Number).filter(i => !isNaN(i)).map(i => verts[i - 1]);
                tris.push(new Tri(p1, p2, p3));
            }
        });

        return new Mesh(tris);
    }

    protected update() {
        const worldMat = super.getTransformMatrix()
        this.tris = this.rawTris.map(t => Tri.MultiplyMatrix(t, worldMat));
        this.normals = this.tris.map(Tri.GetNormal);
        this.luminances = new Array(this.rawTris.length);
    }

    public projectTris(camera: Camera) {
        const projectedTris = camera.backFaceCulling(this.tris, this.normals).reduce((list, { i: index }) => {
            const tri = this.tris[index];
            const triNormal = this.normals[index];

            // Lighting
            if (!this.luminances[index]) {
                this.luminances[index] = Math.max(0.1, Vec.DotProduct(light, triNormal));
            }
            tri.l = this.luminances[index];

            list.push(...camera.project2D(tri));
            return list;
        }, [] as Tri[]);

        return projectedTris;
    }

}