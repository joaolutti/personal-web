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
            scale: 0.35,
            ease: 0.12,
            spin: 0.3,
            tilt: -0.25,
            wobble: 0.2,
            dotSize: 3,
            dotDepth: 1.5,
            dotAlpha: 0.2,
            dotAlphaDepth: 0.5,
            ...config,
        };
        this.points = buildSphere(this.cfg.count);

        this.resize();
        this.ro = new ResizeObserver(this.resize);
        this.ro.observe(canvas);
        this.raf = requestAnimationFrame(this.frame);
    }

    destroy() {
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

    private render(t: number) {
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

        this.easeK = 1 - Math.pow(1 - this.cfg.ease, dt * 60);
        const t = (now - this.t0) / 1000; //seconds since start of animation
        this.render(t);
        this.raf = requestAnimationFrame(this.frame);
    };
}
