<script setup>import { ref, computed } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useProductSearch } from '@/composables/useProductSearch';
import categories from '@/data/categories.json';
import products from '@/data/products.json';
const cartStore = useCartStore();
const { searchKeyword, isSearching, resultsGroupedByCategory, matchedCategoryIds, totalMatchCount, clearSearch } = useProductSearch();
const activeCategory = ref(categories[0]?.id || '');
const filteredProducts = computed(() => {
 if (isSearching.value) return [];
 return products.filter(p => p.categoryId === activeCategory.value);
});
const selectedProduct = ref(null);
const selectedSpecs = ref({});
const quantity = ref(1);
const specModalVisible = ref(false);
function openSpecModal(product) {
 selectedProduct.value = product;
 selectedSpecs.value = {};
 product.specs.forEach(spec => {
 selectedSpecs.value[spec.label] = spec.default;
 });
 quantity.value = 1;
 specModalVisible.value = true;
}
function closeSpecModal() {
 specModalVisible.value = false;
 selectedProduct.value = null;
}
function triggerFlyAnimation(btnEl) {
 if (!btnEl)
 return;
 const cartBadge = document.querySelector('.tab-badge');
 if (!cartBadge)
 return;
 const btnRect = btnEl.getBoundingClientRect();
 const cartRect = cartBadge.getBoundingClientRect();
 const ball = document.createElement('div');
 ball.className = 'fly-ball';
 ball.style.left = btnRect.left + btnRect.width / 2 - 22 + 'px';
 ball.style.top = btnRect.top + btnRect.height / 2 - 22 + 'px';
 document.body.appendChild(ball);
 requestAnimationFrame(() => {
 ball.style.left = cartRect.left + cartRect.width / 2 - 22 + 'px';
 ball.style.top = cartRect.top + cartRect.height / 2 - 22 + 'px';
 ball.style.transform = 'scale(0.3)';
 ball.style.opacity = '0.6';
 });
 setTimeout(() => {
 ball.remove();
 }, 650);
}
function confirmAddToCart(event) {
 if (!selectedProduct.value)
 return;
 cartStore.addItem(selectedProduct.value, selectedSpecs.value, quantity.value);
 const btn = event?.target?.closest('button') || document.querySelector('.confirm-add-btn');
 triggerFlyAnimation(btn);
 closeSpecModal();
}
</script>

<template>
  <div class="menu-page">
    <aside class="category-sidebar">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="category-item"
        :class="{
          active: !isSearching && activeCategory === cat.id,
          'search-hit': isSearching && matchedCategoryIds.has(cat.id)
        }"
        @click="activeCategory = cat.id; clearSearch()"
      >
        <span class="cat-icon">{{ cat.icon }}</span>
        <span class="cat-name">{{ cat.name }}</span>
        <span v-if="isSearching && matchedCategoryIds.has(cat.id)" class="cat-dot"></span>
      </button>
    </aside>

    <section class="product-grid-wrapper">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchKeyword"
          type="text"
          class="search-input"
          placeholder="搜索咖啡、茶、甜点..."
        />
        <button v-if="isSearching" class="search-clear" @click="clearSearch">✕</button>
      </div>

      <template v-if="isSearching">
        <div class="search-status">
          <span v-if="totalMatchCount > 0">找到 {{ totalMatchCount }} 个结果</span>
          <span v-else class="no-result">未找到相关商品</span>
        </div>

        <div v-for="group in resultsGroupedByCategory" :key="group.category.id" class="search-group">
          <div class="search-group-title">
            <span>{{ group.category.icon }}</span>
            <span>{{ group.category.name }}</span>
            <span class="group-count">{{ group.products.length }}</span>
          </div>
          <div class="product-grid">
            <article
              v-for="product in group.products"
              :key="product.id"
              class="product-card"
              @click="openSpecModal(product)"
            >
              <div class="product-image">
                <img :src="product.image" :alt="product.name" loading="lazy" />
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-desc">{{ product.description }}</p>
                <div class="product-bottom">
                  <span class="product-price">
                    <small>¥</small>{{ product.price }}
                  </span>
                  <button class="add-btn" @click.stop="openSpecModal(product)">
                    +
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="category-title">
          <h2>{{ categories.find(c => c.id === activeCategory)?.name }}</h2>
          <span class="subtitle">
            {{ categories.find(c => c.id === activeCategory)?.icon }} 精选推荐
          </span>
        </div>

        <div class="product-grid">
          <article
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
            @click="openSpecModal(product)"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name" loading="lazy" />
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-desc">{{ product.description }}</p>
              <div class="product-bottom">
                <span class="product-price">
                  <small>¥</small>{{ product.price }}
                </span>
                <button class="add-btn" @click.stop="openSpecModal(product)">
                  +
                </button>
              </div>
            </div>
          </article>
        </div>
      </template>
    </section>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="specModalVisible" class="spec-modal" @click.self="closeSpecModal">
          <div class="spec-modal-content">
            <div class="spec-product">
              <img :src="selectedProduct?.image" :alt="selectedProduct?.name" />
              <div class="spec-product-info">
                <h3>{{ selectedProduct?.name }}</h3>
                <p>{{ selectedProduct?.description }}</p>
                <span class="spec-price">
                  <small>¥</small>{{ selectedProduct?.price }}
                </span>
              </div>
              <button class="close-btn" @click="closeSpecModal">×</button>
            </div>

            <div class="spec-body">
              <div
                v-for="spec in selectedProduct?.specs"
                :key="spec.label"
                class="spec-group"
              >
                <label class="spec-label">{{ spec.label }}</label>
                <div class="spec-options">
                  <button
                    v-for="opt in spec.options"
                    :key="opt"
                    class="spec-option"
                    :class="{ active: selectedSpecs[spec.label] === opt }"
                    @click="selectedSpecs[spec.label] = opt"
                  >
                    {{ opt }}
                  </button>
                </div>
              </div>

              <div class="quantity-row">
                <label class="spec-label">数量</label>
                <div class="quantity-control">
                  <button
                    class="qty-btn"
                    :disabled="quantity <= 1"
                    @click="quantity > 1 && quantity--"
                  >
                    −
                  </button>
                  <span class="qty-num">{{ quantity }}</span>
                  <button class="qty-btn" @click="quantity++">+</button>
                </div>
              </div>
            </div>

            <div class="spec-footer">
              <div class="total-line">
                <span>合计</span>
                <span class="total-price">
                  ¥{{ (selectedProduct?.price || 0) * quantity }}
                </span>
              </div>
              <button class="confirm-add-btn" @click="confirmAddToCart">
                加入购物车
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.menu-page {
  display: flex;
  height: 100%;
  background: var(--color-bg);
}

