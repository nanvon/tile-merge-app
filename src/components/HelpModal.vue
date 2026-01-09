<script setup lang="ts">
/**
 * 帮助弹窗 - 完整内容
 */
defineProps<{
  visible: boolean;
}>();

defineEmits<{
  close: [];
}>();
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

          <div class="modal-body">
            <section class="help-section">
              <h3>📁 文件夹格式</h3>
              <p>瓦片文件夹应包含以层级数字命名的子目录：</p>
              <pre class="code-block">
瓦片文件夹/
├── 10/          ← 层级 10
│   ├── 827/     ← X 坐标
│   │   ├── 373.png
│   │   └── 374.png
├── 11/
└── ...</pre
              >
            </section>

            <section class="help-section">
              <h3>🔄 合并顺序</h3>
              <p>
                后添加的文件夹会<strong>覆盖</strong>先添加的（在重叠区域）。可通过上下箭头调整顺序。
              </p>
            </section>

            <section class="help-section">
              <h3>🗺️ 地图预览</h3>
              <p>点击预览按钮可查看瓦片效果，底图使用高德卫星图。</p>
            </section>

            <hr class="divider" />

            <section class="help-section">
              <h3>ℹ️ 关于</h3>
              <div class="info-grid">
                <span class="info-label">作者</span>
                <span class="info-value">nanvon</span>
                <span class="info-label">版本</span>
                <span class="info-value">v0.1.0</span>
              </div>
            </section>

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
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 660px;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #111827;
}

.btn-close svg {
  width: 16px;
  height: 16px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
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
  color: #111827;
  margin-bottom: 10px;
}

.help-section p {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 10px;
}

.help-section p:last-child {
  margin-bottom: 0;
}

.code-block {
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  font-family: "SF Mono", Consolas, monospace;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
}

.divider {
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 24px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 6px 16px;
  font-size: 14px;
}

.info-label {
  color: #9ca3af;
}

.info-value {
  color: #111827;
  font-weight: 500;
}

.ack-list {
  list-style: none;
  margin-top: 10px;
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
  color: #10b981;
}

.ack-list a {
  color: #10b981;
  text-decoration: none;
  font-weight: 500;
}

.ack-list a:hover {
  text-decoration: underline;
}

.ack-list span {
  color: #9ca3af;
}
</style>
