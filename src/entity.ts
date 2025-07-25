import { Matrix4 } from "./matrix";
import { IVec3D, Vec } from "./vector";

export abstract class Entity {

    public constructor(protected pos = Vec.make3D(), protected rot = Vec.make3D()) { }

    public translate(vec: IVec3D) {
        this.pos = Vec.Add(this.pos, vec);
        this.update();
    }

    public rotateX(rad: number) {
        this.rot.x = this.rot.x + rad % Math.PI;
        this.update();
    }

    public rotateY(rad: number) {
        this.rot.y = this.rot.y + rad % Math.PI;
        this.update();
    }

    public rotateZ(rad: number) {
        this.rot.z = this.rot.z + rad % Math.PI;
        this.update();
    }

    public getTransformMatrix() {
        const matRotX = Matrix4.MakeRotationX(this.rot.x);
        const matRotY = Matrix4.MakeRotationY(this.rot.y);
        const matRotZ = Matrix4.MakeRotationZ(this.rot.z);
        const matTrans = Matrix4.MakeTranslation(this.pos);
        return Matrix4.MultiplyMatrix(
            Matrix4.MultiplyMatrix(matRotZ, matRotX),
            Matrix4.MultiplyMatrix(matRotY, matTrans)
        );
    }

    protected abstract update(): void;
}