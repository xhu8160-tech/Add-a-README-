import { apiClient } from '@/lib/api-client'
import type { AnalyzeRequest, AnalyzeResponse, MetaResponse } from '@/types/growth'

/** 获取表单选项元数据 */
export async function fetchMeta(): Promise<MetaResponse> {
  const { data } = await apiClient.get<MetaResponse>('/growth/meta')
  return data
}

/**
 * 提交出行信息（含关注事项 / 节奏 / 酒店偏好）生成双板块输出。
 * 传入 spotOverrides 时，后端会在应用点位增删改后重新匹配酒店。
 */
export async function analyzeGrowth(payload: AnalyzeRequest): Promise<AnalyzeResponse> {
  const { data } = await apiClient.post<AnalyzeResponse>('/growth/analyze', payload)
  return data
}