.category-sidebar {
  width: 88px;
  flex-shrink: 0;
  background: var(--color-bg-warm);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-right: 1px solid var(--color-border);
}

.category-item {
  padding: 20px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--color-text-light);
  font-size: 13px;
  letter-spacing: 2px;
  transition: var(--transition);
  border-left: 3px solid transparent;
  position: relative;
}

.category-item.active {
  background: var(--color-white);
  color: var(--color-primary);
  border-left-color: var(--color-primary);
  font-weight: 600;
}

.category-item.search-hit {
  background: rgba(93, 64, 55, 0.06);
  color: var(--color-primary-light);
  border-left-color: var(--color-accent);
}

.cat-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: dotPulse 1.5s ease infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.4); }
}

.cat-icon {
  font-size: 22px;
}

.product-grid-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 24px;
}

.category-title {
  padding: 16px 4px 12px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 12px;
  position: sticky;
  top: 0;
  background: var(--color-bg);
  z-index: 2;
}

.category-title h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary-dark);
  letter-spacing: 3px;
}

.category-title .subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 3;
  background: var(--color-bg);
  padding: 12px 4px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-icon {
  font-size: 16px;
  flex-shrink: 0;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: var(--color-white);
  color: var(--color-text);
  font-size: 13px;
  letter-spacing: 1px;
  transition: var(--transition);
}

.search-input::placeholder {
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

.search-input:focus {
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 2px rgba(93, 64, 55, 0.08);
}

.search-clear {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-bg-warm);
  color: var(--color-text-muted);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: var(--transition);
}

.search-clear:hover {
  background: var(--color-border);
  color: var(--color-primary);
}

.search-status {
  padding: 4px 6px 12px;
  font-size: 12px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

.search-status .no-result {
  color: var(--color-accent);
}

.search-group {
  margin-bottom: 20px;
}

.search-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 6px 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-primary);
  letter-spacing: 2px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 12px;
}

.group-count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.product-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  cursor: pointer;
}

.product-card:active {
  transform: scale(0.97);
}

.product-image {
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--color-bg-warm);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 10px 12px 12px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
  letter-spacing: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 32px;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
}

.product-price small {
  font-size: 12px;
  font-weight: 500;
  margin-right: 1px;
}

.add-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  line-height: 1;
}

.add-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.1);
}

.spec-modal {
  position: fixed;
  inset: 0;
  background: rgba(62, 39, 35, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.spec-modal-content {
  width: 100%;
  max-width: 768px;
  background: var(--color-white);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.spec-product {
  display: flex;
  gap: 12px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--color-border);
  position: relative;
}

.spec-product img {
  width: 88px;
  height: 88px;
  border-radius: var(--radius-md);
  object-fit: cover;
  flex-shrink: 0;
}

.spec-product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.spec-product-info h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 1px;
}

.spec-product-info p {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.spec-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 2px;
}

.spec-price small {
  font-size: 13px;
  font-weight: 500;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-bg-warm);
  color: var(--color-text-muted);
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: var(--transition);
}

.close-btn:hover {
  background: var(--color-border);
  color: var(--color-primary);
}

.spec-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.spec-group {
  margin-bottom: 18px;
}

.spec-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 10px;
  display: block;
  letter-spacing: 1px;
}

.spec-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-option {
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-white);
  color: var(--color-text-light);
  font-size: 13px;
  transition: var(--transition);
  letter-spacing: 1px;
}

.spec-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-white);
}

.quantity-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--color-bg-warm);
  border-radius: 20px;
  padding: 2px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-white);
  color: var(--color-primary);
  font-size: 18px;
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
  min-width: 36px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.spec-footer {
  padding: 14px 16px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--color-white);
}

.total-line {
  display: flex;
  flex-direction: column;
}

.total-line span:first-child {
  font-size: 12px;
  color: var(--color-text-muted);
}

.total-price {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-primary);
}

.confirm-add-btn {
  flex: 1;
  height: 46px;
  background: var(--color-primary);
  color: var(--color-white);
  border-radius: 23px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 3px;
  transition: var(--transition);
}

.confirm-add-btn:hover {
  background: var(--color-primary-dark);
}

.confirm-add-btn:active {
  transform: scale(0.97);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@media (max-width: 360px) {
  .category-sidebar {
    width: 72px;
  }
  .category-item {
    padding: 16px 4px;
    font-size: 12px;
  }
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
