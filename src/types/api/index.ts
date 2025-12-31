/**
 * API types barrel export
 *
 * This file provides a single import point for all API-related types,
 * improving developer experience and maintaining clean import statements.
 */

// Search API types
export type {
  TypesenseSlideResult,
  TypesenseSearchResponse,
  SearchResult,
  SearchOptions,
  SearchFilters,
  SearchMetadata,
} from './search'

// Upload API types
export type {
  UploadProgress,
  UploadState,
  UploadResult,
  PowerPointUploadProps,
  UploadModalProps,
  UploadConfig,
  UploadEventHandlers,
} from './upload'
