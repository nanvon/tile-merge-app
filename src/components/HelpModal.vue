<script setup lang="ts">
/**
 * 帮助弹窗 - 完整使用文档
 */
import { ref } from "vue";

defineProps<{
  visible: boolean;
}>();

defineEmits<{
  close: [];
}>();

const activeTab = ref<"guide" | "principle" | "features" | "about">("guide");
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal">
          <header class="modal-header">
            <h2 class="modal-title">使用帮助</h2>
            <button class="btn-close" @click="$emit('close')">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <!-- 标签栏 -->
          <nav class="tab-nav">
            <button
              :class="['tab-btn', { active: activeTab === 'guide' }]"
              @click="activeTab = 'guide'"
            >
              🚀 快速开始
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'principle' }]"
              @click="activeTab = 'principle'"
            >
              🔬 合并原理
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'features' }]"
              @click="activeTab = 'features'"
            >
              🖱️ 功能说明
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'about' }]"
              @click="activeTab = 'about'"
            >
              ℹ️ 关于
            </button>
          </nav>

          <div class="modal-body">
            <!-- 快速开始 -->
            <div v-show="activeTab === 'guide'" class="tab-content">
              <section class="help-section">
                <h3>第一步：添加瓦片文件夹</h3>
                <p>
                  点击左侧「<strong>添加文件夹</strong>」按钮，选择包含瓦片的目录。可添加多个文件夹。
                </p>
              </section>

              <section class="help-section">
                <h3>第二步：调整合并顺序</h3>
                <p>使用文件夹卡片右侧的 <strong>⬆️⬇️</strong> 按钮调整顺序。</p>
                <div class="tip-box tip-box--warning">
                  <strong>重要：</strong>列表靠后的文件夹会叠加在靠前的上方！
                </div>
              </section>

              <section class="help-section">
                <h3>第三步：选择输出目录</h3>
                <p>
                  点击「<strong>选择文件夹</strong>」设置合并结果的保存位置。
                </p>
              </section>

              <section class="help-section">
                <h3>第四步：开始合并</h3>
                <p>点击「<strong>开始合并</strong>」按钮，等待进度完成。</p>
              </section>

              <section class="help-section">
                <h3>第五步：预览结果</h3>
                <p>
                  合并完成后，点击「<strong>预览结果</strong>」在地图上查看效果。
                </p>
              </section>

              <section class="help-section">
                <h3>第六步：新建任务</h3>
                <p>
                  如需开始新的合并任务，点击左上角「<strong>新建任务</strong>」。
                </p>
              </section>
            </div>

            <!-- 合并原理 -->
            <div v-show="activeTab === 'principle'" class="tab-content">
              <section class="help-section">
                <h3>📁 瓦片文件夹结构</h3>
                <p>瓦片文件夹必须按照 XYZ 格式组织目录：</p>
                <div class="tip-box tip-box--warning">
                  <strong>重要：仅支持 PNG 格式</strong>的瓦片文件，不支持
                  JPG、WebP 等其他格式。
                </div>
                <pre class="code-block">
瓦片文件夹/
├── {z}/          ← 层级（zoom level）
│   ├── {x}/      ← X 坐标（列号）
│   │   ├── {y}.png  ← Y 坐标（行号）

示例：10/827/373.png
表示层级10、X坐标827、Y坐标373的瓦片</pre
                >
              </section>

              <section class="help-section">
                <h3>🔄 合并逻辑</h3>
                <p>对于每个瓦片位置（z/x/y），程序按以下规则处理：</p>
                <ul class="feature-list">
                  <li><strong>首次处理：</strong>直接复制到输出目录</li>
                  <li>
                    <strong>后续处理：</strong
                    >如果输出目录已存在该位置的瓦片，则进行 Alpha 混合叠加
                  </li>
                </ul>
              </section>

              <section class="help-section">
                <h3>🎨 Alpha 混合算法</h3>
                <p>程序逐像素进行透明度混合：</p>
                <pre class="code-block code-block--formula">
