import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCartStore } from './cart'

function generateOrderId() {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])

  const sortedOrders = computed(() =>
    [...orders.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  )

  function getOrderById(id) {
    return orders.value.find(o => o.id === id)
  }

  function createOrder() {
    const cartStore = useCartStore()
    if (cartStore.items.length === 0) return null

    const order = {
      id: generateOrderId(),
      items: JSON.parse(JSON.stringify(cartStore.items)),
      totalCount: cartStore.totalCount,
      totalPrice: cartStore.totalPrice,
      status: '已下单',
      createdAt: new Date().toISOString()
    }

    orders.value.unshift(order)
    cartStore.clearCart()

    return order
  }

  return {
    orders,
    sortedOrders,
    getOrderById,
    createOrder
  }
})
