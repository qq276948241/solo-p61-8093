<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import { ref } from 'vue'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const showConfirm = ref(false)
const orderResultId = ref(null)

function specsText(specs) {
  return Object.entries(specs)
    .map(([k, v]) => `${k}:${v}`)
    .join(' · ')
}

function handleCheckout() {
  showConfirm.value = true
}

function confirmCheckout() {
  const order = orderStore.createOrder()
  if (order) {
    orderResultId.value = order.id
    showConfirm.value = false
    setTimeout(() => {
      router.replace({ name: 'order-detail', params: { id: order.id } })
    }, 1200)
  }
}

function cancelCheckout() {
  showConfirm.value = false
}
</script>

<template>
  <div class="cart-page">
    <div v-if="cartStore.items.length === 0" class="empty-state">
      <div class="empty-icon">☕</div>
      <p class="empty-text">购物车还是空的</p>
      <p class="empty-sub">去挑几杯喜欢的吧</p>
      <button class="go-menu-btn" @click="router.push('/menu')">
        去点单
      </button>
    </div>

    <template v-else>
      <div class="cart-list">
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="cart-item"
        >
          <div class="cart-item-img">
            <img :src="item.image" :alt="item.name" />
          </div>
          <div class="cart-item-info">
            <h3 class="cart-item-name">{{ item.name }}</h3>
            <p class="cart-item-specs">{{ specsText(item.specs) }}</p>
            <div class="cart-item-bottom">
              <span class="cart-item-price">
                <small>¥</small>{{ item.price }}
              </span>
              <div class="qty-control">
                <button
                  class="qty-btn"
                  :disabled="item.quantity <= 1"
                  @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                >
                  −
                </button>
                <span class="qty-num">{{ item.quantity }}</span>
                <button
                  class="qty-btn"
                  @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <button
            class="delete-btn"
            @click="cartStore.removeItem(item.id)"
            title="删除"
          >
            ×
          </button>
        </div>
      </div>

      <div class="summary-bar">
        <div class="summary-left">
          <span class="summary-label">共</span>
          <span class="summary-count">{{ cartStore.totalCount }}</span>
          <span class="summary-label">件 · </span>
          <span class="summary-price">¥{{ cartStore.totalPrice }}</span>
        </div>
      </div>

      <button class="checkout-fab" @click="handleCheckout">
        去结算
      </button>
    </template>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showConfirm" class="confirm-mask" @click.self="cancelCheckout">
          <div class="confirm-dialog">
            <div class="confirm-title">确认下单</div>
            <div class="confirm-body">
              <p>共 {{ cartStore.totalCount }} 件商品</p>
              <p class="confirm-total">合计 ¥{{ cartStore.totalPrice }}</p>
            </div>
            <div class="confirm-actions">
              <button class="cancel-btn" @click="cancelCheckout">
                再想想
              </button>
              <button class="ok-btn" @click="confirmCheckout">
                确认下单
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="fade">
        <div v-if="orderResultId" class="success-mask">
          <div class="success-box">
            <div class="success-icon">✓</div>
            <p class="success-text">下单成功</p>
            <p class="success-sub">正在跳转订单详情...</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.cart-page {
  height: 100%;
  overflow-y: auto;
  background: var(--color-bg);
  padding: 12px 16px 100px;
  position: relative;
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

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  display: flex;
  gap: 12px;
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: 12px;
  box-shadow: var(--shadow-sm);
  position: relative;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cart-item-img {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg-warm);
}

.cart-item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.cart-item-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-item-specs {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
  letter-spacing: 0.5px;
}

.cart-item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.cart-item-price {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-primary);
}

.cart-item-price small {
  font-size: 12px;
  font-weight: 500;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--color-bg-warm);
  border-radius: 16px;
  padding: 2px;
}

.qty-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-white);
  color: var(--color-primary);
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.qty-btn:disabled {
  color: var(--color-border);
  cursor: not-allowed;
}

.qty-btn:not(:disabled):hover {
  background: var(--color-primary);
  color: var(--color-white);
}

.qty-num {
  min-width: 28px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: var(--color-text-muted);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  line-height: 1;
}

.delete-btn:hover {
  background: var(--color-bg-warm);
  color: var(--color-primary);
}

.summary-bar {
  position: fixed;
  bottom: calc(64px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  max-width: 768px;
  margin: 0 auto;
  padding: 12px 16px;
  background: var(--color-white);
  border-top: 1px solid var(--color-border);
  z-index: 10;
}

.summary-left {
  padding-right: 120px;
  font-size: 14px;
  color: var(--color-text);
}

.summary-label {
  color: var(--color-text-muted);
}

.summary-count {
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 2px;
}

.summary-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  margin-left: 6px;
}

.checkout-fab {
  position: fixed;
  bottom: calc(74px + env(safe-area-inset-bottom));
  right: 20px;
  width: 100px;
  height: 44px;
  background: var(--color-primary);
  color: var(--color-white);
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 3px;
  box-shadow: var(--shadow-md);
  transition: var(--transition);
  z-index: 11;
}

.checkout-fab:hover {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-lg);
}

.checkout-fab:active {
  transform: scale(0.95);
}

.confirm-mask,
.success-mask {
  position: fixed;
  inset: 0;
  background: rgba(62, 39, 35, 0.5);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.confirm-dialog {
  width: 100%;
  max-width: 340px;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  animation: popIn 0.25s ease;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.confirm-title {
  padding: 20px 24px 12px;
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 2px;
  text-align: center;
}

.confirm-body {
  padding: 8px 24px 20px;
  text-align: center;
}

.confirm-body p {
  font-size: 14px;
  color: var(--color-text-light);
  margin-bottom: 6px;
}

.confirm-total {
  font-size: 22px !important;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 8px;
}

.confirm-actions {
  display: flex;
  border-top: 1px solid var(--color-border);
}

.cancel-btn,
.ok-btn {
  flex: 1;
  height: 50px;
  font-size: 15px;
  letter-spacing: 2px;
  transition: var(--transition);
}

.cancel-btn {
  color: var(--color-text-muted);
  border-right: 1px solid var(--color-border);
}

.cancel-btn:hover {
  background: var(--color-bg-warm);
}

.ok-btn {
  color: var(--color-white);
  background: var(--color-primary);
  font-weight: 600;
}

.ok-btn:hover {
  background: var(--color-primary-dark);
}

.success-box {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: 32px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: popIn 0.3s ease;
}

.success-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-success);
  color: var(--color-white);
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  animation: pulse 0.6s ease;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.success-text {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 3px;
  margin-bottom: 4px;
}

.success-sub {
  font-size: 12px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 360px) {
  .cart-item-img {
    width: 68px;
    height: 68px;
  }
}
</style>
