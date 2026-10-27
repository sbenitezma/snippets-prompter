import type { Prompt } from '../types';

/** Made-up example prompts shown on first run. Never put real client content here. */
export const seedPrompts: Prompt[] = [
  {
    id: 'seed-1',
    title: 'Product launch teaser',
    body: 'Write a {{tone}} teaser for the launch of {{product}} aimed at {{audience}}. Keep it under {{length}} words and end with a call to action.',
    categories: ['marketing', 'social'],
  },
  {
    id: 'seed-2',
    title: "Explain like I'm new",
    body: 'Explain {{topic}} to someone with no background in it. Use one analogy and finish with three questions to check understanding.',
    categories: ['learning'],
  },
  {
    id: 'seed-3',
    title: 'Code review request',
    body: 'Review the following {{language}} code for bugs, readability and accessibility issues. Be specific and suggest fixes.\n\n{{code}}',
    categories: ['coding'],
  },
  {
    id: 'seed-4',
    title: 'Product launch teaser (short)',
    body: 'Write a {{tone}} one-line teaser for {{product}}.',
    categories: ['marketing'],
    sourceId: 'seed-1',
  },
];
