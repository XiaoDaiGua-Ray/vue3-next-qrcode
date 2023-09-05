<script setup lang="ts">
import { Vue3NextQrcode } from '../es/index'
import LOGO from './assets/vue.svg'
</script>

<template>
  <Vue3NextQrcode text="hello" />
  <Vue3NextQrcode text="hello" :logoImage="LOGO" />
</template>
