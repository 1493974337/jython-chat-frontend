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
            <div class="message-body message-text-md" @click="onMarkdownCodeCopyClick($event)">
              <div v-if="message.content.trim().length > 0" class="message-md-root"
                v-html="renderMarkdown(message.content)"></div>
            </div>
            <div class="message-meta-footer">
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              <button type="button" class="icon-copy-btn message-copy-btn" title="复制全文" aria-label="复制整条消息"
                @click="copyWithFeedback(message.content, 'msg-' + index)">
                <svg v-if="copyFeedbackId === 'msg-' + index" class="icon-copy-svg icon-check-svg"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                  stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <svg v-else class="icon-copy-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.055 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M16.5 8.25h1.125c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V9.375c0-.621.504-1.125 1.125-1.125H9.75" />
                </svg>
              </button>
            </div>
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
              <button type="button" class="copy-btn" title="复制会话ID" aria-label="复制会话ID"
                @click="copySessionId">
                <svg v-if="copyFeedbackId === 'session'" class="icon-copy-svg icon-check-svg"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                  stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <svg v-else class="icon-copy-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.055 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M16.5 8.25h1.125c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V9.375c0-.621.504-1.125 1.125-1.125H9.75" />
                </svg>
              </button>
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
import { ref, onMounted, onUpdated, onUnmounted, nextTick } from 'vue'
import { useChatApi } from '../composables/useChatApi'
import { renderMarkdown } from '../utils/markdown'

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

const COPY_FEEDBACK_MS = 1400
const copyFeedbackId = ref<string | null>(null)
let copyFeedbackTimer: ReturnType<typeof setTimeout> | null = null

const clearCopyFeedbackTimer = () => {
  if (copyFeedbackTimer !== null) {
    clearTimeout(copyFeedbackTimer)
    copyFeedbackTimer = null
  }
}

const flashCopyDone = (id: string) => {
  clearCopyFeedbackTimer()
  copyFeedbackId.value = id
  copyFeedbackTimer = setTimeout(() => {
    copyFeedbackId.value = null
    copyFeedbackTimer = null
  }, COPY_FEEDBACK_MS)
}

const copyWithFeedback = (text: string, id: string) => {
  navigator.clipboard.writeText(text).then(
    () => flashCopyDone(id),
    (err: unknown) => {
      console.error('复制失败:', err)
    }
  )
}

const mdCopyTimers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>()

const onMarkdownCodeCopyClick = (e: MouseEvent) => {
  const current = e.currentTarget as HTMLElement | null
  if (!current) return
  const el = e.target as HTMLElement | null
  if (!el) return
  const btn = el.closest('.md-code-copy-btn') as HTMLButtonElement | null
  if (!btn || !current.contains(btn)) return
  e.preventDefault()
  e.stopPropagation()
  const wrap = btn.closest('.code-block-wrap')
  const codeEl = wrap?.querySelector('pre code')
  const text = codeEl?.textContent ?? ''
  const prev = mdCopyTimers.get(btn)
  if (prev !== undefined) clearTimeout(prev)
  navigator.clipboard.writeText(text).then(
    () => {
      btn.classList.add('is-copied')
      const t = setTimeout(() => {
        btn.classList.remove('is-copied')
        mdCopyTimers.delete(btn)
      }, COPY_FEEDBACK_MS)
      mdCopyTimers.set(btn, t)
    },
    (err: unknown) => {
      console.error('复制失败:', err)
    }
  )
}

onUnmounted(() => {
  clearCopyFeedbackTimer()
})

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
  const id = sessionId.value
  if (id) copyWithFeedback(id, 'session')
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

.message-meta-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.5rem;
  width: 100%;
}

.user-message .message-meta-footer {
  justify-content: flex-end;
}

.message-copy-btn {
  flex-shrink: 0;
}

.icon-copy-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border: none;
  border-radius: 0.35rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.65;
  transition: opacity 0.15s, background-color 0.15s;
}

.icon-copy-btn:hover {
  opacity: 1;
  background-color: rgba(15, 23, 42, 0.06);
}

.user-message .icon-copy-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.icon-copy-svg {
  width: 1.125rem;
  height: 1.125rem;
  display: block;
}

.assistant-message .message-meta-footer .icon-check-svg {
  color: #16a34a;
}

.user-message .message-meta-footer .icon-check-svg {
  color: #bbf7d0;
}

.code-copy-btn .icon-check-svg {
  color: #86efac;
}

.copy-btn .icon-check-svg {
  color: #16a34a;
}

.message-body {
  line-height: 1.5;
}

.message-md-root {
  word-wrap: break-word;
}

.message-text-md :deep(p) {
  margin: 0 0 0.5rem;
}

.message-text-md :deep(p:last-child) {
  margin-bottom: 0;
}

