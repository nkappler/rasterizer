import { Entity } from "./entity";
import { Matrix4 } from "./matrix";
import { Tri } from "./tri";
import { IVec3D, Vec } from "./vector";

const upP = Vec.make3D(0, 1, 0), upN = Vec.make3D(0, -1, 0);
const downP = Vec.make3D(0, -1, 0), downN = Vec.make3D(0, 1, 0);
const leftP = Vec.make3D(-1, 0, 0), leftN = Vec.make3D(1, 0, 0);
const rightP = Vec.make3D(1, 0, 0), rightN = Vec.make3D(-1, 0, 0);

export class Camera extends Entity {
    private projectionMatrix!: Matrix4;
    private viewMatrix!: Matrix4;
    private readonly nearPoint: IVec3D;
    private readonly nearNormal = Vec.make3D(0, 0, 1);
    private readonly farPoint: IVec3D;
    private readonly farNormal = Vec.make3D(0, 0, -1);

    public constructor(
        private AspectRatio: number,
        private fov = 90,
        public pos = Vec.make3D(0, 0, 0),
        public rot = Vec.make3D(0, 0, 0),
        clipNear = 0.1,
        clipFar = 1000
    ) {
        super(pos, rot);
        this.nearPoint = Vec.make3D(0, 0, clipNear);
        this.farPoint = Vec.make3D(0, 0, clipFar);
        this.resize();
        this.update();
    }

    public resize() {
        this.projectionMatrix = Matrix4.MakeProjection(this.fov, this.AspectRatio, this.nearPoint.z, this.farPoint.z);
    }

    public rotateX(rad: number): void {
        super.rotateX(rad);
        this.rot.x = Math.max(this.rot.x, -Math.PI / 2.1);
        this.rot.x = Math.min(this.rot.x, Math.PI / 2.1);
    }

    public getHorizontalLookDirection() {
        return Matrix4.MultiplyVector(this.nearNormal, Matrix4.MakeRotationY(this.rot.y));
    }

    public update() {
        const target = Matrix4.MultiplyVector(this.nearNormal, this.getTransformMatrix());
        // const up = Matrix4.MultiplyVector(Vec3D.make(1,0,0), this.getTransformMatrix());
        // point camera at target
        const matCamera = Matrix4.PointAt(this.pos, target);
        // inverting the camera matrix yields the view matrix
        this.viewMatrix = Matrix4.QuickInverse(matCamera);
    }

    public backFaceCulling(tris: Tri[], normals: IVec3D[]) {
        const visible = tris.map((t, i) => ({ i, d: Vec.DotProduct(normals[i], Vec.Normalize(Vec.Subtract(t.p[0], this.pos))) }));
        return visible.filter(({ d }) => d < 0);
    }

    /* Project a Triangle into 2D normalized space, clipping it if it exceeds the near or far plane */
    public project2D(tri: Tri,): Tri[] {

        //Convert World Space -> View Space
        const triViewed = Tri.MultiplyMatrix(tri, this.viewMatrix);

        // Clip Viewed Triangle against near plane
        return Tri.ClipAgainstPlane(this.nearPoint, this.nearNormal, triViewed)
            // Clip Viewed Triangle against far plane
            .reduce((prev, current) => [...prev, ...Tri.ClipAgainstPlane(this.farPoint, this.farNormal, current)], [] as Tri[])
            .map(clippedTri => {
                // Project from 3D -> 2D
                const triProjected = Tri.MultiplyMatrix(clippedTri, this.projectionMatrix);

                // normalize (frustum) the result of the matrix multiplication
                let [w1, w2, w3] = triProjected.p.map((p: IVec3D) => p.w);

                let triFrustum = Tri.MultiplyVectorAsCons2D(triProjected, Vec.make3D(1 / w1, 1 / w2, 1 / w3));

                triFrustum.t[0].w = 1 / w1;
                triFrustum.t[1].w = 1 / w2;
                triFrustum.t[2].w = 1 / w3;

                triFrustum = Tri.MultiplyVectorAsConst(triFrustum, Vec.make3D(1 / w1, 1 / w2, 1 / w3));

                // fix invert axis
                triFrustum.p[0].y *= -1;
                triFrustum.p[1].y *= -1;
                triFrustum.p[2].y *= -1;
                triFrustum.p[0].x *= -1;
                triFrustum.p[1].x *= -1;
                triFrustum.p[2].x *= -1;

                return triFrustum;
            });
    }

    public frustumClip(tri: Tri): Tri[] {
        return Tri.ClipAgainstPlane(upP, upN, tri)
            .reduce((list, test) => [...list, ...Tri.ClipAgainstPlane(downP, downN, test)], [] as Tri[])
            .reduce((list, test) => [...list, ...Tri.ClipAgainstPlane(leftP, leftN, test)], [] as Tri[])
            .reduce((list, test) => [...list, ...Tri.ClipAgainstPlane(rightP, rightN, test)], [] as Tri[])
    }

}