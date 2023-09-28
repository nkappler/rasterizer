import { Camera } from "./camera";
import { RenderPipeline } from "./pipeline";
import { Vec } from "./vector";

export namespace Input {
    let camera: Camera;
    let pipeline: RenderPipeline;
    const keyDown: Record<KeyboardEvent["code"], boolean> = {};
    let keyPressed: Record<KeyboardEvent["code"], boolean> = {};

    const mousemove = (e: MouseEvent) => {
        if (document.pointerLockElement === null) return;

        camera.rotateY(-e.movementX * 0.001);
        camera.rotateX(e.movementY * 0.001);
    };
    const click = (e: MouseEvent) => (e.target as HTMLCanvasElement).requestPointerLock();
    const keydown = (e: KeyboardEvent) => {
        keyDown[e.code] = true;
        keyPressed[e.code] = true;
        e.preventDefault();
    }
    const keyup = (e: KeyboardEvent) => keyDown[e.code] = false;

    export function setup(_camera: Camera, _pipeline: RenderPipeline) {
        camera = _camera;
        pipeline = _pipeline;

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

        if (keyDown["KeyA"]) {
            camera.translate(Vec.Invert(right));
        }

        if (keyDown["KeyD"]) {
            camera.translate(right);
        }

        if (keyDown["KeyQ"]) {
            camera.translate(up);
        }

        if (keyDown["KeyE"]) {
            camera.translate(Vec.Invert(up));
        }

        if (keyDown["KeyW"]) {
            camera.translate(forward);
        }

        if (keyDown["KeyS"]) {
            camera.translate(Vec.Invert(forward));
        }

        if (keyDown["ArrowLeft"]) {
            camera.rotateY(rotSpeed);
        }

        if (keyDown["ArrowRight"]) {
            camera.rotateY(-rotSpeed);
        }

        if (keyDown["ArrowUp"]) {
            camera.rotateX(-rotSpeed);
        }

        if (keyDown["ArrowDown"]) {
            camera.rotateX(rotSpeed);
        }

        if (keyDown["Comma"]) {
            camera.rotateZ(rotSpeed);
        }

        if (keyDown["Period"]) {
            camera.rotateZ(-rotSpeed);
        }

        if (keyPressed["KeyX"]) {
            pipeline.toggleWireFrame();
        }

        if (keyPressed["KeyT"]) {
            pipeline.toggleTexture();
        }

        if (keyPressed["KeyB"]) {
            pipeline.toggleCulling();
        }

        if (keyPressed["KeyL"]) {
            pipeline.toggleShading();
        }

        keyPressed = {};
    }
}