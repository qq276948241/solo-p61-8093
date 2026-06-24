<script setup>
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { computed } from 'vue'

const router = useRouter()
const orderStore = useOrderStore()

function formatDate(isoStr) {
  const d = new Date(isoStr)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function specsText(specs) {
  return Object.values(specs).join(' · ')
}

function goToDetail(orderId) {
  router.push({ name: 'order-detail', params: { id: orderId } })
}

const sortedOrders = computed(() => orderStore.sortedOrders)
</script>

<template>
  <div class="orders-page">
    <div v-if="sortedOrders.length === 0" class="empty-state">
      <div class="empty-icon">📜</div>
      <p class="empty-text">暂无订单</p>
      <p class="empty-sub">点一杯开启半日闲</p>
      <button class="go-menu-btn" @click="router.push('/menu')">
        去点单
      </button>
    </div>

    <div v-else class="order-list">
      <div
        v-for="order in sortedOrders"
        :key="order.id"
        class="order-card"
        @click="goToDetail(order.id)"
      >
        <div class="order-header">
          <span class="order-time">{{ formatDate(order.createdAt) }}</span>
          <span class="order-status">{{ order.status }}</span>
        </div>

        <div class="order-items-preview">
          <div class="thumb-list">
            <img
              v-for="(item, idx) in order.items.slice(0, 4)"
              :key="idx"
              :src="item.image"
              :alt="item.name"
              class="thumb"
            />
            <div v-if="order.items.length > 4" class="thumb more">
              +{{ order.items.length - 4 }}
            </div>
          </div>
          <div class="order-summary">
            <p class="order-names">
              {{ order.items.map(i => i.name).join('、') }}
            </p>
          </div>
        </div>

        <div class="order-footer">
          <span class="order-count">共{{ order.totalCount }}件</span>
          <span class="order-total">
            合计 <small>¥</small>{{ order.totalPrice }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  height: 100%;
  overflow-y: auto;
  background: var(--color-bg);
  padding: 12px 16px 24px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-bottom: 60px;
}

.empty-icon {
  font-size: 72px;
  opacity: 0.4;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 17px;
  color: var(--color-text);
  font-weight: 500;
  letter-spacing: 2px;
  margin-bottom: 6px;
}

.empty-sub {
  font-size: 13px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
  margin-bottom: 28px;
}

.go-menu-btn {
  padding: 12px 40px;
  background: var(--color-primary);
  color: var(--color-white);
  border-radius: 24px;
  font-size: 14px;
  letter-spacing: 3px;
  font-weight: 500;
  transition: var(--transition);
}

.go-menu-btn:hover {
  background: var(--color-primary-dark);
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.order-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: 14px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: var(--transition);
}

.order-card:active {
  transform: scale(0.98);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
}

.order-time {
  font-size: 13px;
  color: var(--color-text-muted);
}

.order-status {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-success);
  background: rgba(124, 179, 66, 0.1);
  padding: 3px 10px;
  border-radius: 10px;
  letter-spacing: 1px;
}

.order-items-preview {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.thumb-list {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.thumb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  background: var(--color-bg-warm);
}

.thumb.more {
  background: var(--color-bg-warm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: 600;
}

.order-summary {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.order-names {
  font-size: 13px;
  color: var(--color-text-light);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
}

.order-count {
  font-size: 12px;
  color: var(--color-text-muted);
}

.order-total {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
}

.order-total small {
  font-size: 12px;
  font-weight: 500;
}
</style>
