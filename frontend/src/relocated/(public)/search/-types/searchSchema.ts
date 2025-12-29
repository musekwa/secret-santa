import z from 'zod';
export const sortOptions = {
    alphabeticalAsc: 'alphabeticalAsc',
    alphabeticalDesc: 'alphabeticalDesc',   
} as const;

export type SortOption = (typeof sortOptions)[keyof typeof sortOptions];

export const searchSchema = z.object({
    page: z.number().default(1).catch(1),
    filter: z.string().default('').catch(''),
    sort: z.enum(sortOptions).default(sortOptions.alphabeticalAsc).catch(sortOptions.alphabeticalAsc),
});

export type SearchSchema = z.infer<typeof searchSchema>;