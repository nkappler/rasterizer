import { Camera } from "./camera";
import { Vec3D } from "./vector";

export namespace Input {

    const keysPressed: Record<KeyboardEvent["code"], boolean> = {};

    export function setup(camera: Camera) {
        window.addEventListener("keydown", e => {
            keysPressed[e.code] = true;
            e.preventDefault();
        });

        window.addEventListener("keyup", e => {
            keysPressed[e.code] = false;
        });

        window.addEventListener("mousemove", e => {
            if (document.pointerLockElement === null) return;

            camera.rotateY(e.movementX * 0.001);
            camera.rotateX(e.movementY * 0.001);
        });
    }

    export function update(camera: Camera, elapsed: number) {
        const transSpeed = 8 * elapsed;
        const rotSpeed = 2 * elapsed;
        const LookDir = camera.getHorizontalLookDirection();
        const forward = Vec3D.MultiplyConst(LookDir, transSpeed);
        const right = Vec3D.MultiplyConst(Vec3D.CrossProduct(LookDir, new Vec3D(0, 1, 0)), transSpeed);
        const up = Vec3D.MultiplyConst(new Vec3D(0, 1, 0), transSpeed);


        if (keysPressed["KeyA"]) {
            camera.translate(Vec3D.Invert(right));
        }

        if (keysPressed["KeyD"]) {
            camera.translate(right);
        }

        if (keysPressed["KeyQ"]) {
            camera.translate(up);
        }

        if (keysPressed["KeyE"]) {
            camera.translate(Vec3D.Invert(up));
        }

        if (keysPressed["KeyW"]) {
            camera.translate(forward);
        }

        if (keysPressed["KeyS"]) {
            camera.translate(Vec3D.Invert(forward));
        }

        if (keysPressed["ArrowLeft"]) {
            camera.rotateY(-rotSpeed);
        }

        if (keysPressed["ArrowRight"]) {
            camera.rotateY(rotSpeed);
        }

        if (keysPressed["ArrowUp"]) {
            camera.rotateX(-rotSpeed);
        }

        if (keysPressed["ArrowDown"]) {
            camera.rotateX(rotSpeed);
        }

        if (keysPressed["Comma"]) {
            camera.rotateZ(-rotSpeed);
        }

        if (keysPressed["Period"]) {
            camera.rotateZ(rotSpeed);
        }
    }
}