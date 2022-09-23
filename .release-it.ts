import type { Config } from 'release-it';

export default {
  git: {
    commit: true,
    tag: true,
    push: true,
  },
  github: {
    release: true,
  },
  hooks: {
    'before:init': 'npm run test:lint',
    'before:release': 'npm run build && npm run doc:html && npm run doc:publish',
  },
  npm: {
    publish: true,
  },
  plugins: {
    '@release-it/conventional-changelog': {
      preset: {
        name: 'conventionalcommits',
      },
      infile: 'CHANGELOG.md',
    },
  },
} satisfies Config;
