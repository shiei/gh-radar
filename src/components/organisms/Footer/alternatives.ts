/** Other tools that cover what this radar deliberately does not. */
export const ALTERNATIVES = [
  { id: 'githubSearch', name: 'GitHub Search', url: 'https://github.com/search' },
  { id: 'githubTrending', name: 'GitHub Trending', url: 'https://github.com/trending' },
  { id: 'grepApp', name: 'grep.app', url: 'https://grep.app' },
  { id: 'sourcegraph', name: 'Sourcegraph', url: 'https://sourcegraph.com/search' },
  { id: 'ossInsight', name: 'OSS Insight', url: 'https://ossinsight.io' },
  { id: 'librariesIo', name: 'Libraries.io', url: 'https://libraries.io' },
] as const

export type AlternativeId = (typeof ALTERNATIVES)[number]['id']

export const PROJECT_URL = 'https://github.com/shiei/gh-radar'
