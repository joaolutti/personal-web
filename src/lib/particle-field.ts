export interface FieldConfig {
    accentColor?: string;
    spacing?: number;
}

interface Particle {
    x: number;
    y: number;
    col: number;
    row: number;
    seed: number
}

export class ParticleField {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private cfg: Required<FieldConfig>;
    private points: Particle[] = [];
    private ro: ResizeObserver;
    //ResizeObserver watches the element itself, compared to window.resize that just watches window size changes

    private width = 0;
    private height = 0;

    constructor(canvas: HTMLCanvasElement, config: FieldConfig = {}) {
        this.canvas = canvas;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("could not get 2D context");
        this.ctx = ctx;

        this.cfg = { accentColor: "#FFF", spacing: 24, ...config};
        
        this.resize();
        this.ro = new ResizeObserver(this.resize);
        this.ro.observe(canvas);
    }

    destroy() {
        this.ro.disconnect();
    }

    //method to normalize CSS and canvas pixels
    private resize() {

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        //css pixels
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        //backing store -> physical pixels
        this.canvas.width = Math.max(1, Math.round(this.width * dpr));
        this.canvas.height = Math.max(1, Math.round(this.height * dpr));

        //scale context so drawing lands on correct spot
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.points = this.buildGrid();
        this.draw();
    }

    private buildGrid(): Particle[] {
        const { spacing } = this.cfg;
        const pts: Particle[] = [];
        const cols = Math.floor(this.width / spacing);
        const rows = Math.floor(this.height / spacing);

        const offsetX = (this.width - (cols - 1) * spacing) / 2;
        const offsetY = (this.height - (rows - 1) * spacing) / 2;

        for (let r = 0; r < rows; r++){
            for( let c = 0; c < cols; c++){
                pts.push({
                    x: offsetX + c * spacing,
                    y: offsetY + r * spacing,
                    c, r,
                    seed: Math.random(),
                });
            }
        }
        
        return pts
    }

    private draw() {
        const { ctx } = this;
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.fillStyle = this.cfg.accentColor;
        for (const p of this.points) {
            ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
        }
    }
}