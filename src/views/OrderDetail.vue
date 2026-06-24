<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const orderId = route.params.id
const order = computed(() => orderStore.getOrderById(orderId))

function formatDate(isoStr) {
  const d = new Date(isoStr)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function specsText(specs) {
  return Object.entries(specs)
    .map(([k, v]) => `${k} ${v}`)
    .join(' · ')
}
</script>

<template>
  <div class="order-detail-page" v-if="order">
    <div class="status-banner">
      <span class="status-icon">✓</span>
      <div class="status-text">
        <p class="status-title">{{ order.status }}</p>
        <p class="status-sub">请在吧台凭取餐号领取</p>
      </div>
    </div>

    <div class="order-id-section">
      <span class="label">取餐号</span>
      <span class="order-id">#{{ order.id.slice(-4) }}</span>
    </div>

    <div class="section">
      <h3 class="section-title">商品清单</h3>
      <div class="item-list">
        <div
          v-for="item in order.items"
          :key="item.id"
          class="detail-item"
        >
          <img :src="item.image" :alt="item.name" class="item-img" />
          <div class="item-info">
            <h4 class="item-name">{{ item.name }}</h4>
            <p class="item-specs">{{ specsText(item.specs) }}</p>
            <div class="item-bottom">
              <span class="item-price"><small>¥</small>{{ item.price }}</span>
              <span class="item-qty">×{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">订单信息</h3>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">订单号</span>
          <span class="info-value">{{ order.id }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">下单时间</span>
          <span class="info-value">{{ formatDate(order.createdAt) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">商品件数</span>
          <span class="info-value">{{ order.totalCount }} 件</span>
        </div>
        <div class="info-row total-row">
          <span class="info-label">订单金额</span>
          <span class="info-value total-value">
            <small>¥</small>{{ order.totalPrice }}
          </span>
        </div>
      </div>
    </div>

    <div class="footer-actions">
      <button class="menu-btn" @click="router.push('/menu')">
        继续点单
      </button>
      <button class="orders-btn" @click="router.push('/orders')">
        查看订单
      </button>
    </div>
  </div>

  <div v-else class="not-found">
    <p class="not-found-text">订单不存在</p>
    <button class="back-btn" @click="router.replace('/orders')">
      返回订单列表
    </button>
  </div>
</template>

<style scoped>
.order-detail-page {
  height: 100%;
  overflow-y: auto;
  background: var(--color-bg);
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
}

.status-banner {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--color-white);
}

.status-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  flex-shrink: 0;
}

.status-title {
  font-size: 19px;
  font-weight: 600;
  letter-spacing: 3px;
  margin-bottom: 4px;
}

.status-sub {
  font-size: 13px;
  opacity: 0.85;
  letter-spacing: 1px;
}

.order-id-section {
  background: var(--color-white);
  margin: 12px 16px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
}

.order-id-section .label {
  font-size: 13px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

.order-id {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
}

.section {
  background: var(--color-white);
  margin: 12px 16px;
  padding: 16px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 2px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-item {
  display: flex;
  gap: 12px;
}

.item-img {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
  background: var(--color-bg-warm);
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 1px;
}

.item-specs {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.item-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
}

.item-price small {
  font-size: 12px;
  font-weight: 500;
}

.item-qty {
  font-size: 13px;
  color: var(--color-text-muted);
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 13px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

.info-value {
  font-size: 13px;
  color: var(--color-text);
  max-width: 60%;
  text-align: right;
  word-break: break-all;
}

.total-row {
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
  margin-top: 4px;
}

.total-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
}

.total-value small {
  font-size: 13px;
  font-weight: 500;
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 768px;
  margin: 0 auto;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: var(--color-white);
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 12px;
}

.menu-btn,
.orders-btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
  transition: var(--transition);
}

.menu-btn {
  background: var(--color-bg-warm);
  color: var(--color-primary);
}

.menu-btn:hover {
  background: var(--color-border);
}

.orders-btn {
  background: var(--color-primary);
  color: var(--color-white);
}

.orders-btn:hover {
  background: var(--color-primary-dark);
}

.not-found {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.not-found-text {
  font-size: 16px;
  color: var(--color-text-muted);
  letter-spacing: 2px;
}

.back-btn {
  padding: 10px 28px;
  background: var(--color-primary);
  color: var(--color-white);
  border-radius: 20px;
  font-size: 13px;
  letter-spacing: 2px;
}
</style>
