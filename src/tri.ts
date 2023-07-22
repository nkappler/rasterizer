import { Matrix4 } from "./matrix";
import { IVec2D, IVec3D, Vec } from "./vector";

export class Tri {
    public p: [IVec3D, IVec3D, IVec3D];
    public t: [IVec2D, IVec2D, IVec2D];
    public l: number;

    public constructor(
        p1 = Vec.make3D(), p2 = Vec.make3D(), p3 = Vec.make3D(),
        t1 = Vec.make2D(), t2 = Vec.make2D(), t3 = Vec.make2D(),
        l = 1
    ) {
        this.p = [p1, p2, p3];
        this.t = [t1, t2, t3];
        this.l = l;
    }

    public static AddVector({ p: [p1, p2, p3], t, l }: Tri, vec: IVec3D): Tri {
        return new Tri(
            Vec.Add(p1, vec),
            Vec.Add(p2, vec),
            Vec.Add(p3, vec),
            ...t,
            l

        );
    }

    public static AddConst({ p: [p1, p2, p3], t, l }: Tri, c: number): Tri {
        return new Tri(
            Vec.AddConst(p1, c),
            Vec.AddConst(p2, c),
            Vec.AddConst(p3, c),
            ...t,
            l
        );
    }

    public static MultiplyVector({ p: [p1, p2, p3], t, l }: Tri, vec: IVec3D): Tri {
        return new Tri(
            Vec.Multiply(p1, vec),
            Vec.Multiply(p2, vec),
            Vec.Multiply(p3, vec),
            ...t,
            l
        );
    }

    public static MultiplyConst({ p: [p1, p2, p3], t, l }: Tri, c: number): Tri {
        return new Tri(
            Vec.MultiplyConst(p1, c),
            Vec.MultiplyConst(p2, c),
            Vec.MultiplyConst(p3, c),
            ...t,
            l
        );
    }

    public static MultiplyVectorAsConst({ p: [p1, p2, p3], t, l }: Tri, { x, y, z }: IVec3D): Tri {
        return new Tri(
            Vec.MultiplyConst(p1, x),
            Vec.MultiplyConst(p2, y),
            Vec.MultiplyConst(p3, z),
            ...t,
            l
        );
    }

    public static MultiplyVectorAsCons2D({ p, t: [t1, t2, t3], l }: Tri, { x, y, z }: IVec3D): Tri {
        return new Tri(
            ...p,
            Vec.MultiplyConst2D(t1, x),
            Vec.MultiplyConst2D(t2, y),
            Vec.MultiplyConst2D(t3, z),
            l
        );
    }

    public static GetNormal({ p: [p1, p2, p3] }: Tri): IVec3D {
        const a = Vec.Subtract(p2, p1);
        const b = Vec.Subtract(p3, p2);
        return Vec.Normalize(Vec.CrossProduct(a, b));
    }

    public static MultiplyMatrix({ p: [p1, p2, p3], t, l }: Tri, mat: Matrix4): Tri {
        return new Tri(
            Matrix4.MultiplyVector(p1, mat),
            Matrix4.MultiplyVector(p2, mat),
            Matrix4.MultiplyVector(p3, mat),
            ...t,
            l
        );
    }

    /**
     * returns false if the triangle should be clipped entirely
     * 
     * returns clipped triangles otherwise
     */
    public static ClipAgainstPlane(point: IVec3D, normal: IVec3D, tri: Tri,): Tri[] {

        // Return signed shortest distance from point to plane, plane normal must be normalised
        const dist = (p: IVec3D) => Vec.DotProduct(normal, p) - Vec.DotProduct(normal, point);

        // Create two temporary storage arrays to classify points either side of plane
        // If distance sign is positive, point lies on "inside" of plane
        let inside_points: IVec3D[] = new Array(3); let insideCount = 0;
        let outside_points: IVec3D[] = new Array(3); let outsideCount = 0;
        let inside_tex: IVec2D[] = new Array(3); let insideTexCount = 0;
        let outside_tex: IVec2D[] = new Array(3); let outsideTexCount = 0;


        // Get signed distance of each point in triangle to plane
        const d0 = dist(tri.p[0]);
        const d1 = dist(tri.p[1]);
        const d2 = dist(tri.p[2]);

        if (d0 >= 0) { inside_points[insideCount++] = tri.p[0]; inside_tex[insideTexCount++] = tri.t[0] }
        else { outside_points[outsideCount++] = tri.p[0]; outside_tex[outsideTexCount++] = tri.t[0] }
        if (d1 >= 0) { inside_points[insideCount++] = tri.p[1]; inside_tex[insideTexCount++] = tri.t[1] }
        else { outside_points[outsideCount++] = tri.p[1]; outside_tex[outsideTexCount++] = tri.t[1] }
        if (d2 >= 0) { inside_points[insideCount++] = tri.p[2]; inside_tex[insideTexCount++] = tri.t[2] }
        else { outside_points[outsideCount++] = tri.p[2]; outside_tex[outsideTexCount++] = tri.t[2] }

        if (insideCount === 0) {
            return [];
        }

        if (insideCount === 3) {
            return [tri];
        }

        if (insideCount === 1) {
            let t = 0;
            const i1 = Vec.IntersectPlane(point, normal, inside_points[0], outside_points[0]), p1 = i1.v;
            t = i1.t;
            const t1: IVec2D = {
                u: t * (outside_tex[0].u - inside_tex[0].u) + inside_tex[0].u,
                v: t * (outside_tex[0].v - inside_tex[0].v) + inside_tex[0].v,
                w: t * (outside_tex[0].w - inside_tex[0].w) + inside_tex[0].w
            };

            const i2 = Vec.IntersectPlane(point, normal, inside_points[0], outside_points[1]), p2 = i2.v;
            t = i2.t;
            const t2: IVec2D = {
                u: t * (outside_tex[1].u - inside_tex[0].u) + inside_tex[0].u,
                v: t * (outside_tex[1].v - inside_tex[0].v) + inside_tex[0].v,
                w: t * (outside_tex[1].w - inside_tex[0].w) + inside_tex[0].w,
            };

            return [new Tri(
                inside_points[0], p1, p2,
                inside_tex[0], t1, t2,
                tri.l
            )];
        }

        if (insideCount === 2) {
            let t = 0;
            const i1 = Vec.IntersectPlane(point, normal, inside_points[0], outside_points[0]), p1 = i1.v;
            t = i1.t;
            const t1: IVec2D = {
                u: t * (outside_tex[0].u - inside_tex[0].u) + inside_tex[0].u,
                v: t * (outside_tex[0].v - inside_tex[0].v) + inside_tex[0].v,
                w: t * (outside_tex[0].w - inside_tex[0].w) + inside_tex[0].w,
            };

            const i2 = Vec.IntersectPlane(point, normal, inside_points[1], outside_points[0]), p2 = i2.v;
            t = i2.t
            const t2: IVec2D = {
                u: t * (outside_tex[0].u - inside_tex[1].u) + inside_tex[1].u,
                v: t * (outside_tex[0].v - inside_tex[1].v) + inside_tex[1].v,
                w: t * (outside_tex[0].w - inside_tex[1].w) + inside_tex[1].w,
            };

            return [
                new Tri(
                    inside_points[0], inside_points[1], p1,
                    inside_tex[0], inside_tex[1], t1,
                    tri.l
                ),
                new Tri(
                    inside_points[1], p1, p2,
                    inside_tex[1], t1, t2,
                    tri.l
                )
            ];
        }
        return [];
    }

}
