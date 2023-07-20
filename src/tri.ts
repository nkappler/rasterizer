import { Matrix4 } from "./matrix";
import { IVec3D, Vec3D } from "./vector";

export class Tri extends Array {
    0: IVec3D;
    1: IVec3D;
    2: IVec3D;
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

    public static MultiplyVectorAsConst([p1, p2, p3]: Tri, { x, y, z }: IVec3D): Tri {
        return [
            Vec3D.MultiplyConst(p1, x),
            Vec3D.MultiplyConst(p2, y),
            Vec3D.MultiplyConst(p3, z),
        ];
    }

    public static GetNormal([p1, p2, p3]: Tri): IVec3D {
        const a = Vec3D.Subtract(p2, p1);
        const b = Vec3D.Subtract(p3, p2);
        return Vec3D.Normalize(Vec3D.CrossProduct(a, b));
    }

    public static MultiplyMatrix([p1, p2, p3]: Tri, mat: Matrix4): Tri {
        return [
            Matrix4.MultiplyVector(p1, mat),
            Matrix4.MultiplyVector(p2, mat),
            Matrix4.MultiplyVector(p3, mat),
        ];
    }

    /**
     * returns false if the triangle should be clipped entirely
     * 
     * returns clipped triangles otherwise
     */
    public static ClipAgainstPlane(point: IVec3D, normal: IVec3D, tri: Tri,): Tri[] {
        const lit = (tri as any).lit;

        // Return signed shortest distance from point to plane, plane normal must be normalised
        const dist = (p: IVec3D) => Vec3D.DotProduct(normal, p) - Vec3D.DotProduct(normal, point);

        // Create two temporary storage arrays to classify points either side of plane
        // If distance sign is positive, point lies on "inside" of plane
        let inside_points: IVec3D[] = []; let insideCount = 0;
        let outside_points: IVec3D[] = []; let outsideCount = 0;

        // Get signed distance of each point in triangle to plane
        const d0 = dist(tri[0]);
        const d1 = dist(tri[1]);
        const d2 = dist(tri[2]);

        if (d0 >= 0) { inside_points[insideCount++] = tri[0]; }
        else { outside_points[outsideCount++] = tri[0]; }
        if (d1 >= 0) { inside_points[insideCount++] = tri[1]; }
        else { outside_points[outsideCount++] = tri[1]; }
        if (d2 >= 0) { inside_points[insideCount++] = tri[2]; }
        else { outside_points[outsideCount++] = tri[2]; }

        if (insideCount === 0) {
            return [];
        }

        if (insideCount === 3) {
            return [tri];
        }

        if (insideCount === 1) {
            return [
                Object.assign([
                    inside_points[0],
                    Vec3D.IntersectPlane(point, normal, inside_points[0], outside_points[0]),
                    Vec3D.IntersectPlane(point, normal, inside_points[0], outside_points[1])
                ] as Tri, { lit/* : Vec3D.make(255,0,0) */ })
            ]
        }

        if (insideCount === 2) {
            const newPoint = Vec3D.IntersectPlane(point, normal, inside_points[0], outside_points[0])
            return [
                Object.assign([
                    inside_points[0],
                    inside_points[1],
                    newPoint
                ] as Tri, { lit/* : Vec3D.make(0,255,0) */ }),
                Object.assign([
                    inside_points[1],
                    newPoint,
                    Vec3D.IntersectPlane(point, normal, inside_points[1], outside_points[0])
                ] as Tri, { lit/* : Vec3D.make(0,0,255)  */ })
            ];
        }
        return [];
    }

}
