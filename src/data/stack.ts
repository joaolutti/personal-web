//as const since they are meant to be immutable
export const categories = ['languages', 'frameworks', 'tools'] as const;

type HexColor = `#${string}`;

export const icons = {
    angular: {
        color: '#ffff',
    },
    astro: {
        color: '#bc52ee',
    },
    cloudflare: {
        color: '#f38020',
    },
    docker: {
        color: '#2496ed',
    },
    figma: {
        color: '#f24e1e',
    },
    git: {
        color: '#f03c2e',
    },
    go: {
        color: '#00add8',
    },
    nextdotjs: {
        color: '#ece7dd',
    },
    nodedotjs: {
        color: '#5fa04e',
    },
    postgresql: {
        color: '#4169e1',
    },
    python: {
        color: '#3776ab',
    },
    sql: {
        color: '#00758f',
    },
    typescript: {
        color: '#3178c6',
    },
} as const satisfies Record<string, { color: HexColor }>;

export type Category = (typeof categories)[number];
export type IconSlug = keyof typeof icons;

export interface Skill {
    name: string;
    category: Category;
    icon: IconSlug;
}

export function getIconPath(icon: IconSlug): string {
    return `icons/${icon}.svg`;
}

export const stack = [
    {
        name: 'Angular',
        category: 'frameworks',
        icon: 'angular',
    },
    {
        name: 'Astro',
        category: 'frameworks',
        icon: 'astro',
    },
    {
        name: 'Cloudflare',
        category: 'tools',
        icon: 'cloudflare',
    },
    {
        name: 'Docker',
        category: 'tools',
        icon: 'docker',
    },
    {
        name: 'Figma',
        category: 'tools',
        icon: 'figma',
    },
    {
        name: 'Git',
        category: 'tools',
        icon: 'git',
    },
    {
        name: 'Go',
        category: 'languages',
        icon: 'go',
    },
    {
        name: 'Next.js',
        category: 'frameworks',
        icon: 'nextdotjs',
    },
    {
        name: 'Node · Express',
        category: 'frameworks',
        icon: 'nodedotjs',
    },
    {
        name: 'PostgreSQL',
        category: 'frameworks',
        icon: 'postgresql',
    },
    {
        name: 'Python',
        category: 'languages',
        icon: 'python',
    },
    {
        name: 'SQL',
        category: 'languages',
        icon: 'sql',
    },
    {
        name: 'TypeScript',
        category: 'languages',
        icon: 'typescript',
    },
] as const satisfies readonly Skill[];
