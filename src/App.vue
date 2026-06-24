<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const tabs = [
  { path: '/menu', name: '点单', icon: '☕' },
  { path: '/cart', name: '购物车', icon: '🛒' },
  { path: '/orders', name: '订单', icon: '📜' }
]

const activePath = computed(() => route.path.split('/')[1] || 'menu')

const currentTitle = computed(() => {
  if (route.path.startsWith('/orders/')) return '订单详情'
  const tab = tabs.find(t => t.path === route.path)
  return tab ? tab.name : '半日闲'
})
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <button
        v-if="route.path.startsWith('/orders/')"
        class="back-btn"
        @click="router.back()"
      >
        ←
      </button>
      <h1 class="app-title">{{ currentTitle }}</h1>
      <div class="header-right">
        <span class="brand">半日闲</span>
      </div>
    </header>

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <nav class="app-tabbar">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="tab-item"
        :class="{ active: activePath === tab.path.slice(1) }"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-name">{{ tab.name }}</span>
        <span v-if="tab.path === '/cart' && cartStore.totalCount > 0" class="tab-badge">
          {{ cartStore.totalCount > 99 ? '99+' : cartStore.totalCount }}
        </span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 768px;
  margin: 0 auto;
  background: var(--color-bg);
  position: relative;
}

.app-header {
  flex-shrink: 0;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  position: relative;
}

.back-btn {
  position: absolute;
  left: 12px;
  width: 36px;
  height: 36px;
  font-size: 20px;
  color: var(--color-primary);
  border-radius: 50%;
  transition: var(--transition);
}

.back-btn:hover {
  background: var(--color-bg-warm);
}

.app-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary-dark);
  letter-spacing: 2px;
}

.header-right {
  min-width: 60px;
  text-align: right;
}

.brand {
  font-size: 13px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

.app-main {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.app-tabbar {
  flex-shrink: 0;
  height: 64px;
  display: flex;
  background: var(--color-white);
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--color-text-muted);
  transition: var(--transition);
  position: relative;
}

.tab-item.active {
  color: var(--color-primary);
}

.tab-icon {
  font-size: 22px;
}

.tab-name {
  font-size: 12px;
  letter-spacing: 1px;
}

.tab-badge {
  position: absolute;
  top: 8px;
  right: 50%;
  transform: translateX(16px);
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--color-primary);
  color: var(--color-white);
  border-radius: 9px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (min-width: 769px) {
  .app-layout {
    box-shadow: var(--shadow-lg);
  }
}
</style>
