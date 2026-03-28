<template>
  <div class="chat-container">
    <header class="chat-header">
      <div class="chat-header-inner">
        <h1 class="chat-title">Jython AI助手</h1>
      </div>
    </header>

    <!-- 聊天区域 -->
    <div class="chat-main">
      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <div v-for="(message, index) in messages" :key="index" class="message-wrapper"
          :class="{ 'user-message': message.role === 'user', 'assistant-message': message.role === 'assistant' }">
          <div class="message-avatar">
            <div v-if="message.role === 'user'" class="avatar user-avatar">👤</div>
            <div v-else class="avatar assistant-avatar">🤖</div>
          </div>
          <div class="message-content">
            <div class="message-role">{{ message.role === 'user' ? '你' : 'AI助手' }}</div>
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>

        <!-- 加载指示器 -->
        <div v-if="loading" class="loading-indicator">
          <div class="spinner"></div>
          <span>AI正在思考...</span>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <div class="input-wrapper">
          <textarea v-model="inputMessage" placeholder="输入你的问题..." rows="3" class="message-input"
            :disabled="loading"></textarea>
          <div class="input-actions">
            <div class="session-info" v-if="sessionId">
              会话ID: <code>{{ sessionId }}</code>
              <button @click="copySessionId" class="copy-btn" title="复制会话ID">📋</button>
              <button @click="newSession" class="new-session-btn" title="新建会话">🔄</button>
            </div>
            <button @click="sendMessage" :disabled="!inputMessage.trim() || loading" class="send-btn">
              {{ loading ? '发送中...' : '发送' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <footer class="brand-footer">Jython AI助手</footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUpdated, nextTick } from 'vue'
import { useChatApi } from '../composables/useChatApi'

// 消息类型定义
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// 响应式数据
const inputMessage = ref('')
const messages = ref<ChatMessage[]>([])
const loading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

// 使用聊天API组合式函数
const { sessionId, sendChatMessage, startNewSession } = useChatApi()

// 初始化：加载示例对话或欢迎消息
onMounted(() => {
  if (messages.value.length === 0) {
    messages.value.push({
      role: 'assistant',
      content: '你好！我是Jython编程助手，专门帮助解决Jython编程问题。请问有什么可以帮您的？',
      timestamp: new Date()
    })
  }
})

// 自动滚动到最新消息
onUpdated(() => {
  scrollToBottom()
})

// 发送消息
const sendMessage = async () => {
  const text = inputMessage.value.trim()
  if (!text || loading.value) return

  // 添加用户消息
  const userMessage: ChatMessage = {
    role: 'user',
    content: text,
    timestamp: new Date()
  }
  messages.value.push(userMessage)

  // 清空输入框
  inputMessage.value = ''

  loading.value = true

  try {
    // 非流式：POST /api/conversation/chat
    const reply = await sendChatMessage(text)
    messages.value.push({
      role: 'assistant',
      content: reply,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('发送消息失败:', error)
    messages.value.push({
      role: 'assistant',
      content: `抱歉，消息发送失败：${error instanceof Error ? error.message : '未知错误'}`,
      timestamp: new Date()
    })
  } finally {
    loading.value = false
  }
}

// 格式化消息内容（将换行符转换为<br>）
const formatMessage = (content: string) => {
  return content.replace(/\n/g, '<br>')
}

// 格式化时间显示
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 复制会话ID
const copySessionId = () => {
  if (sessionId.value) {
    navigator.clipboard.writeText(sessionId.value)
      .then(() => {
        alert('会话ID已复制到剪贴板')
      })
      .catch(err => {
        console.error('复制失败:', err)
      })
  }
}

// 新建会话
const newSession = () => {
  if (confirm('确定要开始新的会话吗？当前对话历史将丢失。')) {
    startNewSession()
    messages.value = [{
      role: 'assistant',
      content: '新的会话已开始。你好！我是Jython编程助手，专门帮助解决Jython编程问题。请问有什么可以帮您的？',
      timestamp: new Date()
    }]
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f1f5f9;
}

.chat-header {
  position: relative;
  flex-shrink: 0;
  padding: 1.25rem 1.5rem 1.35rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: #0f172a;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
}

.chat-header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: linear-gradient(90deg, #6366f1 0%, #7c3aed 50%, #a855f7 100%);
}

.chat-header-inner {
  max-width: 42rem;
  margin: 0 auto;
  text-align: center;
}

.chat-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: #0f172a;
}

.subtitle {
  margin: 0.4rem 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #64748b;
  font-weight: 500;
}

.brand-footer {
  flex-shrink: 0;
  padding: 0.65rem 1rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: #94a3b8;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background-color: white;
}

.message-wrapper {
  display: flex;
  margin-bottom: 1.5rem;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  margin: 0 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.user-avatar {
  background-color: #667eea;
  color: white;
}

.assistant-avatar {
  background-color: #10b981;
  color: white;
}

.message-content {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  position: relative;
}

.user-message .message-content {
  background-color: #667eea;
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.assistant-message .message-content {
  background-color: #f3f4f6;
  color: #1f2937;
  border-bottom-left-radius: 0.25rem;
}

.message-role {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  opacity: 0.8;
}

.user-message .message-role {
  text-align: right;
}

.message-text {
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.6;
  margin-top: 0.5rem;
}

.user-message .message-time {
  text-align: right;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: #6b7280;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.input-container {
  padding: 1rem 1.5rem;
  background-color: white;
  border-top: 1px solid #e5e7eb;
}

.input-wrapper {
  position: relative;
}

.message-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.message-input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.session-info code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: monospace;
}

.copy-btn,
.new-session-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.copy-btn:hover,
.new-session-btn:hover {
  background-color: #f3f4f6;
}

.send-btn {
  padding: 0.5rem 1.5rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-btn:hover:not(:disabled) {
  background-color: #5a67d8;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }

  .chat-title {
    font-size: 1.25rem;
  }

  .subtitle {
    font-size: 0.8125rem;
  }
}
</style>
