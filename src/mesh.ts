import { Camera } from "./camera";
import { Texture } from "./canvas";
import { Entity } from "./entity";
import { Matrix4 } from "./matrix";
import { Tri } from "./tri";
import { IVec2D, IVec3D, Vec } from "./vector";

const light: IVec3D = Vec.Normalize(Vec.make3D(0.5, 0.5, -1));
const color: IVec3D = Vec.make3D(255, 255, 255);

export class Mesh extends Entity {
    public normals!: IVec3D[];
    public tris!: Tri[];
    public luminances!: number[];
    public texture: Texture = null as any;

    public constructor(private verts: IVec3D[] = [], private uvs: IVec2D[] = [], private triIndizes: number[][] = []) {
        super();
        this.update();
    }

    public static async LoadFromObjFile(url: string) {
        const convertToZeroBasedIndex = (indizes: string[]) => indizes.map(i => Number(i) - 1);

        const verts: IVec3D[] = [];
        const uvs: IVec2D[] = [];
        const text = await (await fetch(url)).text();
        const lines = text.split("\n");
        const tris: number[][] = [];
        lines.forEach(line => {
            if (line.startsWith("v")) {
                if (line.startsWith("vt")) {
                    const [_, u, v] = line.split(" ", 3).map(Number);
                    uvs.push(Vec.make2D(u, v));
                    return;
                }

                const [_, x, y, z] = line.split(" ", 4).map(Number);
                verts.push(Vec.make3D(x, y, z));
            }
            else if (line.startsWith("f")) {
                if (line.includes("/")) {
                    const [_, s1, s2, s3] = line.split(" ", 4);
                    const [p1, t1] = convertToZeroBasedIndex(s1.split("/"));
                    const [p2, t2] = convertToZeroBasedIndex(s2.split("/"));
                    const [p3, t3] = convertToZeroBasedIndex(s3.split("/"));
                    tris.push([p1, p2, p3, t1, t2, t3]);
                    return;
                }

                const [_, p1, p2, p3] = convertToZeroBasedIndex(line.split(" ", 4));
                tris.push([p1, p2, p3]);
            }
        });

        return new Mesh(verts, uvs, tris);
    }

    protected update() {
        const worldMat = super.getTransformMatrix();
        const verts = this.verts.map(v => Matrix4.MultiplyVector(v, worldMat));

        this.tris = this.triIndizes.map(([p1, p2, p3, t1, t2, t3]) => new Tri(verts[p1], verts[p2], verts[p3], this.uvs[t1], this.uvs[t2], this.uvs[t3]));

        this.normals = this.tris.map(Tri.GetNormal);
        this.luminances = new Array(this.tris.length);
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