<script setup lang="ts">
/**
 * 通用图标组件
 * 统一管理项目中所有 SVG 图标
 */
import { computed } from "vue";
import {
  iconPaths,
  iconPathsMulti,
  type IconName,
  type IconNameMulti,
} from "../icons";

const props = withDefaults(
  defineProps<{
    /** 图标名称（单路径） */
    name?: IconName;
    /** 图标名称（多路径） */
    multi?: IconNameMulti;
    /** 尺寸: sm=14px, md=16px, lg=18px, xl=20px */
    size?: "sm" | "md" | "lg" | "xl";
    /** 描边宽度 */
    strokeWidth?: number;
    /** 是否填充 */
    filled?: boolean;
  }>(),
  {
    size: "md",
    strokeWidth: 1.5,
    filled: false,
  }
);

const sizeMap = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
};

const iconSize = computed(() => sizeMap[props.size]);
const path = computed(() => (props.name ? iconPaths[props.name] : null));
const paths = computed(() =>
  props.multi ? iconPathsMulti[props.multi] : null
);
</script>

<template>
  <svg
    class="icon"
    :width="iconSize"
    :height="iconSize"
    viewBox="0 0 24 24"
    :fill="filled ? 'currentColor' : 'none'"
    :stroke="filled ? 'none' : 'currentColor'"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- 单路径图标 -->
    <path v-if="path" :d="path" />
    <!-- 多路径图标 -->
    <template v-else-if="paths">
      <path v-for="(p, i) in paths" :key="i" :d="p" />
    </template>
    <!-- 插槽：自定义图标 -->
    <slot v-else />
  </svg>
</template>

<style scoped>
.icon {
  flex-shrink: 0;
  display: inline-block;
  vertical-align: middle;
}
</style>
