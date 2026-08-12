<!--
 * Nuxt 4 使用示例（保存为 app/pages/qrcode.vue）
 *
 * 安装：
 * npm install vue3-next-qrcode
 *
 * 注意：组件必须在客户端渲染，使用 <ClientOnly> 包裹
 -->

<template>
  <div class="nuxt-qrcode-example">
    <h1>Vue3 Next QRCode - Nuxt 4 示例</h1>

    <!-- 方法 1: 使用 ClientOnly 包裹普通组件 -->
    <section class="example-section">
      <h2>方法 1: 使用 ClientOnly</h2>
      <ClientOnly>
        <Vue3NextQrcode :text="qrText" :size="200" colorDark="#1677ff" />
        <template #fallback>
          <div class="loading">加载中...</div>
        </template>
      </ClientOnly>
    </section>

    <!-- 方法 2: 使用 QRCodeClient 组件（推荐） -->
    <section class="example-section">
      <h2>方法 2: 使用 QRCodeClient（推荐）</h2>
      <ClientOnly>
        <QRCodeClient :text="qrText" :size="200" colorLight="#f0f0f0" />
        <template #fallback>
          <div class="qrcode-fallback" aria-label="二维码加载中" />
        </template>
      </ClientOnly>
    </section>

    <!-- 方法 3: 使用 useQRCode Hook -->
    <section class="example-section">
      <h2>方法 3: 使用 useQRCode Hook</h2>
      <div class="controls">
        <input
          v-model="customText"
          type="text"
          placeholder="输入文本"
          class="input"
        />
        <button @click="handleGenerate" :disabled="isLoading">
          {{ isLoading ? '生成中...' : '生成二维码' }}
        </button>
        <button @click="cancel">取消</button>
        <button @click="reset">重置</button>
      </div>
      <p>状态：{{ status }}</p>
      <ClientOnly>
        <div v-if="qrcodeURL" class="qrcode-result">
          <img :src="qrcodeURL as string" alt="Generated QR Code" />
        </div>
        <div v-if="error" class="error">{{ error.message }}</div>
      </ClientOnly>
    </section>

    <!-- 方法 4: 动态导入组件 -->
    <section class="example-section">
      <h2>方法 4: 动态导入</h2>
      <LazyQRCode v-if="mounted" :text="qrText" :size="200" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue'
import {
  QRCodeGenerationCancelledError,
  Vue3NextQrcode,
  useQRCode,
} from 'vue3-next-qrcode'
import { QRCodeClient } from 'vue3-next-qrcode/client'
// 显式导入样式，避免 ClientOnly 默认插槽的 CSS 被服务端构建 tree-shake。
import 'vue3-next-qrcode/style.css'

// 动态导入组件（方法 4）
const LazyQRCode = defineAsyncComponent(() =>
  import('vue3-next-qrcode/client').then((m) => m.QRCodeClient),
)

const qrText = ref('https://github.com/XiaoDaiGua-Ray/vue3-next-qrcode')
const customText = ref('Hello Nuxt 4!')
const mounted = ref(false)

// 使用 useQRCode Hook
const { qrcodeURL, isLoading, status, error, generate, cancel, reset } =
  useQRCode({ concurrency: 'latest' })

const handleGenerate = async () => {
  try {
    await generate({
      text: customText.value,
      size: 200,
      margin: 20,
    })
  } catch (cause) {
    if (!(cause instanceof QRCodeGenerationCancelledError)) throw cause
  }
}

onMounted(() => {
  mounted.value = true
})
</script>

<style scoped>
.nuxt-qrcode-example {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

.example-section {
  margin-bottom: 3rem;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.example-section h2 {
  margin-top: 0;
  color: #555;
}

.loading {
  padding: 2rem;
  text-align: center;
  color: #999;
}

.qrcode-fallback {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  background: #f2f4f7;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 0.5rem 1rem;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.qrcode-result {
  text-align: center;
  margin-top: 1rem;
}

.qrcode-result img {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  background: white;
}

.error {
  padding: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  color: #c00;
  border-radius: 4px;
}
</style>
