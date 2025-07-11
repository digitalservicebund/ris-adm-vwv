import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ValidationError } from '@/components/input/types'
import errorMessages from '@/i18n/errors.json'
import { useAuthentication } from '@/services/auth.ts'

type RequestOptions = {
  headers?: {
    Accept?: string
    'Content-Type'?: string
    'X-Filename'?: string
    'X-API-KEY'?: string
  }
  params?: {
    [key: string]: string
  }
  timeout?: number
}

interface HttpClient {
  get<TResponse>(url: string, config?: RequestOptions): Promise<ServiceResponse<TResponse>>

  post<TRequest, TResponse>(
    url: string,
    config?: RequestOptions,
    data?: TRequest,
  ): Promise<ServiceResponse<TResponse>>

  put<TRequest, TResponse>(
    url: string,
    config?: RequestOptions,
    data?: TRequest,
  ): Promise<ServiceResponse<TResponse>>
}

export const axiosInstance = axios.create()
export const API_PREFIX = `/api/`

axiosInstance.interceptors.request.use((config) => {
  const { isConfigured, addAuthorizationHeader } = useAuthentication()
  if (isConfigured()) {
    config.headers = addAuthorizationHeader(config.headers) as any
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const { tryRefresh } = useAuthentication()
      const refreshed = await tryRefresh()
      if (refreshed) {
        return axiosInstance(originalRequest)
      }
    }
    return Promise.reject(error)
  },
)

async function baseHttp<T>(url: string, method: string, options?: RequestOptions, data?: T) {
  try {
    const response = await axiosInstance.request({
      method: method,
      url: `${API_PREFIX}${url}`,
      validateStatus: () => true,
      data,
      ...options,
    })
    return {
      status: response.status,
      data:
        response.data.content && !response.data.pageable ? response.data.content : response.data,
    }
  } catch (error) {
    let errorCode = (error as AxiosError).code
    if (errorCode === 'ECONNABORTED') {
      errorCode = '504'
    }
    return {
      status: Number(errorCode) || 500,
      error: {
        title: (error as AxiosError).status?.toString() ?? errorMessages.NETWORK_ERROR.title,
        description: String((error as AxiosError).cause),
      },
    }
  }
}

const httpClient: HttpClient = {
  async get(url: string, options?: RequestOptions) {
    return baseHttp(url, 'get', { ...options })
  },
  async post<T>(url: string, options: RequestOptions, data: T) {
    return baseHttp<T>(url, 'post', { ...options }, data)
  },
  async put<T>(url: string, options: RequestOptions, data: T) {
    return baseHttp<T>(url, 'put', { ...options }, data)
  },
}

export type FailedValidationServerResponse = {
  errors: ValidationError[]
}

export type ResponseError = {
  title: string
  description?: string | string[]
  validationErrors?: ValidationError[]
}

export type ServiceResponse<T> = {
  status: number
} & (
  | {
      data: T
      error?: never
    }
  | {
      data?: never
      error: ResponseError
    }
)

export default httpClient