新像素 = 上层像素 × α + 下层像素 × (1 - α)</pre
                >
                <ul class="feature-list">
                  <li><strong>α = 1（完全不透明）：</strong>完全覆盖下层</li>
                  <li>
                    <strong>0 &lt; α &lt; 1（半透明）：</strong
                    >与下层混合产生过渡效果
                  </li>
                  <li><strong>α = 0（完全透明）：</strong>不影响下层</li>
                </ul>
              </section>

              <section class="help-section">
                <h3>✨ 处理顺序</h3>
                <p>按照文件夹列表从上到下的顺序依次处理：</p>
                <div class="order-diagram">
                  <div class="order-item">
                    <span class="order-label">先处理</span>
                    <span class="order-desc">作为「底层」</span>
                  </div>
                  <div class="order-arrow">↓</div>
                  <div class="order-item">
                    <span class="order-label">后处理</span>
                    <span class="order-desc">「叠加」在上层</span>
                  </div>
                </div>
              </section>
            </div>

            <!-- 功能说明 -->
            <div v-show="activeTab === 'features'" class="tab-content">
              <section class="help-section">
                <h3>📁 文件管理区</h3>
                <table class="feature-table">
                  <tr>
                    <td class="feature-name">添加文件夹</td>
                    <td>选择瓦片目录，自动扫描瓦片数量</td>
                  </tr>
                  <tr>
                    <td class="feature-name">预览 👁️</td>
                    <td>在地图上查看该文件夹的瓦片</td>
                  </tr>
                  <tr>
                    <td class="feature-name">上移/下移 ⬆️⬇️</td>
                    <td>调整合并顺序</td>
                  </tr>
                  <tr>
                    <td class="feature-name">移除 ❌</td>
                    <td>从列表中删除</td>
                  </tr>
                </table>
              </section>

              <section class="help-section">
                <h3>🗺️ 地图预览区</h3>
                <table class="feature-table">
                  <tr>
                    <td class="feature-name">定位跳转</td>
                    <td>输入经纬度并点击跳转按钮</td>
                  </tr>
                  <tr>
                    <td class="feature-name">缩放控制</td>
                    <td>点击放大/缩小按钮或使用鼠标滚轮</td>
                  </tr>
                  <tr>
                    <td class="feature-name">获取坐标</td>
                    <td>点击地图任意位置获取经纬度</td>
                  </tr>
                  <tr>
                    <td class="feature-name">底图开关</td>
                    <td>可关闭卫星底图只看瓦片效果</td>
                  </tr>
                </table>
              </section>

              <section class="help-section">
                <h3>⌨️ 快捷键</h3>
                <table class="feature-table">
                  <tr>
                    <td class="feature-name">F12</td>
                    <td>打开开发者工具</td>
                  </tr>
                  <tr>
                    <td class="feature-name">Enter</td>
                    <td>在坐标输入框按回车快速跳转</td>
                  </tr>
                </table>
              </section>

              <section class="help-section">
                <h3>❓ 常见问题</h3>
                <div class="faq-item">
                  <p class="faq-q">Q: 为什么预览看不到瓦片？</p>
                  <p class="faq-a">
                    A: 请检查：① 瓦片坐标是否与地图当前位置对应；②
                    层级是否与当前缩放级别匹配；③ 可关闭卫星底图查看纯瓦片效果。
                  </p>
                </div>
                <div class="faq-item">
                  <p class="faq-q">Q: 合并后部分瓦片缺失？</p>
                  <p class="faq-a">
                    A: 确保所有源文件夹的目录结构正确为 z/x/y.png 格式。
                  </p>
                </div>
                <div class="faq-item">
                  <p class="faq-q">Q: 如何控制叠加效果？</p>
                  <p class="faq-a">
                    A: 通过调整文件夹顺序。后添加的会覆盖在上层。
                  </p>
                </div>
              </section>
            </div>

            <!-- 关于 -->
            <div v-show="activeTab === 'about'" class="tab-content">
              <section class="help-section">
                <h3>ℹ️ 关于</h3>
                <div class="info-grid">
                  <span class="info-label">应用名称</span>
                  <span class="info-value">瓦片地图合并工具</span>
                  <span class="info-label">版本</span>
                  <span class="info-value">v0.1.0</span>
                  <span class="info-label">作者</span>
                  <span class="info-value">nanvon</span>
                  <span class="info-label">技术栈</span>
                  <span class="info-value">Tauri + Vue 3 + Rust</span>
                </div>
              </section>

              <hr class="divider" />

              <section class="help-section">
                <h3>🙏 致谢</h3>
                <p>核心合并逻辑基于以下开源项目开发：</p>
                <ul class="ack-list">
                  <li>
                    <a
                      href="https://github.com/jlmcgraw/aviationCharts/blob/master/merge_tile_sets.pl"
                      target="_blank"
                      >merge_tile_sets.pl</a
                    >
                    <span>by jlmcgraw</span>
                  </li>
                  <li>
                    <a
                      href="https://gis.stackexchange.com/questions/247717"
                      target="_blank"
                      >Stack Exchange GIS</a
                    >
                    <span>ImageMagick 合并思路</span>
                  </li>
                </ul>
              </section>

              <section class="help-section">
                <h3>📄 协议</h3>
                <p>
                  本项目采用
                  <a
                    href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                    target="_blank"
                    >CC BY-NC-SA 4.0</a
                  >
                  协议。
                </p>
                <ul class="license-list">
                  <li class="license-yes">✅ 可自由使用、复制、修改</li>
                  <li class="license-yes">✅ 需注明原作者</li>
                  <li class="license-no">❌ 禁止商业用途</li>
                  <li class="license-warn">⚠️ 衍生作品须使用相同协议</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 200ms ease, opacity 200ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95);
  opacity: 0;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 720px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: none;
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-close:hover {
  background: var(--color-gray-600);
  color: var(--text-primary);
}

