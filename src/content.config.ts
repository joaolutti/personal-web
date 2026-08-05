import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            brief: z.string(),
            role: z.string(),
            stack: z.array(z.string()),
            img: z
                .object({
                    src: image(),
                    alt: z.string(),
                })
                .optional(),
            highlights: z.array(z.string()).min(3),
            links: z.object({
                live: z.string().optional(),
                source: z.string().optional(),
            }),
        }),
});

//to add blog/writing later, will be a separate schema with base: "./src/content/blog"

export const collections = { projects };
