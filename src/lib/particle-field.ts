export interface FieldConfig {
    accentColor?: string;
    count?: number;
    shape?: ShapeName;
    scale?: number;
    ease?: number;

    spin?: number;
    tilt?: number;
    wobble?: number;
    dotSize?: number;
    dotDepth?: number;
    dotAlpha?: number;
    dotAlphaDepth?: number;

    //cursor interaction
    cursorRadius?: number;
    cursorForce?: number;
    //cycleOnClick?: boolean;
}

interface Particle {
    //base unit sphere aprox. -1 to 1
    bx: number;
    by: number;
    bz: number;
    theta: number;
    phi: number;
    seed: number; //rand per particle\

    //curr
    x: number;
    y: number;

    //target
    tx: number;
    ty: number;

    initialized: boolean;
}

type ShapeFn = (p: Particle, t: number) => readonly [number, number, number];

const orb: ShapeFn = (p) => {
    return [p.bx, p.by, p.bz];
};

const SHAPES = {
    orb,
} as const;

export type ShapeName = keyof typeof SHAPES;

function buildSphere(count: number): Particle[] {
    const pts: Particle[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
        const y = 1 - ((i + 0.5) / count) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const angle = goldenAngle * i;

        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;

        pts.push({
            bx: x,
            by: y,
            bz: z,
            theta: Math.atan2(z, x),
            phi: Math.acos(Math.max(-1, Math.min(1, y))),
            seed: Math.random(),
            x: 0,
            y: 0,
            tx: 0,
            ty: 0,
            initialized: false,
        });
    }
    return pts;
}

export class ParticleField {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private cfg: Required<FieldConfig>;
    private points: Particle[] = [];
    private ro: ResizeObserver;

    private width = 0;
    private height = 0;
    private cx = 0;
    private cy = 0;
    private radius = 1;
    private easeK = 0.12;

    private pointer = {
        x: 0,
        y: 0,
        active: false,
    };

    //stores pointer down viewport pos.
    private downAt: {
        x: number;
        y: number;
        pointerId: number;
    } | null = null;

    private raf = 0; //requestAnimationFrame
    private t0 = performance.now(); //start of animation
    private lastFrame = performance.now(); //timestamp for previous frame

    constructor(canvas: HTMLCanvasElement, config: FieldConfig = {}) {
        this.canvas = canvas;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('could not get 2D context');
        this.ctx = ctx;

        //todo: tweak with these default values later
        this.cfg = {
            accentColor: '#FFF',
            count: 800,
            shape: 'orb',
            scale: 0.34,
            ease: 0.12,
            spin: 0.28,
            tilt: 0.5,
            wobble: 0,
            dotSize: 1.2,
            dotDepth: 1.6,
            dotAlpha: 0.2,
            dotAlphaDepth: 0.62,
            cursorRadius: 100,
            cursorForce: 20,
            ...config,
        };
        this.points = buildSphere(this.cfg.count);

        this.resize();
        this.ro = new ResizeObserver(this.resize);
        this.ro.observe(canvas);

        canvas.addEventListener('pointermove', this.onPointerMove);
        canvas.addEventListener('pointerleave', this.onPointerLeave);
        canvas.addEventListener('pointerdown', this.onPointerDown);
        canvas.addEventListener('pointerup', this.onPointerUp);
        canvas.addEventListener('pointercancel', this.onPointerCancel);

        this.raf = requestAnimationFrame(this.frame);
    }

    destroy() {
        this.canvas.removeEventListener('pointermove', this.onPointerMove);
        this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
        this.canvas.removeEventListener('pointerdown', this.onPointerDown);
        this.canvas.removeEventListener('pointerup', this.onPointerUp);
        this.canvas.removeEventListener('pointercancel', this.onPointerCancel);

        cancelAnimationFrame(this.raf);
        this.ro.disconnect();
    }

    //method to normalize CSS and canvas pixels
    private resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        //css pixels
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        //backing store -> physical pixels
        this.canvas.width = Math.max(1, Math.round(this.width * dpr));
        this.canvas.height = Math.max(1, Math.round(this.height * dpr));

        //scale context so drawing lands on correct spot
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.cx = this.width / 2;
        this.cy = this.height / 2;

