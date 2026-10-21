export type { GitHubError, GitHubErrorKind, Result } from './errors'
export { isGitHubError } from './errors'
export { buildHeaders, GITHUB_API_BASE } from './headers'
export type { RateLimit } from './rateLimit'
export { getRateLimit, parseRateLimit, setRateLimit, subscribeRateLimit } from './rateLimit'
export { buildSearchPath, composeQuery, search, searchRepositories } from './search'
export type { SearchPathParams } from './search'
export { searchTopics } from './topics'
export type { TopicsSearchResult } from './topics'
export type {
  AnySearchResult,
  MinStars,
  Repository,
  SearchFilters,
  SearchParams,
  SearchRequest,
  SearchResult,
  SearchSort,
  SearchType,
  TopicResult,
  UserResult,
} from './types'
export {
  DEFAULT_FILTERS,
  MAX_PAGE,
  MAX_RESULTS,
  MIN_STARS_OPTIONS,
  PAGE_SIZE,
  SEARCH_TYPES,
} from './types'
export { searchUsers } from './users'
export type { UsersSearchResult } from './users'
export type { Activity } from './signals'
export { activityOf } from './signals'
export {
  clearToken,
  getToken,
  getTokenState,
  resetTokenForTests,
  setToken,
  subscribeToken,
  TOKEN_STORAGE_KEY,
} from './token'
export type { TokenState } from './token'
export { validateToken } from './validateToken'
