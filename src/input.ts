import { Camera } from "./camera";
import { Vec } from "./vector";

export namespace Input {
    let camera: Camera
    const keysPressed: Record<KeyboardEvent["code"], boolean> = {};

    const mousemove = (e: MouseEvent) => {
        if (document.pointerLockElement === null) return;

        camera.rotateY(-e.movementX * 0.001);
        camera.rotateX(e.movementY * 0.001);
    };
    const click = (e: MouseEvent) => (e.target as HTMLCanvasElement).requestPointerLock();
    const keydown = (e: KeyboardEvent) => {
        keysPressed[e.code] = true;
        e.preventDefault();
    }
    const keyup = (e: KeyboardEvent) => keysPressed[e.code] = false;

    export function setup(_camera: Camera) {
        camera = _camera;

        document.querySelector("canvas")?.removeEventListener("click", click);
        document.querySelector("canvas")?.addEventListener("click", click);

        window.removeEventListener("keydown", keydown);
        window.addEventListener("keydown", keydown);

        window.removeEventListener("keyup", keyup);
        window.addEventListener("keyup", keyup);

        window.removeEventListener("mousemove", mousemove);
        window.addEventListener("mousemove", mousemove);
    }

    export function update(camera: Camera, elapsed: number) {
        const transSpeed = 8 * elapsed;
        const rotSpeed = 2 * elapsed;
        const LookDir = camera.getHorizontalLookDirection();
        const forward = Vec.MultiplyConst(LookDir, transSpeed);
        const right = Vec.MultiplyConst(Vec.CrossProduct(LookDir, Vec.make3D(0, -1, 0)), transSpeed);
        const up = Vec.MultiplyConst(Vec.make3D(0, 1, 0), transSpeed);


        if (keysPressed["KeyA"]) {
            camera.translate(Vec.Invert(right));
        }

        if (keysPressed["KeyD"]) {
            camera.translate(right);
        }

        if (keysPressed["KeyQ"]) {
            camera.translate(up);
        }

        if (keysPressed["KeyE"]) {
            camera.translate(Vec.Invert(up));
        }

        if (keysPressed["KeyW"]) {
            camera.translate(forward);
        }

        if (keysPressed["KeyS"]) {
            camera.translate(Vec.Invert(forward));
        }

        if (keysPressed["ArrowLeft"]) {
            camera.rotateY(rotSpeed);
        }

        if (keysPressed["ArrowRight"]) {
            camera.rotateY(-rotSpeed);
        }

        if (keysPressed["ArrowUp"]) {
            camera.rotateX(-rotSpeed);
        }

        if (keysPressed["ArrowDown"]) {
            camera.rotateX(rotSpeed);
        }

        if (keysPressed["Comma"]) {
            camera.rotateZ(rotSpeed);
        }

        if (keysPressed["Period"]) {
            camera.rotateZ(-rotSpeed);
        }
    }
}