import { Matrix4 } from "./matrix";
import { IVec3D, Vec3D } from "./vector";

export class Tri extends Array {
    0: Vec3D;
    1: Vec3D;
    2: Vec3D;
    public length = 3 as const;

    public static AddVector([p1, p2, p3]: Tri, vec: IVec3D): Tri {
        return [
            Vec3D.Add(p1, vec),
            Vec3D.Add(p2, vec),
            Vec3D.Add(p3, vec),
        ];
    }

    public static AddConst([p1, p2, p3]: Tri, c: number): Tri {
        return [
            Vec3D.AddConst(p1, c),
            Vec3D.AddConst(p2, c),
            Vec3D.AddConst(p3, c),
        ];
    }

    public static MultiplyVector([p1, p2, p3]: Tri, vec: IVec3D): Tri {
        return [
            Vec3D.Multiply(p1, vec),
            Vec3D.Multiply(p2, vec),
            Vec3D.Multiply(p3, vec),
        ];
    }

    public static MultiplyConst([p1, p2, p3]: Tri, c: number): Tri {
        return [
            Vec3D.MultiplyConst(p1, c),
            Vec3D.MultiplyConst(p2, c),
            Vec3D.MultiplyConst(p3, c),
        ];
    }

    public static MultiplyVectorAsConst([p1, p2, p3]: Tri, {x,y,z}: IVec3D): Tri {
        return [
            Vec3D.MultiplyConst(p1, x),
            Vec3D.MultiplyConst(p2, y),
            Vec3D.MultiplyConst(p3, z),
        ];
    }

    public static GetNormal([p1, p2, p3]: Tri): IVec3D {
        const a = Vec3D.Subtract(p2, p1);
        const b = Vec3D.Subtract(p3, p2);
        return Vec3D.CrossProduct(a, b);
    }

    public static MultiplyMatrix([p1, p2, p3]: Tri, mat: Matrix4): Tri {
        return [
            Matrix4.MultiplyVector(p1, mat),
            Matrix4.MultiplyVector(p2, mat),
            Matrix4.MultiplyVector(p3, mat),
        ];
    }
}