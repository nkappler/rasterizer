import { Tri } from "./tri";
import { Vec3D } from "./vector";

export class Mesh {
    public constructor(public tris: Tri[]) {}

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
}