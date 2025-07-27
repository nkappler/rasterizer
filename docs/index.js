var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define("vector", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Vec = void 0;
    class Vec {
        static make3D(x = 0, y = 0, z = 0, w = 1) {
            return { x, y, z, w };
        }
        static make2D(u = 0, v = 0, w = 1) {
            return { u, v, w };
        }
        static Add(v1, v2) {
            return this.make3D(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
        }
        static Subtract(v1, v2) {
            return this.make3D(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
        }
        static Multiply(v1, v2) {
            return this.make3D(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
        }
        static Divide(v1, v2) {
            return this.make3D(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
        }
        static AddConst({ x, y, z }, c) {
            return this.make3D(x + c, y + c, z + c);
        }
        static MultiplyConst({ x, y, z }, c) {
            return this.make3D(x * c, y * c, z * c);
        }
        static MultiplyConst2D({ u, v }, c) {
            return this.make2D(u * c, v * c);
        }
        static size({ x, y, z }) {
            return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
        }
        static Normalize(v) {
            const l = Vec.size(v);
            return this.make3D(v.x / l, v.y / l, v.z / l);
        }
        static Invert(v) {
            return Vec.MultiplyConst(v, -1);
        }
        static CrossProduct(a, b) {
            return this.make3D(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
        }
        static DotProduct(a, b) {
            return a.x * b.x + a.y * b.y + a.z * b.z;
        }
        static IntersectPlane(point, normal, lineStart, lineEnd) {
            const planeD = -Vec.DotProduct(point, normal);
            const ad = Vec.DotProduct(lineStart, normal);
            const bd = Vec.DotProduct(lineEnd, normal);
            const t = (-planeD - ad) / (bd - ad);
            const lineStartToEnd = Vec.Subtract(lineEnd, lineStart);
            const lineToIntersect = Vec.MultiplyConst(lineStartToEnd, t);
            return { v: Vec.Add(lineStart, lineToIntersect), t };
        }
        /** linear interpolation */
        static lerp(start, end, t, out = Vec.make3D()) {
            out.x = start.x * (1 - t) + end.x * t;
            out.y = start.y * (1 - t) + end.y * t;
            out.z = start.z * (1 - t) + end.z * t;
            return out;
        }
        /** linear interpolation */
        static lerp2D(start, end, t) {
            // yikes
            return Vec.make2Dfrom3D(Vec.Add(Vec.MultiplyConst(Vec.make3Dfrom2D(start), 1 - t), Vec.MultiplyConst(Vec.make3Dfrom2D(end), t)));
        }
        static swap(a, b) {
            let tmp;
            tmp = a.x;
            a.x = b.x;
            b.x = tmp;
            tmp = a.y;
            a.y = b.y;
            b.y = tmp;
            tmp = a.z;
            a.z = b.z;
            b.z = tmp;
            tmp = a.w;
            a.w = b.w;
            b.w = tmp;
        }
        static swap2D(a, b) {
            let tmp;
            tmp = a.u;
            a.u = b.u;
            b.u = tmp;
            tmp = a.v;
            a.v = b.v;
            b.v = tmp;
            tmp = a.w;
            a.w = b.w;
            b.w = tmp;
        }
        static make3Dfrom2D({ u, v, w }) {
            return Vec.make3D(u, v, w);
        }
        static make2Dfrom3D({ x, y, z }) {
            return Vec.make2D(x, y, z);
        }
    }
    exports.Vec = Vec;
});
define("matrix", ["require", "exports", "vector"], function (require, exports, vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Matrix4 = void 0;
    class Vec4 extends Array {
        constructor() {
            super(...arguments);
            this.length = 4;
        }
    }
    class Matrix4 extends Array {
        constructor() {
            super(...arguments);
            this.length = 4;
        }
        static MultiplyVector({ x, y, z, w }, mat) {
            return vector_1.Vec.make3D(x * mat[0][0] + y * mat[1][0] + z * mat[2][0] + w * mat[3][0], x * mat[0][1] + y * mat[1][1] + z * mat[2][1] + w * mat[3][1], x * mat[0][2] + y * mat[1][2] + z * mat[2][2] + w * mat[3][2], x * mat[0][3] + y * mat[1][3] + z * mat[2][3] + w * mat[3][3]);
        }
        static makeIdentity() {
            return [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ];
        }
        static MakeRotationX(angleRad) {
            const matrix = this.makeIdentity();
            matrix[1][1] = Math.cos(angleRad);
            matrix[1][2] = Math.sin(angleRad);
            matrix[2][1] = -Math.sin(angleRad);
            matrix[2][2] = Math.cos(angleRad);
            return matrix;
        }
        static MakeRotationY(angleRad) {
            const matrix = this.makeIdentity();
            matrix[0][0] = Math.cos(angleRad);
            matrix[0][2] = Math.sin(angleRad);
            matrix[2][0] = -Math.sin(angleRad);
            matrix[2][2] = Math.cos(angleRad);
            return matrix;
        }
        static MakeRotationZ(angleRad) {
            const matrix = this.makeIdentity();
            matrix[0][0] = Math.cos(angleRad);
            matrix[0][1] = Math.sin(angleRad);
            matrix[1][0] = -Math.sin(angleRad);
            matrix[1][1] = Math.cos(angleRad);
            return matrix;
        }
        static MakeTranslation({ x, y, z }) {
            const matrix = this.makeIdentity();
            matrix[3][0] = x;
            matrix[3][1] = y;
            matrix[3][2] = z;
            return matrix;
        }
        static MakeProjection(FovDegrees, AspectRatio, Near, Far) {
            const FOVRad = 1 / Math.tan(FovDegrees * 0.5 / 180 * Math.PI);
            return [
                [AspectRatio * FOVRad, 0, 0, 0],
                [0, FOVRad, 0, 0],
                [0, 0, Far / (Far - Near), 1],
                [0, 0, (-Far * Near) / (Far - Near), 0]
            ];
        }
        static MultiplyMatrix(m1, m2) {
            let matrix = this.makeIdentity();
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
        static PointAt(pos, target, _up = vector_1.Vec.make3D(0, 1, 0)) {
            const forward = vector_1.Vec.Normalize(vector_1.Vec.Subtract(target, pos));
            // consider pitch
            const a = vector_1.Vec.MultiplyConst(forward, vector_1.Vec.DotProduct(_up, forward));
            const up = vector_1.Vec.Normalize(vector_1.Vec.Subtract(_up, a));
            const right = vector_1.Vec.CrossProduct(forward, up);
            return [
                [right.x, right.y, right.z, 0],
                [up.x, up.y, up.z, 0],
                [forward.x, forward.y, forward.z, 0],
                [pos.x, pos.y, pos.z, 1]
            ];
        }
        /** only for rotation/translation matrices */
        static QuickInverse(m) {
            const A = vector_1.Vec.make3D(...m[0]);
            const B = vector_1.Vec.make3D(...m[1]);
            const C = vector_1.Vec.make3D(...m[2]);
            const T = vector_1.Vec.make3D(...m[3]);
            return [
                [A.x, B.x, C.x, 0],
                [A.y, B.y, C.y, 0],
                [A.z, B.z, C.z, 0],
                [-vector_1.Vec.DotProduct(T, A), -vector_1.Vec.DotProduct(T, B), -vector_1.Vec.DotProduct(T, C), 1]
            ];
        }
    }
    exports.Matrix4 = Matrix4;
});
define("entity", ["require", "exports", "matrix", "vector"], function (require, exports, matrix_1, vector_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Entity = void 0;
    class Entity {
        constructor(pos = vector_2.Vec.make3D(), rot = vector_2.Vec.make3D()) {
            this.pos = pos;
            this.rot = rot;
        }
        translate(vec) {
            this.pos = vector_2.Vec.Add(this.pos, vec);
            this.update();
        }
        rotateX(rad) {
            this.rot.x = this.rot.x + rad % Math.PI;
            this.update();
        }
        rotateY(rad) {
            this.rot.y = this.rot.y + rad % Math.PI;
            this.update();
        }
        rotateZ(rad) {
            this.rot.z = this.rot.z + rad % Math.PI;
            this.update();
        }
        getTransformMatrix() {
            const matRotX = matrix_1.Matrix4.MakeRotationX(this.rot.x);
            const matRotY = matrix_1.Matrix4.MakeRotationY(this.rot.y);
            const matRotZ = matrix_1.Matrix4.MakeRotationZ(this.rot.z);
            const matTrans = matrix_1.Matrix4.MakeTranslation(this.pos);
            return matrix_1.Matrix4.MultiplyMatrix(matrix_1.Matrix4.MultiplyMatrix(matRotZ, matRotX), matrix_1.Matrix4.MultiplyMatrix(matRotY, matTrans));
        }
    }
    exports.Entity = Entity;
});
define("tri", ["require", "exports", "matrix", "vector"], function (require, exports, matrix_2, vector_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tri = void 0;
    class Tri {
        constructor(p1 = vector_3.Vec.make3D(), p2 = vector_3.Vec.make3D(), p3 = vector_3.Vec.make3D(), t1 = vector_3.Vec.make2D(), t2 = vector_3.Vec.make2D(), t3 = vector_3.Vec.make2D(), l = 1) {
            this.p = [p1, p2, p3];
            this.t = [t1, t2, t3];
            this.l = l;
        }
        static AddVector({ p: [p1, p2, p3], t, l }, vec) {
            return new Tri(vector_3.Vec.Add(p1, vec), vector_3.Vec.Add(p2, vec), vector_3.Vec.Add(p3, vec), ...t, l);
        }
        static AddConst({ p: [p1, p2, p3], t, l }, c) {
            return new Tri(vector_3.Vec.AddConst(p1, c), vector_3.Vec.AddConst(p2, c), vector_3.Vec.AddConst(p3, c), ...t, l);
        }
        static MultiplyVector({ p: [p1, p2, p3], t, l }, vec) {
            return new Tri(vector_3.Vec.Multiply(p1, vec), vector_3.Vec.Multiply(p2, vec), vector_3.Vec.Multiply(p3, vec), ...t, l);
        }
        static MultiplyConst({ p: [p1, p2, p3], t, l }, c) {
            return new Tri(vector_3.Vec.MultiplyConst(p1, c), vector_3.Vec.MultiplyConst(p2, c), vector_3.Vec.MultiplyConst(p3, c), ...t, l);
        }
        static MultiplyVectorAsConst({ p: [p1, p2, p3], t, l }, { x, y, z }) {
            return new Tri(vector_3.Vec.MultiplyConst(p1, x), vector_3.Vec.MultiplyConst(p2, y), vector_3.Vec.MultiplyConst(p3, z), ...t, l);
        }
        static MultiplyVectorAsCons2D({ p, t: [t1, t2, t3], l }, { x, y, z }) {
            return new Tri(...p, vector_3.Vec.MultiplyConst2D(t1, x), vector_3.Vec.MultiplyConst2D(t2, y), vector_3.Vec.MultiplyConst2D(t3, z), l);
        }
        static GetNormal({ p: [p1, p2, p3] }) {
            const a = vector_3.Vec.Subtract(p2, p1);
            const b = vector_3.Vec.Subtract(p3, p2);
            return vector_3.Vec.Normalize(vector_3.Vec.CrossProduct(a, b));
        }
        static MultiplyMatrix({ p: [p1, p2, p3], t, l }, mat) {
            return new Tri(matrix_2.Matrix4.MultiplyVector(p1, mat), matrix_2.Matrix4.MultiplyVector(p2, mat), matrix_2.Matrix4.MultiplyVector(p3, mat), ...t, l);
        }
        /**
         * returns clipped triangles, might return the original triangle or no triangle
         */
        static ClipAgainstPlane(point, normal, tri) {
            // Get signed shortest distance from point to plane, plane normal must be normalised
            const dist = (p) => vector_3.Vec.DotProduct(normal, p) - vector_3.Vec.DotProduct(normal, point);
            // Create two temporary storage arrays to classify points either side of plane
            // If distance sign is positive, point lies on "inside" of plane
            let inside_points = new Array(3);
            let insideCount = 0;
            let outside_points = new Array(3);
            let outsideCount = 0;
            let inside_tex = new Array(3);
            let insideTexCount = 0;
            let outside_tex = new Array(3);
            let outsideTexCount = 0;
            // Get signed distance of each point in triangle to plane
            const d0 = dist(tri.p[0]);
            const d1 = dist(tri.p[1]);
            const d2 = dist(tri.p[2]);
            if (d0 >= 0) {
                inside_points[insideCount++] = tri.p[0];
                inside_tex[insideTexCount++] = Object.assign({}, tri.t[0]);
            }
            else {
                outside_points[outsideCount++] = tri.p[0];
                outside_tex[outsideTexCount++] = Object.assign({}, tri.t[0]);
            }
            if (d1 >= 0) {
                inside_points[insideCount++] = tri.p[1];
                inside_tex[insideTexCount++] = Object.assign({}, tri.t[1]);
            }
            else {
                outside_points[outsideCount++] = tri.p[1];
                outside_tex[outsideTexCount++] = Object.assign({}, tri.t[1]);
            }
            if (d2 >= 0) {
                inside_points[insideCount++] = tri.p[2];
                inside_tex[insideTexCount++] = Object.assign({}, tri.t[2]);
            }
            else {
                outside_points[outsideCount++] = tri.p[2];
                outside_tex[outsideTexCount++] = Object.assign({}, tri.t[2]);
            }
            if (insideCount === 0) {
                return [];
            }
            if (insideCount === 3) {
                return [tri];
            }
            if (insideCount === 1) {
                const i1 = vector_3.Vec.IntersectPlane(point, normal, inside_points[0], outside_points[0]), p1 = i1.v;
                const t1 = vector_3.Vec.lerp2D(inside_tex[0], outside_tex[0], i1.t);
                const i2 = vector_3.Vec.IntersectPlane(point, normal, inside_points[0], outside_points[1]), p2 = i2.v;
                const t2 = vector_3.Vec.lerp2D(inside_tex[0], outside_tex[1], i2.t);
                return [new Tri(inside_points[0], p1, p2, inside_tex[0], t1, t2, tri.l)];
            }
            if (insideCount === 2) {
                const i1 = vector_3.Vec.IntersectPlane(point, normal, inside_points[0], outside_points[0]), p1 = i1.v;
                const t1 = vector_3.Vec.lerp2D(inside_tex[0], outside_tex[0], i1.t);
                const i2 = vector_3.Vec.IntersectPlane(point, normal, inside_points[1], outside_points[0]), p2 = i2.v;
                const t2 = vector_3.Vec.lerp2D(inside_tex[1], outside_tex[0], i2.t);
                return [
                    new Tri(inside_points[0], inside_points[1], p1, inside_tex[0], inside_tex[1], t1, tri.l),
                    // somewhere in the rasterizer code, a property is modified so we nee to make a copy of the shared uv vertices.
                    // this is a bug and should be fixed
                    new Tri(inside_points[1], p1, p2, Object.assign({}, inside_tex[1]), Object.assign({}, t1), t2, tri.l)
                ];
            }
            return [];
        }
    }
    exports.Tri = Tri;
});
define("camera", ["require", "exports", "entity", "matrix", "tri", "vector"], function (require, exports, entity_1, matrix_3, tri_1, vector_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Camera = void 0;
    const upP = vector_4.Vec.make3D(0, 1, 0), upN = vector_4.Vec.make3D(0, -1, 0);
    const downP = vector_4.Vec.make3D(0, -1, 0), downN = vector_4.Vec.make3D(0, 1, 0);
    const leftP = vector_4.Vec.make3D(-1, 0, 0), leftN = vector_4.Vec.make3D(1, 0, 0);
    const rightP = vector_4.Vec.make3D(1, 0, 0), rightN = vector_4.Vec.make3D(-1, 0, 0);
    class Camera extends entity_1.Entity {
        constructor(AspectRatio, fov = 90, pos = vector_4.Vec.make3D(0, 0, 0), rot = vector_4.Vec.make3D(0, 0, 0), clipNear = 0.1, clipFar = 1000) {
            super(pos, rot);
            this.AspectRatio = AspectRatio;
            this.fov = fov;
            this.pos = pos;
            this.rot = rot;
            this.nearNormal = vector_4.Vec.make3D(0, 0, 1);
            this.farNormal = vector_4.Vec.make3D(0, 0, -1);
            this.nearPoint = vector_4.Vec.make3D(0, 0, clipNear);
            this.farPoint = vector_4.Vec.make3D(0, 0, clipFar);
            this.resize();
            this.update();
        }
        resize() {
            this.projectionMatrix = matrix_3.Matrix4.MakeProjection(this.fov, this.AspectRatio, this.nearPoint.z, this.farPoint.z);
        }
        rotateX(rad) {
            super.rotateX(rad);
            this.rot.x = Math.max(this.rot.x, -Math.PI / 2.1);
            this.rot.x = Math.min(this.rot.x, Math.PI / 2.1);
        }
        getHorizontalLookDirection() {
            return matrix_3.Matrix4.MultiplyVector(this.nearNormal, matrix_3.Matrix4.MakeRotationY(this.rot.y));
        }
        update() {
            const target = matrix_3.Matrix4.MultiplyVector(this.nearNormal, this.getTransformMatrix());
            // const up = Matrix4.MultiplyVector(Vec3D.make(1,0,0), this.getTransformMatrix());
            // point camera at target
            const matCamera = matrix_3.Matrix4.PointAt(this.pos, target);
            // inverting the camera matrix yields the view matrix
            this.viewMatrix = matrix_3.Matrix4.QuickInverse(matCamera);
        }
        backFaceCulling(tris, normals) {
            const visible = tris.map((t, i) => ({ i, d: vector_4.Vec.DotProduct(normals[i], vector_4.Vec.Normalize(vector_4.Vec.Subtract(t.p[0], this.pos))) }));
            return visible.filter(({ d }) => d < 0);
        }
        /* Project a Triangle into 2D normalized space, clipping it if it exceeds the near or far plane */
        project2D(tri) {
            //We can speed things up by extracting all the vertices from the tris and adding them to a Set.
            //This will avoid making duplicate calculations, however handling the vertices becomes harder since they need to be stored by reference instead of
            //individual objects. This could be done in many steps of the render pipeline...
            //Convert World Space -> View Space
            const triViewed = tri_1.Tri.MultiplyMatrix(tri, this.viewMatrix);
            // Clip Viewed Triangle against near plane
            return tri_1.Tri.ClipAgainstPlane(this.nearPoint, this.nearNormal, triViewed)
                // Clip Viewed Triangle against far plane
                .reduce((prev, current) => [...prev, ...tri_1.Tri.ClipAgainstPlane(this.farPoint, this.farNormal, current)], [])
                .map(clippedTri => {
                // Project from 3D -> 2D
                const triProjected = tri_1.Tri.MultiplyMatrix(clippedTri, this.projectionMatrix);
                // normalize (frustum) the result of the matrix multiplication
                let [w1, w2, w3] = triProjected.p.map((p) => p.w);
                const oneoverw = vector_4.Vec.make3D(1 / w1, 1 / w2, 1 / w3);
                let triFrustum = tri_1.Tri.MultiplyVectorAsCons2D(triProjected, oneoverw);
                triFrustum.t[0].w = 1 / w1;
                triFrustum.t[1].w = 1 / w2;
                triFrustum.t[2].w = 1 / w3;
                triFrustum = tri_1.Tri.MultiplyVectorAsConst(triFrustum, oneoverw);
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
        frustumClip(tri) {
            return tri_1.Tri.ClipAgainstPlane(upP, upN, tri)
                .reduce((list, test) => [...list, ...tri_1.Tri.ClipAgainstPlane(downP, downN, test)], [])
                .reduce((list, test) => [...list, ...tri_1.Tri.ClipAgainstPlane(leftP, leftN, test)], [])
                .reduce((list, test) => [...list, ...tri_1.Tri.ClipAgainstPlane(rightP, rightN, test)], []);
        }
    }
    exports.Camera = Camera;
});
define("canvas", ["require", "exports", "tri", "vector"], function (require, exports, tri_2, vector_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Canvas = void 0;
    var Canvas;
    (function (Canvas) {
        let width;
        let height;
        let ctx;
        const frametimes = new Array(10).fill(Infinity);
        const HalfMax32UInt = 2 ** 16 - 1;
        let depthBuffer = new Uint32Array();
        let emptyDepthBuffer = new Uint32Array();
        let imageData = new ImageData(new Uint8ClampedArray(4), 1);
        let emptyImageData = new ImageData(new Uint8ClampedArray(4), 1);
        let uint32View = new Uint32Array();
        let framecount = 0;
        let medianElapsed = 16.6;
        let backgroundColor;
        function SetupCanvas(_backgroundColor = "#112244") {
            const canvas = document.querySelector("canvas");
            if (!canvas)
                throw "canvas not found";
            const _ctx = canvas.getContext("2d");
            if (!_ctx)
                throw "2D Context could not be created";
            ctx = _ctx;
            width = Math.round(canvas.getBoundingClientRect().width);
            height = Math.round(canvas.getBoundingClientRect().height);
            canvas.setAttribute("width", width + "px");
            canvas.setAttribute("height", height + "px");
            ctx.lineWidth = 0;
            backgroundColor = _backgroundColor;
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);
            emptyImageData = ctx.getImageData(0, 0, width, height);
            imageData = ctx.getImageData(0, 0, width, height);
            emptyDepthBuffer = new Uint32Array(width * height).fill(0);
            depthBuffer = new Uint32Array(width * height);
            uint32View = new Uint32Array(imageData.data.buffer);
            const AspectRatio = height / width;
            return AspectRatio;
        }
        Canvas.SetupCanvas = SetupCanvas;
        function clear(elapsed) {
            updateFrameTimes(elapsed);
            imageData.data.set(emptyImageData.data);
            depthBuffer.set(emptyDepthBuffer);
        }
        Canvas.clear = clear;
        function clearCTX(elapsed) {
            updateFrameTimes(elapsed);
            ctx.lineWidth = 0;
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);
        }
        Canvas.clearCTX = clearCTX;
        function updateFrameTimes(elapsed) {
            framecount++;
            frametimes[framecount % frametimes.length] = elapsed;
            medianElapsed = frametimes.reduce((a, b) => a + b) / frametimes.length;
        }
        function loadImage(path) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(res => {
                    const img = document.createElement("img");
                    img.src = path;
                    img.onload = () => {
                        ctx.canvas.width = img.width;
                        ctx.canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        const tex = ctx.getImageData(0, 0, img.width, img.height);
                        const colors = [];
                        const colorsUInt8 = [];
                        const colorsUInt32 = new Uint32Array(img.width * img.height);
                        for (let i = 0; i < tex.data.length; i += 4) {
                            const color = tex.data.slice(i, i + 4);
                            colorsUInt8.push(color);
                            colors.push(`rgba(${color.join(",")})`);
                            const [r, g, b, a] = color;
                            const color32 = a << 24 | b << 16 | g << 8 | r;
                            colorsUInt32[i / 4] = color32;
                        }
                        res(Object.assign(tex, { colors, colorsUInt8, colorsUInt32 }));
                        ctx.canvas.width = width;
                        ctx.canvas.height = height;
                    };
                });
            });
        }
        Canvas.loadImage = loadImage;
        function NormalizedToScreenSpace(tri) {
            // Offset consto visible normalized space
            tri = tri_2.Tri.AddVector(tri, { x: 1, y: 1, z: 0, w: 1 });
            // un-normalize to screen coordinates
            return tri_2.Tri.MultiplyVector(tri, { x: 0.5 * width, y: 0.5 * height, z: 1, w: 1 });
        }
        function DrawTriangle(tri, color = "#ffffff", lineWidth = 1) {
            const [p1, p2, p3] = NormalizedToScreenSpace(tri).p;
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.closePath();
            ctx.stroke();
        }
        Canvas.DrawTriangle = DrawTriangle;
        function FillTriangle(tri, color = "#ffffff", fillStyle, lineWidth = 0) {
            DrawTriangle(tri, color, lineWidth);
            ctx.fillStyle = fillStyle !== null && fillStyle !== void 0 ? fillStyle : color;
            ctx.fill();
        }
        Canvas.FillTriangle = FillTriangle;
        function TexturedTriangle(tri, tex) {
            const { p, t: [t1, t2, t3] } = NormalizedToScreenSpace(tri);
            // we are in cartesian space now so we should treat vertices as integer coordinates now, as we loop over them later
            const [p1, p2, p3] = p.map(({ x, y }) => vector_5.Vec.make3D(Math.round(x), Math.round(y)));
            // sort the points by their y value
            if (p2.y < p1.y) {
                vector_5.Vec.swap(p1, p2);
                vector_5.Vec.swap2D(t1, t2);
            }
            if (p3.y < p1.y) {
                vector_5.Vec.swap(p3, p1);
                vector_5.Vec.swap2D(t3, t1);
            }
            if (p3.y < p2.y) {
                vector_5.Vec.swap(p3, p2);
                vector_5.Vec.swap2D(t3, t2);
            }
            // if y3 and y1 are the same, the triangle isn't visible, since it occupies 0 rows of pixels
            if (p3.y == p1.y) {
                return;
            }
            const { uvStep: uvStepRight, xStep: xStepRight } = getStep(p1, p3, t1, t3);
            if (p2.y != p1.y) {
                const { uvStep: uvStepLeft, xStep: xStepLeft } = getStep(p1, p2, t1, t2);
                rasterize(p1.y, p2.y, p1.x, p1.x, vector_5.Vec.make3Dfrom2D(t1), vector_5.Vec.make3Dfrom2D(t1), xStepLeft, xStepRight, uvStepLeft, uvStepRight, tex, tri.l);
            }
            if (p3.y != p2.y) {
                // we need to interpolate the starting values for rightX and uvRight, since it has been already interpolated half way in the first rasterize call
                const y1y2 = p2.y - p1.y;
                const rightX = p1.x + xStepRight * y1y2;
                const rightUV = vector_5.Vec.Add(vector_5.Vec.make3Dfrom2D(t1), vector_5.Vec.MultiplyConst(uvStepRight, y1y2));
                const { uvStep: uvStepLeft, xStep: xStepLeft } = getStep(p2, p3, t2, t3);
                rasterize(p2.y, p3.y, p2.x, rightX, vector_5.Vec.make3Dfrom2D(t2), rightUV, xStepLeft, xStepRight, uvStepLeft, uvStepRight, tex, tri.l);
            }
        }
        Canvas.TexturedTriangle = TexturedTriangle;
        function getStep(p1, p2, t1, t2) {
            const y1y2 = p2.y - p1.y;
            const x1x2 = p2.x - p1.x;
            const t1t2 = vector_5.Vec.make3D(t2.u - t1.u, t2.v - t1.v, t2.w - t1.w);
            return {
                xStep: x1x2 / y1y2,
                uvStep: vector_5.Vec.MultiplyConst(t1t2, 1 / y1y2)
            };
        }
        function rasterize(startRow, endRow, xLeft, xRight, uvLeft, uvRight, xStepLeft, xStepRight, uvStepLeft, uvStepRight, tex, luminance) {
            // xLeft might be identical to xRight in the beginning but they propagate in different directions.
            // if the left side is larger than the right side, swap the points
            if (xLeft + xStepLeft > xRight + xStepRight) {
                return rasterize(startRow, endRow, xRight, xLeft, uvRight, uvLeft, xStepRight, xStepLeft, uvStepRight, uvStepLeft, tex, luminance);
            }
            // get a reference to the texture width and height instead of aquiring it for each pixel of the tri
            const { width: texWidth, height: texHeight } = tex;
            const lerpResult = vector_5.Vec.make3D();
            for (let i = startRow; i <= endRow; i++) {
                const currentStep = i - startRow;
                const startCol = Math.round(xLeft + currentStep * xStepLeft);
                const endCol = Math.round(xRight + currentStep * xStepRight);
                const tex_start = vector_5.Vec.Add(uvLeft, vector_5.Vec.MultiplyConst(uvStepLeft, currentStep));
                const tex_end = vector_5.Vec.Add(uvRight, vector_5.Vec.MultiplyConst(uvStepRight, currentStep));
                const t_step = 1 / (endCol - startCol);
                let t = 0;
                for (let j = startCol; j < endCol; j++) {
                    vector_5.Vec.lerp(tex_start, tex_end, t, lerpResult);
                    const { x: tex_u, y: tex_v, z: tex_w } = lerpResult;
                    if ((tex_w * HalfMax32UInt) > depthBuffer[i * width + j]) {
                        DrawPixel(j, i, SampleColorUInt8(tex_u / tex_w, tex_v / tex_w, tex, texWidth, texHeight), luminance);
                        depthBuffer[i * width + j] = tex_w * HalfMax32UInt;
                    }
                    t += t_step;
                }
            }
        }
        function SampleColorUInt8(u, v, tex, width, height) {
            // due to rounding errors and all javascript numbers being floating point,
            // u and v can end up being slightly below zero (e.g. -0.0000000001), hence the Math.trunc
            const col = Math.trunc(u * width);
            const row = Math.trunc(v * height);
            return tex.colorsUInt32[col + width * row];
        }
        function DrawPixel(x, y, color, luminance) {
            // we still need to multiply the color by the luminance, since the color is stored in a Uint32Array, each color channel at a time
            color =
                ((color & 0xff000000)) |
                    ((color & 0x00ff0000) * luminance & 0x00ff0000) |
                    ((color & 0x0000ff00) * luminance & 0x0000ff00) |
                    ((color & 0x000000ff) * luminance & 0x000000ff);
            uint32View[x + width * y] = color;
        }
        function swapImageData() {
            ctx.putImageData(imageData, 0, 0);
        }
        Canvas.swapImageData = swapImageData;
        function DrawDebugInfo(tris, projectionTime, clippingTime, drawTime) {
            ctx.fillStyle = "#888";
            ctx.fillText((1 / medianElapsed).toFixed(0) + " FPS", 10, 10);
            ctx.fillText("Tris: " + tris, 10, 25);
            ctx.fillText("Projection: " + projectionTime.toFixed(1) + "ms", 10, 40);
            ctx.fillText("Clipping: " + clippingTime.toFixed(1) + "ms", 10, 55);
            ctx.fillText("Draw: " + drawTime.toFixed(1) + "ms", 10, 70);
        }
        Canvas.DrawDebugInfo = DrawDebugInfo;
    })(Canvas || (exports.Canvas = Canvas = {}));
});
define("mesh", ["require", "exports", "entity", "matrix", "tri", "vector"], function (require, exports, entity_2, matrix_4, tri_3, vector_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Mesh = void 0;
    const light = vector_6.Vec.Normalize(vector_6.Vec.make3D(0.5, 0.5, -1));
    const color = vector_6.Vec.make3D(255, 255, 255);
    class Mesh extends entity_2.Entity {
        constructor(verts = [], uvs = [], triIndizes = []) {
            super();
            this.verts = verts;
            this.uvs = uvs;
            this.triIndizes = triIndizes;
            this.texture = null;
            this.update();
        }
        static LoadFromObjFile(url) {
            return __awaiter(this, void 0, void 0, function* () {
                const convertToZeroBasedIndex = (indizes) => indizes.map(i => Number(i) - 1);
                const verts = [];
                const uvs = [];
                const text = yield (yield fetch(url)).text();
                const lines = text.split("\n");
                const tris = [];
                lines.forEach(line => {
                    if (line.startsWith("v")) {
                        if (line.startsWith("vt")) {
                            const [_, u, v] = line.split(" ", 3).map(Number);
                            uvs.push(vector_6.Vec.make2D(u, v));
                            return;
                        }
                        const [_, x, y, z] = line.split(" ", 4).map(Number);
                        verts.push(vector_6.Vec.make3D(x, y, z));
                    }
                    else if (line.startsWith("f")) {
                        if (line.includes("/")) {
                            const [_, s1, s2, s3] = line.split(" ", 4);
                            const [p1, t1] = convertToZeroBasedIndex(s1.split("/"));
                            const [p2, t2] = convertToZeroBasedIndex(s2.split("/"));
                            const [p3, t3] = convertToZeroBasedIndex(s3.split("/"));
                            tris.push([p1, p2, p3, t1, t2, t3]);
                            return;
                        }
                        const [_, p1, p2, p3] = convertToZeroBasedIndex(line.split(" ", 4));
                        tris.push([p1, p2, p3]);
                    }
                });
                return new Mesh(verts, uvs, tris);
            });
        }
        update() {
            const worldMat = super.getTransformMatrix();
            const verts = this.verts.map(v => matrix_4.Matrix4.MultiplyVector(v, worldMat));
            this.tris = this.triIndizes.map(([p1, p2, p3, t1, t2, t3]) => new tri_3.Tri(verts[p1], verts[p2], verts[p3], this.uvs[t1], this.uvs[t2], this.uvs[t3]));
            this.normals = this.tris.map(tri_3.Tri.GetNormal);
        }
        cullTris(camera) {
            const visibleTriIndizes = camera.backFaceCulling(this.tris, this.normals);
            this.normals = visibleTriIndizes.map(({ i }) => this.normals[i]);
            this.tris = visibleTriIndizes.map(({ i }) => this.tris[i]);
        }
        illuminate() {
            this.tris.map((t, i) => t.l = Math.max(0.1, vector_6.Vec.DotProduct(light, this.normals[i])));
        }
    }
    exports.Mesh = Mesh;
});
define("pipeline", ["require", "exports", "canvas"], function (require, exports, canvas_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RenderPipeline = void 0;
    const Identity = (tris) => tris;
    const white = [255, 255, 255];
    class RenderPipeline {
        constructor(cam, mesh) {
            this.cam = cam;
            this.mesh = mesh;
            this.renderSteps = [
                this.backFaceCulling.bind(this),
                this.lighting.bind(this),
                this.project.bind(this),
                this.clip.bind(this),
                this.drawTexture.bind(this),
                Identity,
                this.debugInfo.bind(this)
            ];
        }
        backFaceCulling() {
            this.mesh.cullTris(this.cam);
            return [];
        }
        lighting() {
            this.mesh.illuminate();
            return [];
        }
        project() {
            return this.mesh.tris.flatMap(t => this.cam.project2D(t));
        }
        clip(tris) {
            performance.mark("clippingStart");
            return tris.flatMap(tri => this.cam.frustumClip(tri));
        }
        drawTexture(tris) {
            performance.mark("draw");
            for (const tri of tris) {
                canvas_1.Canvas.TexturedTriangle(tri, this.mesh.texture);
            }
            canvas_1.Canvas.swapImageData();
            return tris;
        }
        draw(tris) {
            performance.mark("draw");
            tris = tris.sort((a, b) => {
                const z1 = (a.p[0].z + a.p[1].z + a.p[2].z) / 3;
                const z2 = (b.p[0].z + b.p[1].z + b.p[2].z) / 3;
                return z2 - z1;
            });
            for (const tri of tris) {
                const fill = "#" + white.map(c => Math.round(c * tri.l).toString(16)).join("");
                canvas_1.Canvas.FillTriangle(tri, fill);
            }
            return tris;
        }
        drawVoid(tris) {
            performance.mark("draw");
            return tris;
        }
        wireframe(tris) {
            tris.forEach(t => canvas_1.Canvas.DrawTriangle(t, "#0f0"));
            return tris;
        }
        debugInfo(tris) {
            canvas_1.Canvas.DrawDebugInfo(tris.length, performance.measure("projection", "FrameStart", "clippingStart").duration, performance.measure("clipping", "clippingStart", "draw").duration, performance.measure("clipping", "draw").duration);
            return tris;
        }
        render(elapsed) {
            performance.clearMarks();
            performance.mark("FrameStart");
            (this.renderSteps[4] === this.draw || this.renderSteps[4].name !== "bound drawTexture")
                ? canvas_1.Canvas.clearCTX(elapsed)
                : canvas_1.Canvas.clear(elapsed);
            this.renderSteps.reduce((tris, step) => step(tris), []);
        }
        toggleWireFrame() {
            this.renderSteps[5] = this.renderSteps[3] === this.wireframe ? Identity : this.wireframe;
        }
        toggleCulling() {
            this.renderSteps[0] = this.renderSteps[0].name === "bound backFaceCulling" ? Identity : this.backFaceCulling.bind(this);
        }
        toggleShading() {
            this.renderSteps[1] = this.renderSteps[1].name === "bound lighting" ? Identity : this.lighting.bind(this);
        }
        toggleTexture() {
            if (this.renderSteps[4] === this.draw) {
                this.renderSteps[4] = this.drawVoid;
                this.renderSteps[5] = this.wireframe;
            }
            else if (this.renderSteps[4].name === "bound drawTexture") {
                this.renderSteps[4] = this.draw;
                this.renderSteps[5] = Identity;
            }
            else {
                this.renderSteps[4] = this.drawTexture.bind(this);
                this.renderSteps[5] = Identity;
            }
        }
    }
    exports.RenderPipeline = RenderPipeline;
});
define("input", ["require", "exports", "vector"], function (require, exports, vector_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Input = void 0;
    var Input;
    (function (Input) {
        let camera;
        let pipeline;
        const keyDown = {};
        let keyPressed = {};
        const mousemove = (e) => {
            if (document.pointerLockElement === null)
                return;
            camera.rotateY(-e.movementX * 0.001);
            camera.rotateX(e.movementY * 0.001);
        };
        const click = (e) => e.target.requestPointerLock();
        const keydown = (e) => {
            keyDown[e.code] = true;
            keyPressed[e.code] = true;
            e.preventDefault();
        };
        const keyup = (e) => keyDown[e.code] = false;
        function setup(_camera, _pipeline) {
            var _a, _b;
            camera = _camera;
            pipeline = _pipeline;
            (_a = document.querySelector("canvas")) === null || _a === void 0 ? void 0 : _a.removeEventListener("click", click);
            (_b = document.querySelector("canvas")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", click);
            window.removeEventListener("keydown", keydown);
            window.addEventListener("keydown", keydown);
            window.removeEventListener("keyup", keyup);
            window.addEventListener("keyup", keyup);
            window.removeEventListener("mousemove", mousemove);
            window.addEventListener("mousemove", mousemove);
        }
        Input.setup = setup;
        function update(camera, elapsed) {
            var _a;
            const transSpeed = 8 * elapsed;
            const rotSpeed = 2 * elapsed;
            const LookDir = camera.getHorizontalLookDirection();
            const forward = vector_7.Vec.MultiplyConst(LookDir, transSpeed);
            const right = vector_7.Vec.MultiplyConst(vector_7.Vec.CrossProduct(LookDir, vector_7.Vec.make3D(0, -1, 0)), transSpeed);
            const up = vector_7.Vec.MultiplyConst(vector_7.Vec.make3D(0, 1, 0), transSpeed);
            if (keyDown["KeyA"]) {
                camera.translate(vector_7.Vec.Invert(right));
            }
            if (keyDown["KeyD"]) {
                camera.translate(right);
            }
            if (keyDown["KeyQ"]) {
                camera.translate(up);
            }
            if (keyDown["KeyE"]) {
                camera.translate(vector_7.Vec.Invert(up));
            }
            if (keyDown["KeyW"]) {
                camera.translate(forward);
            }
            if (keyDown["KeyS"]) {
                camera.translate(vector_7.Vec.Invert(forward));
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
            if (keyPressed["KeyH"]) {
                (_a = document.querySelector("#help")) === null || _a === void 0 ? void 0 : _a.classList.toggle("hidden");
            }
            keyPressed = {};
        }
        Input.update = update;
    })(Input || (exports.Input = Input = {}));
});
define("index", ["require", "exports", "camera", "canvas", "input", "mesh", "pipeline", "vector"], function (require, exports, camera_1, canvas_2, input_1, mesh_1, pipeline_1, vector_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var mesh = new mesh_1.Mesh();
    let camera = new camera_1.Camera(1);
    let pipeline = new pipeline_1.RenderPipeline(camera, mesh);
    setup();
    mainLoop(0);
    window.addEventListener("resize", setup);
    function setup() {
        if (mesh.tris.length == 0) {
            Promise.all([
                canvas_2.Canvas.loadImage("./UVGrid.png"),
                mesh_1.Mesh.LoadFromObjFile("./teapot.obj")
            ]).then(([texture, teapot]) => {
                mesh = teapot;
                mesh.translate(vector_8.Vec.make3D(-0.5, -0.5, 8));
                mesh.rotateY(0.1);
                mesh.rotateZ(0.3);
                mesh.texture = texture;
                pipeline = new pipeline_1.RenderPipeline(camera, mesh);
                input_1.Input.setup(camera, pipeline);
            });
        }
        const AspectRatio = canvas_2.Canvas.SetupCanvas();
        camera = new camera_1.Camera(AspectRatio, undefined, camera.pos, camera.rot);
        pipeline = new pipeline_1.RenderPipeline(camera, mesh);
        input_1.Input.setup(camera, pipeline);
    }
    function mainLoop(elapsed) {
        mesh.rotateY(elapsed * Math.PI * 0.1);
        input_1.Input.update(camera, elapsed);
        pipeline.render(elapsed);
        requestAnimationFrame(() => mainLoop(performance.measure("elapsed", "FrameStart").duration / 1000));
    }
});
