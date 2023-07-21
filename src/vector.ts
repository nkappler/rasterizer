export interface IVec3D {
    x: number;
    y: number;
    z: number;
    w: number;
}

export interface IVec2D {
    u: number;
    v: number;
    w: number;
}

export abstract class Vec {

    public static make3D(x = 0, y = 0, z = 0, w = 1): IVec3D {
        return { x, y, z, w };
    }

    public static make2D(u = 0, v = 0, w = 1): IVec2D {
        return { u, v, w };
    }

    public static Add(v1: IVec3D, v2: IVec3D) {
        return this.make3D(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }
    public static Subtract(v1: IVec3D, v2: IVec3D): IVec3D {
        return this.make3D(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }

    public static Multiply(v1: IVec3D, v2: IVec3D) {
        return this.make3D(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
    }

    public static Divide(v1: IVec3D, v2: IVec3D) {
        return this.make3D(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
    }

    public static AddConst({ x, y, z }: IVec3D, c: number) {
        return this.make3D(x + c, y + c, z + c);
    }

    public static MultiplyConst({ x, y, z }: IVec3D, c: number) {
        return this.make3D(x * c, y * c, z * c);
    }

    public static MultiplyConst2D({ u, v }: IVec2D, c: number) {
        return this.make2D(u * c, v * c);
    }

    public static size({ x, y, z }: IVec3D) {
        return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    }

    public static Normalize(v: IVec3D): IVec3D {
        const l = Vec.size(v);
        return this.make3D(v.x / l, v.y / l, v.z / l);
    }

    public static Invert(v: IVec3D) {
        return Vec.MultiplyConst(v, -1);
    }

    public static CrossProduct(a: IVec3D, b: IVec3D) {
        return this.make3D(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        );
    }

    public static DotProduct(a: IVec3D, b: IVec3D) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    public static IntersectPlane(point: IVec3D, normal: IVec3D, lineStart: IVec3D, lineEnd: IVec3D) {
        const planeD = -Vec.DotProduct(point, normal);
        const ad = Vec.DotProduct(lineStart, normal);
        const bd = Vec.DotProduct(lineEnd, normal);
        const t = (-planeD - ad) / (bd - ad);
        const lineStartToEnd = Vec.Subtract(lineEnd, lineStart);
        const lineToIntersect = Vec.MultiplyConst(lineStartToEnd, t);
        return { v: Vec.Add(lineStart, lineToIntersect), t };
    }

}