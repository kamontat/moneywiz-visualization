import type {
	BootstrapProgress,
	BootstrapResult,
	StatusResult,
	UploadProgress,
	UploadResult,
} from '../types/index.js'

// --- Requests (main thread → worker) ---

export interface BootstrapRequest {
	type: 'bootstrap'
	id: string
}

export interface UploadRequest {
	type: 'upload'
	id: string
	file: File
}

export interface ClearRequest {
	type: 'clear'
	id: string
}

export interface StatusRequest {
	type: 'status'
	id: string
}

export interface QueryRequest {
	type: 'query'
	id: string
	sql: string
	params?: unknown[]
}

export type WorkerRequest =
	| BootstrapRequest
	| UploadRequest
	| ClearRequest
	| StatusRequest
	| QueryRequest

// --- Responses (worker → main thread) ---

export interface ProgressResponse {
	type: 'progress'
	id: string
	progress: BootstrapProgress | UploadProgress
}

export interface BootstrapResponse {
	type: 'bootstrap'
	id: string
	result: BootstrapResult
}

export interface UploadResponse {
	type: 'upload'
	id: string
	result: UploadResult
}

export interface ClearResponse {
	type: 'clear'
	id: string
	success: boolean
}

export interface StatusResponse {
	type: 'status'
	id: string
	result: StatusResult
}

export interface QueryResponse {
	type: 'query'
	id: string
	rows: unknown[]
}

export interface ErrorResponse {
	type: 'error'
	id: string
	message: string
}

export type WorkerResponse =
	| ProgressResponse
	| BootstrapResponse
	| UploadResponse
	| ClearResponse
	| StatusResponse
	| QueryResponse
	| ErrorResponse
