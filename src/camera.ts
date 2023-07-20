import { Entity } from "./entity";
import { Matrix4 } from "./matrix";
import { Tri } from "./tri";
import { Vec3D, IVec3D } from "./vector";

const matInvertY = Matrix4.makeIdentity();
matInvertY[1][1] = -1;
const upP = Vec3D.make(0, 1, 0), upN = Vec3D.make(0, -1, 0);
const downP = Vec3D.make(0, -1, 0), downN = Vec3D.make(0, 1, 0);
const leftP = Vec3D.make(-1, 0, 0), leftN = Vec3D.make(1, 0, 0);
const rightP = Vec3D.make(1, 0, 0), rightN = Vec3D.make(-1, 0, 0);

export class Camera extends Entity {
    private projectionMatrix!: Matrix4;
    private viewMatrix!: Matrix4;
    private readonly nearPoint: IVec3D;
    private readonly nearNormal = Vec3D.make(0, 0, 1);
    private readonly farPoint: IVec3D;
    private readonly farNormal = Vec3D.make(0, 0, -1);

    public constructor(
        private AspectRatio: number,
        private fov = 90,
        public pos = Vec3D.make(0, 0, 0),
        clipNear = 0.1,
        clipFar = 1000
    ) {
        super();
        this.nearPoint = Vec3D.make(0, 0, clipNear);
        this.farPoint = Vec3D.make(0, 0, clipFar);
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

    /* Project a Triangle into 2D normalized space, clipping it if it exceeds the near or far plane */
    public project2D(tri: Tri,): Tri[] {
        const lit = (tri as any).lit;

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
                const [w1, w2, w3] = triProjected.p.map((p: IVec3D) => 1 / p.w);
                const triFrustum = Tri.MultiplyVectorAsConst(triProjected, Vec3D.make(w1, w2, w3));

                // fix invert axis
                // const triInverted = Tri.MultiplyMatrix(triFrustum, matInvertY);
                triFrustum.p[0].y *= -1;
                triFrustum.p[1].y *= -1;
                triFrustum.p[2].y *= -1;

                Object.assign(triFrustum, { lit });
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