import { ref } from 'vue'

// API基础URL（根据实际后端地址配置）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * 聊天API组合式函数
 * 提供与jython-helper后端通信的功能
 */
export function useChatApi() {
  // 会话ID（用于保持对话上下文）
  const sessionId = ref<string>('')

  /**
   * 生成新的会话ID
   */
  const generateSessionId = (): string => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
  }

  /**
   * 开始新的会话
   */
  const startNewSession = () => {
    sessionId.value = generateSessionId()
    console.log('新会话ID:', sessionId.value)
  }

  // 如果没有会话ID，初始化一个
  if (!sessionId.value) {
    startNewSession()
  }

  /**
   * 发送普通聊天消息（非流式）
   * @param message 用户消息
   * @returns Promise<string> AI回复
   */
  const sendChatMessage = async (message: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversation/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: sessionId.value
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`)
      }

      const data = await response.json()

      // 更新会话ID（如果后端返回了新的）
      if (data.sessionId) {
        sessionId.value = data.sessionId
      }

      return data.response
    } catch (error) {
      console.error('发送聊天消息失败:', error)
      throw error
    }
  }

  /**
   * 发送流式聊天消息（Server-Sent Events）
   * @param message 用户消息
   * @param onChunk 接收到数据块时的回调函数
   * @returns Promise<void>
   */
  const sendStreamingMessage = async (
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/conversation/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            sessionId: sessionId.value
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`)
        }

        if (!response.body) {
          throw new Error('响应体为空')
        }

        // 使用TextDecoder解析流
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              break
            }

            // 解码数据块
            const chunk = decoder.decode(value, { stream: true })

            // 解析Server-Sent Events格式
            const lines = chunk.split('\n')
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.substring(6) // 移除"data: "前缀
                if (data.trim()) {
                  onChunk(data)
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
        }

        resolve()
      } catch (error) {
        console.error('发送流式消息失败:', error)
        reject(error)
      }
    })
  }

  /**
   * 测试后端连接
   * @returns Promise<boolean> 连接是否成功
   */
  const testConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/test`, {
        method: 'GET'
      })
      return response.ok
    } catch (error) {
      console.error('测试连接失败:', error)
      return false
    }
  }

  return {
    sessionId,
    sendChatMessage,
    sendStreamingMessage,
    startNewSession,
    testConnection
  }
}