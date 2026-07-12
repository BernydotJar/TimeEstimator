import type {MetadataRoute} from 'next';

export const dynamic = 'force-static';

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'TimeEstimator';
const basePath = isGithubActions && repositoryName ? `/${repositoryName}` : '';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TimeEstimator',
    short_name: 'TimeEstimator',
    description:
      'RPA effort estimation platform designed by Eduardo Sacahuí, Platform Architect.',
    start_url: `${basePath}/`,
    display: 'standalone',
    background_color: '#07111f',
    theme_color: '#00b7b7',
    icons: [
      {
        src: `${basePath}/time-estimator-icon.svg`,
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