        this.radius = Math.min(this.width, this.height) * this.cfg.scale;
    };

    private unitOf(p: Particle, t: number): readonly [number, number, number] {
        return SHAPES[this.cfg.shape](p, t);
    }

    private pointFromEvent(e: PointerEvent) {
        const rect = this.canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    private onPointerMove = (e: PointerEvent) => {
        const point = this.pointFromEvent(e);

        this.pointer.x = point.x;
        this.pointer.y = point.y;
        this.pointer.active = true;
    };

    private onPointerLeave = () => {
        this.pointer.active = false;
    };

    private onPointerDown = (e: PointerEvent) => {
        this.downAt = {
            x: e.clientX,
            y: e.clientY,
            pointerId: e.pointerId,
        };

        this.canvas.setPointerCapture(e.pointerId);
    };

    private onPointerUp = (e: PointerEvent) => {
        const down = this.downAt;
        this.downAt = null;

        if (!down) return;
        if (down.pointerId !== e.pointerId) return;

        if (this.canvas.hasPointerCapture(e.pointerId)) {
            this.canvas.releasePointerCapture(e.pointerId);
        }

        const dx = e.clientX - down.x;
        const dy = e.clientY - down.y;
        const moved = Math.hypot(dx, dy);
    };

    private onPointerCancel = (e: PointerEvent) => {
        if (this.canvas.hasPointerCapture(e.pointerId)) {
            this.canvas.releasePointerCapture(e.pointerId);
        }

        this.downAt = null;
        this.pointer.active = false;
    };

    private applyPointerForce(p: Particle, frameScale: number) {
        if (!this.pointer.active) return;

        let dx = p.x - this.pointer.x;
        let dy = p.y - this.pointer.y;
        let distanceSquared = dx * dx + dy * dy;

        const radius = this.cfg.cursorRadius;
        const radiusSquared = radius * radius;

        if (distanceSquared >= radiusSquared) return;

        if (distanceSquared < 1e-8) {
            const angle = p.seed * Math.PI * 2;
            dx = Math.cos(angle) * 0.001;
            dy = Math.sin(angle) * 0.001;
            distanceSquared = dx * dx + dy * dy;
        }

        const distance = Math.sqrt(distanceSquared);
        const nx = dx / distance;
        const ny = dy / distance;

        const falloff = 1 - distance / radius;
        const force = falloff * this.cfg.cursorForce * frameScale;

        p.x += nx * force;
        p.y += ny * force;
    }

    private render(t: number, easeK: number, frameScale: number, snap: boolean) {
        const { ctx, width, height, points, cx, cy, radius } = this;
        ctx.clearRect(0, 0, width, height); //clear before rendering new one
        ctx.fillStyle = this.cfg.accentColor;

        const ax = this.cfg.tilt + Math.sin(t * 0.15) * this.cfg.wobble;
        const ay = t * this.cfg.spin;

        const cosA = Math.cos(ax);
        const sinA = Math.sin(ax);
        const cosB = Math.cos(ay);
        const sinB = Math.sin(ay);

        for (const p of points) {
            const [ux, uy, uz] = this.unitOf(p, t);

            const y1 = uy * cosA - uz * sinA;
            const z1 = uy * sinA + uz * cosA;

            const rx = ux * cosB + z1 * sinB;
            const rz = -ux * sinB + z1 * cosB;

            p.tx = this.cx + rx * this.radius;
            p.ty = this.cy + y1 * this.radius;

            this.applyPointerForce(p, frameScale);

            if (!p.initialized) {
                p.x = p.tx;
                p.y = p.ty;
                p.initialized = true;
            } else {
                p.x += (p.tx - p.x) * this.easeK;
                p.y += (p.ty - p.y) * this.easeK;
            }

            const size = this.cfg.dotSize;

            ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
        }
    }

    private frame = (now: number) => {
        const dt = Math.min((now - this.lastFrame) / 1000, 0.1);
        this.lastFrame = now;
        const frameScale = dt * 60;

        this.easeK = 1 - Math.pow(1 - this.cfg.ease, dt * 60);
        const t = (now - this.t0) / 1000; //seconds since start of animation
        this.render(t, this.easeK, frameScale, false);
        this.raf = requestAnimationFrame(this.frame);
    };
}
