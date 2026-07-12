import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const repository = process.env.GITHUB_REPOSITORY ?? 'BernydotJar/TimeEstimator';
const [repositoryOwner = 'BernydotJar', repositoryName = 'TimeEstimator'] =
  repository.split('/');
const ownerSlug = repositoryOwner.toLowerCase();
const basePath = isGithubActions && repositoryName ? `/${repositoryName}` : '';
const siteUrl = `https://${ownerSlug}.github.io/${repositoryName}`;
const iconPath = `${basePath}/time-estimator-icon.svg`;

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TimeEstimator | Cinematic RPA Command Center',
    template: '%s | TimeEstimator',
  },
  description:
    'Cinematic RPA effort-estimation command center for discovery workshops, executive sizing reviews, and delivery handoffs.',
  applicationName: 'TimeEstimator',
  keywords: [
    'RPA estimation',
    'time estimator',
    'automation delivery',
    'effort planning',
    'Eduardo Sacahuí',
    'platform architect',
  ],
  authors: [{name: 'Eduardo Sacahuí'}],
  creator: 'Eduardo Sacahuí',
  publisher: 'Eduardo Sacahuí',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'TimeEstimator',
    title: 'TimeEstimator | Cinematic RPA Command Center',
    description:
      'Run RPA discovery, estimation, assumptions, and executive reporting from one cinematic command center.',
    images: [
      {
        url: `${siteUrl}/time-estimator-icon.svg`,
        width: 512,
        height: 512,
        alt: 'TimeEstimator icon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TimeEstimator | Cinematic RPA Command Center',
    description:
      'Speed up RPA estimation cycles with consistent calculations and polished reports.',
    images: [`${siteUrl}/time-estimator-icon.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: iconPath,
    shortcut: iconPath,
    apple: iconPath,
  },
  manifest: `${basePath}/manifest.webmanifest`,
  category: 'technology',
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Eduardo Sacahuí',
  jobTitle: 'Platform Architect',
  url: siteUrl,
  worksFor: {
    '@type': 'Organization',
    name: 'Independent',
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'TimeEstimator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  creator: {
    '@type': 'Person',
    name: 'Eduardo Sacahuí',
  },
  description:
    'Web app to automate and accelerate RPA effort estimation with configurable formulas and reports.',
  url: siteUrl,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(personSchema)}}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(softwareSchema)}}
        />
        {children}
      </body>
    </html>
  );
}