.btn-close svg {
  width: 16px;
  height: 16px;
}

/* 标签栏 */
.tab-nav {
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-muted);
  flex-shrink: 0;
}

.tab-btn {
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 150ms ease;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.tab-content {
  animation: fadeIn 200ms ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.help-section {
  margin-bottom: 24px;
}

.help-section:last-child {
  margin-bottom: 0;
}

.help-section h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.help-section p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 10px;
}

.help-section p:last-child {
  margin-bottom: 0;
}

/* 提示框 */
.tip-box {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.tip-box--warning {
  background: var(--color-warning-light);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: var(--color-warning);
}

/* 代码块 */
.code-block {
  padding: 16px;
  background: var(--bg-muted);
  border: 1px solid var(--border-default);
  border-radius: 10px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
}

.code-block--formula {
  background: var(--color-accent-light);
  border-color: rgba(20, 184, 166, 0.3);
  color: var(--color-accent);
  text-align: center;
  font-size: 14px;
  font-weight: 500;
}

/* 功能列表 */
.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  padding: 8px 0;
  padding-left: 20px;
  position: relative;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.feature-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--color-accent);
}

/* 顺序图示 */
.order-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--bg-muted);
  border-radius: 10px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  width: 200px;
}

.order-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.order-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.order-arrow {
  font-size: 18px;
  color: var(--color-accent);
}

/* 功能表格 */
.feature-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.feature-table tr {
  border-bottom: 1px solid var(--border-default);
}

.feature-table tr:last-child {
  border-bottom: none;
}

.feature-table td {
  padding: 10px 0;
  color: var(--text-secondary);
}

.feature-table .feature-name {
  width: 140px;
  font-weight: 500;
  color: var(--text-primary);
}

/* FAQ */
.faq-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-default);
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-q {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px !important;
}

.faq-a {
  color: var(--text-secondary);
}

/* 分隔线 */
.divider {
  border: none;
  border-top: 1px solid var(--border-default);
  margin: 24px 0;
}

/* 关于信息 */
.info-grid {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 8px 16px;
  font-size: 14px;
}

.info-label {
  color: var(--text-muted);
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
}

/* 致谢列表 */
.ack-list {
  list-style: none;
  margin-top: 10px;
  padding: 0;
}

.ack-list li {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 14px;
  padding: 6px 0;
}

.ack-list li::before {
  content: "•";
  color: var(--color-accent);
}

.ack-list a {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: 500;
}

.ack-list a:hover {
  text-decoration: underline;
}

.ack-list span {
  color: var(--text-muted);
}

/* 协议列表 */
.license-list {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}

.license-list li {
  padding: 4px 0;
  font-size: 13px;
}

.license-yes {
  color: var(--color-success);
}

.license-no {
  color: var(--color-error);
}

.license-warn {
  color: var(--color-warning);
}
</style>