.message-text-md :deep(h1),
.message-text-md :deep(h2),
.message-text-md :deep(h3),
.message-text-md :deep(h4) {
  margin: 0.65rem 0 0.35rem;
  font-weight: 700;
  line-height: 1.3;
}

.message-text-md :deep(h1) {
  font-size: 1.2rem;
}

.message-text-md :deep(h2) {
  font-size: 1.1rem;
}

.message-text-md :deep(h3) {
  font-size: 1.05rem;
}

.message-text-md :deep(h4) {
  font-size: 1rem;
}

.message-text-md :deep(h1:first-child),
.message-text-md :deep(h2:first-child),
.message-text-md :deep(h3:first-child),
.message-text-md :deep(h4:first-child) {
  margin-top: 0;
}

.message-text-md :deep(ul),
.message-text-md :deep(ol) {
  margin: 0.35rem 0;
  padding-left: 1.35rem;
}

.message-text-md :deep(li) {
  margin: 0.2rem 0;
}

.message-text-md :deep(blockquote) {
  margin: 0.5rem 0;
  padding: 0.25rem 0 0.25rem 0.75rem;
  border-left: 3px solid rgba(100, 116, 139, 0.45);
  color: inherit;
  opacity: 0.92;
}

.message-text-md :deep(hr) {
  margin: 0.65rem 0;
  border: none;
  border-top: 1px solid rgba(148, 163, 184, 0.5);
}

.message-text-md :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.message-text-md :deep(th),
.message-text-md :deep(td) {
  border: 1px solid rgba(148, 163, 184, 0.55);
  padding: 0.35rem 0.5rem;
  text-align: left;
  vertical-align: top;
}

.message-text-md :deep(thead th) {
  background: rgba(15, 23, 42, 0.06);
  font-weight: 600;
}

.message-text-md :deep(code:not(.code-inner)) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.88em;
  padding: 0.1rem 0.35rem;
  border-radius: 0.25rem;
  background: rgba(15, 23, 42, 0.08);
}

.message-text-md :deep(.code-block-wrap) {
  margin: 0.5rem 0;
}

.message-text-md .message-md-root > :deep(.code-block-wrap:first-child) {
  margin-top: 0;
}

.assistant-message .message-text-md :deep(a) {
  color: #4f46e5;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.assistant-message .message-text-md :deep(a:hover) {
  color: #4338ca;
}

.user-message .message-text-md :deep(a) {
  color: #e0e7ff;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.user-message .message-text-md :deep(a:hover) {
  color: #ffffff;
}

.user-message .message-text-md :deep(code:not(.code-inner)) {
  background: rgba(0, 0, 0, 0.2);
}

.user-message .message-text-md :deep(blockquote) {
  border-left-color: rgba(255, 255, 255, 0.45);
}

.user-message .message-text-md :deep(hr) {
  border-top-color: rgba(255, 255, 255, 0.35);
}

.user-message .message-text-md :deep(th),
.user-message .message-text-md :deep(td) {
  border-color: rgba(255, 255, 255, 0.35);
}

.user-message .message-text-md :deep(thead th) {
  background: rgba(0, 0, 0, 0.15);
}

.code-block-wrap {
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.12);
}

.assistant-message .code-block-wrap {
  background: #0f172a;
  border-color: rgba(15, 23, 42, 0.2);
}

.user-message .code-block-wrap {
  background: rgba(15, 23, 42, 0.25);
  border-color: rgba(255, 255, 255, 0.25);
}

.code-block-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  font-size: 0.7rem;
  background: rgba(0, 0, 0, 0.2);
}

.user-message .code-block-toolbar {
  background: rgba(0, 0, 0, 0.15);
}

.code-lang {
  font-family: ui-monospace, monospace;
  text-transform: lowercase;
  opacity: 0.85;
  color: #e2e8f0;
}

.code-lang-placeholder {
  opacity: 0.6;
}

.code-copy-btn {
  opacity: 0.85;
  color: #e2e8f0;
}

.code-copy-btn:hover {
  background-color: rgba(255, 255, 255, 0.12) !important;
}

.md-code-copy-btn .md-check-icon-slot {
  display: none;
}

.md-code-copy-btn.is-copied .md-copy-icon-slot {
  display: none;
}

.md-code-copy-btn.is-copied .md-check-icon-slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.code-copy-btn .md-check-svg {
  color: #86efac;
}

.code-pre {
  margin: 0;
  padding: 0.65rem 0.75rem;
  overflow-x: auto;
  max-width: 100%;
}

.code-inner {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8125rem;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
  color: #f1f5f9;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.6;
  flex: 1;
  min-width: 0;
}

.user-message .message-time {
  text-align: right;
  flex: 0 1 auto;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
  color: #475569;
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
