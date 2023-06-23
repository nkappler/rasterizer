import { Entity } from "./entity";
import { Matrix4 } from "./matrix";
import { Tri } from "./tri";
import { Vec3D } from "./vector";

const matInvertY = Matrix4.makeIdentity();
matInvertY[1][1] = -1;

export class Camera extends Entity {
    private projectionMatrix!: Matrix4;
    private viewMatrix!: Matrix4;

    public constructor(
        private AspectRatio: number,
        private fov = 90,
        private nearPlane = 0.1,
        private farPlane = 1.0,
        public pos = new Vec3D(0, 0, 0)
    ) {
        super();
        this.resize();
        this.update();
    }

    public resize() {
        this.projectionMatrix = Matrix4.MakeProjection(this.fov, this.AspectRatio, this.nearPlane, this.farPlane);
    }

    public rotateX(rad: number): void {
        super.rotateX(rad);
        this.rot.x = Math.max(this.rot.x, -Math.PI / 2.1);
        this.rot.x = Math.min(this.rot.x, Math.PI / 2.1);
    }

    public getHorizontalLookDirection() {
        return Matrix4.MultiplyVector(new Vec3D(0,0,1), Matrix4.MakeRotationY(this.rot.y));
    }

    public update() {
        const target = Matrix4.MultiplyVector(new Vec3D(0, 0, 1), this.getTransformMatrix());
        // point camera at target
        const matCamera = Matrix4.PointAt(this.pos, target);
        // inverting the camera matrix yields the view matrix
        this.viewMatrix = Matrix4.QuickInverse(matCamera);
    }

    // returns true if normal is facing towards the camera or backside culling is disabled
    public isFacingTowards(normal: Vec3D, point: Vec3D, backSideCulling = true) {
        return !backSideCulling || Vec3D.DotProduct(normal, Vec3D.Subtract(point, this.pos).normalized) < 0;
    }

    /* Project a Triangle into 2D normalized space, clipping it if it exceeds the near or far plane */
    public project2D(tri: Tri): Tri[] {
        const lit = (tri as any).lit;

        //Convert World Space -> View Space
        const triViewed = Tri.MultiplyMatrix(tri, this.viewMatrix);

        // Clip Viewed Triangle against near plane
        return Tri.ClipAgainstPlane(new Vec3D(0, 0, 0.1), new Vec3D(0, 0, 1), triViewed)
            // Clip Viewed Triangle against far plane
            .reduce((prev, current) => [...prev, ...Tri.ClipAgainstPlane(new Vec3D(0, 0, 100), new Vec3D(0, 0, -1), current)], [] as Tri[])
            .map(clippedTri => {
                // Project from 3D -> 2D
                const triProjected = Tri.MultiplyMatrix(clippedTri, this.projectionMatrix);

                // normalize (frustum) the result of the matrix multiplication
                const [w1, w2, w3] = triProjected.map((p: Vec3D) => 1 / p.w);
                const triFrustum = Tri.MultiplyVectorAsConst(triProjected, new Vec3D(w1, w2, w3));

                // fix invert axis
                const triInverted = Tri.MultiplyMatrix(triFrustum, matInvertY);

                Object.assign(triInverted, { lit });
                return triInverted;
            });
    }

    public frustumClip(tri: Tri): Tri[] {
        const listTriangles: Tri[] = [tri];
        let nNewTriangles = 1;

        for (let p = 0; p < 4; p++) {
            let nTrisToAdd: Tri[] = [];
            nNewTriangles = listTriangles.length;
            while (nNewTriangles > 0) {
                // Take triangle from front of queue
                const test = listTriangles[0];
                listTriangles.shift();
                nNewTriangles--;

                // Clip it against a plane. We only need to test each
                // subsequent plane, against subsequent new triangles
                // as all triangles after a plane clip are guaranteed
                // to lie on the inside of the plane.
                switch (p) {
                    case 0: nTrisToAdd = Tri.ClipAgainstPlane(new Vec3D(0, -1, 0), new Vec3D(0, 1, 0), test); break;
                    case 1: nTrisToAdd = Tri.ClipAgainstPlane(new Vec3D(0, 1, 0), new Vec3D(0, -1, 0), test); break;
                    case 2: nTrisToAdd = Tri.ClipAgainstPlane(new Vec3D(-1, 0, 0), new Vec3D(1, 0, 0), test); break;
                    case 3: nTrisToAdd = Tri.ClipAgainstPlane(new Vec3D(1, 0, 0), new Vec3D(-1, 0, 0), test); break;
                }

                // Clipping may yield a variable number of triangles, so
                // add these new ones to the back of the queue for subsequent
                // clipping against next planes
                listTriangles.push(...nTrisToAdd);
            }
        }
        return listTriangles;
    }

}