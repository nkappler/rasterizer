export interface IVec3D {
    x: number;
    y: number;
    z: number;
}

export class Vec3D implements IVec3D {
    public constructor(public x: number = 0, public y: number = 0, public z: number = 0, public w = 1) { }

    public static Add(v1: IVec3D, v2: IVec3D) {
        return new Vec3D(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }
    public static Subtract(v1: IVec3D, v2: IVec3D): IVec3D {
        return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z };
    }

    public static Multiply(v1: IVec3D, v2: IVec3D) {
        return new Vec3D(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
    }

    public static Divide(v1: IVec3D, v2: IVec3D) {
        return new Vec3D(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
    }

    public static AddConst({ x, y, z }: IVec3D, c: number) {
        return new Vec3D(x + c, y + c, z + c);
    }

    public static MultiplyConst({ x, y, z }: IVec3D, c: number) {
        return new Vec3D(x * c, y * c, z * c);
    }

    public get length() {
        return Vec3D.size(this);
    }
    public static size({ x, y, z }: IVec3D) {
        return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    }

    public get normalized() {
        return Vec3D.Normalize(this);
    }
    public static Normalize(v: IVec3D): IVec3D {
        const l = Vec3D.size(v);
        return { x: v.x / l, y: v.y / l, z: v.z / l };
    }

    public get inverted() {
        return Vec3D.Invert(this);
    }
    public static Invert(v: IVec3D) {
        return Vec3D.MultiplyConst(v, -1);
    }

    public static CrossProduct(a: IVec3D, b: IVec3D) {
        return new Vec3D(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        );
    }

    public static DotProduct(a: IVec3D, b: IVec3D) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    public static IntersectPlane(point: IVec3D, normal: IVec3D, lineStart: IVec3D, lineEnd: IVec3D) {
        const planeD = -Vec3D.DotProduct(point, normal);
        const ad = Vec3D.DotProduct(lineStart, normal);
        const bd = Vec3D.DotProduct(lineEnd, normal);
        const t = (-planeD - ad) / (bd - ad);
        const lineStartToEnd = Vec3D.Subtract(lineEnd, lineStart);
        const lineToIntersect = Vec3D.MultiplyConst(lineStartToEnd, t);
        return Vec3D.Add(lineStart, lineToIntersect);
    }

    get r() {
        return this.x;
    }

    get g() {
        return this.y;
    }

    get b() {
        return this.z;
    }

    get a() {
        return this.w;
    }
}