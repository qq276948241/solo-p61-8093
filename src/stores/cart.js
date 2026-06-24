import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function generateCartItemId(productId, specs) {
  const specStr = Object.entries(specs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|')
  return `${productId}-${specStr}`
}

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const totalCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  function addItem(product, selectedSpecs, quantity = 1) {
    const id = generateCartItemId(product.id, selectedSpecs)
    const existing = items.value.find(item => item.id === id)

    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({
        id,
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        specs: { ...selectedSpecs },
        quantity
      })
    }
  }

  function updateQuantity(id, quantity) {
    const item = items.value.find(i => i.id === id)
    if (item) {
      if (quantity <= 0) {
        removeItem(id)
      } else {
        item.quantity = quantity
      }
    }
  }

  function removeItem(id) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) {
      items.value.splice(idx, 1)
    }
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    totalCount,
    totalPrice,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  }
})
