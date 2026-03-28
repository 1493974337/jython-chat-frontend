/**
 * 聊天相关类型定义
 */

// 聊天请求DTO
export interface ChatRequest {
  message: string
  sessionId?: string
}

// 聊天响应DTO
export interface ChatResponse {
  response: string
  sessionId: string
}

// 聊天消息类型
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

// 会话信息
export interface SessionInfo {
  id: string
  createdAt: Date
  lastActivity: Date
  messageCount: number
}