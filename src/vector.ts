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

    /** linear interpolation */
    public static lerp(start: IVec3D, end: IVec3D, t: number) {
        return this.make3D(
            start.x * (1-t) + end.x * t,
            start.y * (1-t) + end.y * t,
            start.z * (1-t) + end.z * t,
        );
    }
    /** linear interpolation */
    public static lerp2D(start: IVec2D, end: IVec2D, t: number) {
        // yikes
        return Vec.make2Dfrom3D(Vec.Add(Vec.MultiplyConst(Vec.make3Dfrom2D(start), 1 - t), Vec.MultiplyConst(Vec.make3Dfrom2D(end), t)));
    }

    public static swap(a: IVec3D, b: IVec3D) {
        let tmp;
        tmp = a.x; a.x = b.x; b.x = tmp;
        tmp = a.y; a.y = b.y; b.y = tmp;
        tmp = a.z; a.z = b.z; b.z = tmp;
        tmp = a.w; a.w = b.w; b.w = tmp;
    }

    public static swap2D(a: IVec2D, b: IVec2D) {
        let tmp;
        tmp = a.u; a.u = b.u; b.u = tmp;
        tmp = a.v; a.v = b.v; b.v = tmp;
        tmp = a.w; a.w = b.w; b.w = tmp;
    }

    public static make3Dfrom2D({ u, v, w }: IVec2D) {
        return Vec.make3D(u, v, w);
    }

    public static make2Dfrom3D({ x, y, z }: IVec3D) {
        return Vec.make2D(x, y, z);
    }

}