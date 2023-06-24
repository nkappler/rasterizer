import { IVec3D, Vec3D } from "./vector";

class Vec4 extends Array {
    0: number;
    1: number;
    2: number;
    3: number;
    public length = 4 as const;
}

export class Matrix4 extends Array {
    0: Vec4;
    1: Vec4;
    2: Vec4;
    3: Vec4;
    public length = 4 as const;

    public static MultiplyVector({ x, y, z, w }: Vec3D, mat: Matrix4): Vec3D {
        return new Vec3D(
            x * mat[0][0] + y * mat[1][0] + z * mat[2][0] + w * mat[3][0],
            x * mat[0][1] + y * mat[1][1] + z * mat[2][1] + w * mat[3][1],
            x * mat[0][2] + y * mat[1][2] + z * mat[2][2] + w * mat[3][2],
            x * mat[0][3] + y * mat[1][3] + z * mat[2][3] + w * mat[3][3],
        );
    }

    public static makeIdentity(): Matrix4 {
        return [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }

    public static MakeRotationX(angleRad: number) {
        const matrix = this.makeIdentity();
        matrix[1][1] = Math.cos(angleRad);
        matrix[1][2] = Math.sin(angleRad);
        matrix[2][1] = -Math.sin(angleRad);
        matrix[2][2] = Math.cos(angleRad);
        return matrix;
    }

    public static MakeRotationY(angleRad: number) {
        const matrix = this.makeIdentity();
        matrix[0][0] = Math.cos(angleRad);
        matrix[0][2] = Math.sin(angleRad);
        matrix[2][0] = -Math.sin(angleRad);
        matrix[2][2] = Math.cos(angleRad);
        return matrix;
    }

    public static MakeRotationZ(angleRad: number) {
        const matrix = this.makeIdentity();
        matrix[0][0] = Math.cos(angleRad);
        matrix[0][1] = Math.sin(angleRad);
        matrix[1][0] = -Math.sin(angleRad);
        matrix[1][1] = Math.cos(angleRad);
        return matrix;
    }

    public static MakeTranslation({ x, y, z }: IVec3D) {
        const matrix = this.makeIdentity();
        matrix[3][0] = x;
        matrix[3][1] = y;
        matrix[3][2] = z;
        return matrix;
    }

    public static MakeProjection(FovDegrees: number, AspectRatio: number, Near: number, Far: number): Matrix4 {
        const FOVRad = 1 / Math.tan(FovDegrees * 0.5 / 180 * Math.PI);
        return [
            [AspectRatio * FOVRad, 0, 0, 0],
            [0, FOVRad, 0, 0],
            [0, 0, Far / (Far - Near), 1],
            [0, 0, (-Far * Near) / (Far - Near), 0]
        ];
    }

    public static MultiplyMatrix(m1: Matrix4, m2: Matrix4) {
        let matrix: Matrix4 = this.makeIdentity();
        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
                matrix[r][c] =
                    m1[r][0] * m2[0][c] +
                    m1[r][1] * m2[1][c] +
                    m1[r][2] * m2[2][c] +
                    m1[r][3] * m2[3][c];
            }
        }
        return matrix;
    }

    public static PointAt(pos: IVec3D, target: IVec3D, _up: IVec3D = new Vec3D(0, 1, 0)): Matrix4 {
        const forward = Vec3D.Normalize(Vec3D.Subtract(target, pos));
        // consider pitch
        const a = Vec3D.MultiplyConst(forward, Vec3D.DotProduct(_up, forward));
        const up = Vec3D.Normalize(Vec3D.Subtract(_up, a));
        const right = Vec3D.CrossProduct(forward, up);

        return [
            [right.x, right.y, right.z, 0],
            [up.x, up.y, up.z, 0],
            [forward.x, forward.y, forward.z, 0],
            [pos.x, pos.y, pos.z, 1]
        ];
    }

    /** only for rotation/translation matrices */
    public static QuickInverse(m: Matrix4): Matrix4 {
        const A = new Vec3D(...m[0]);
        const B = new Vec3D(...m[1]);
        const C = new Vec3D(...m[2]);
        const T = new Vec3D(...m[3]);
        return [
            [A.x, B.x, C.x, 0],
            [A.y, B.y, C.y, 0],
            [A.z, B.z, C.z, 0],
            [-Vec3D.DotProduct(T, A), -Vec3D.DotProduct(T, B), -Vec3D.DotProduct(T, C), 1]
        ];
    }
}