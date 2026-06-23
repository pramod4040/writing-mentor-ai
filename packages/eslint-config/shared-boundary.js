import base from './base.js';

export default [
  ...base,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: '@prisma/client', message: 'DB models must stay in apps/api only.' },
            { name: 'mongoose', message: 'Mongoose schemas must stay in apps/api only.' },
          ],
          patterns: [{ group: ['@nestjs/*'], message: 'NestJS imports forbidden in packages/shared.' }],
        },
      ],
    },
  },
];
