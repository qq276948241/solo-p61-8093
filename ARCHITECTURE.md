# 半日闲咖啡点单系统 · 架构文档

> 「偷得浮生半日闲」—— 文艺风独立咖啡店线上点单系统

---

## 一、技术栈

| 层 | 技术选型 | 版本 |
|---|---|---|
| 框架 | Vue 3 | ^3.4.0 |
| 构建 | Vite | ^5.0.0 |
| 状态 | Pinia | ^2.1.7 |
| 路由 | Vue Router | ^4.2.5 |
| 语言 | JavaScript (ES Module) | - |
| 字体 | Noto Serif SC / 宋体 | - |
| 配色 | 米色 #FAF6F0 + 深棕 #5D4037 | - |

---

## 二、整体目录结构

```
project61/
├── index.html                              # HTML 入口
├── vite.config.js                          # Vite 配置（@ -> src 别名）
├── package.json
└── src/
    ├── main.js                             # 应用入口：创建 App + 注册 Pinia + Router
    ├── App.vue                             # 根组件：顶栏 + 底部 Tab 导航 + 路由出口
    ├── composables/
    │   └── useProductSearch.js             # 🔍 搜索 + 分类状态管理（纯逻辑抽离）
    ├── data/                               # 💾 本地 JSON 数据（后端接口替换目标）
    │   ├── categories.json                 #    商品分类（咖啡/茶/甜点）
    │   └── products.json                   #    商品数据（14 款 + 规格 + tags）
    ├── router/
    │   └── index.js                        # 🚦 Hash 路由配置（4 个路由）
    ├── stores/
    │   ├── cart.js                         # 🛒 购物车 Store
    │   └── order.js                        # 📜 订单 Store
    ├── styles/
    │   └── global.css                      # 🎨 全局样式 + CSS 变量 + 飞入动画
    └── views/
        ├── Menu.vue                        # ☕ 菜单页（默认首页）
        ├── Cart.vue                        # 🛒 购物车页
        ├── Orders.vue                      # 📋 订单历史页
        └── OrderDetail.vue                 # 🧾 订单详情页
```

---

## 三、数据流总览

```
┌───────────────────────────────────────────────────────────────────┐
│                        LocalStorage (未来)                         │
└───────────────┬───────────────────────────────────┬───────────────┘
                │                                   │
         ┌──────▼──────┐                     ┌──────▼──────┐
         │  cart Store │◄────────────────────┤ order Store │
         │  [cart.js]  │  createOrder() 清   │  [order.js] │
         └──────┬──────┘      购物车        └──────┬──────┘
                │                                   │
                │                                   │
     ┌──────────▼──────────┐             ┌──────────▼──────────┐
     │     Menu.vue        │             │    Orders.vue       │
     │  加购 -> addItem()  │             │  列表展示 + 跳转    │
     │  规格弹窗本地状态   │             └──────────┬──────────┘
     └──────────┬──────────┘                        │
                │                                   │
     ┌──────────▼──────────┐             ┌──────────▼──────────┐
     │     Cart.vue        │             │   OrderDetail.vue    │
     │  +/-/删 -> update   │             │  完整订单信息展示    │
     │  结算 -> createOrder│             └─────────────────────┘
     └─────────────────────┘
```

---

## 四、核心模块详解

### 4.1 数据层（data/）

**[categories.json](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/data/categories.json)** — 3 个分类
```json
{ "id": "coffee", "name": "咖啡", "icon": "☕" }
{ "id": "tea",    "name": "茶",   "icon": "🍵" }
{ "id": "dessert","name": "甜点", "icon": "🍰" }
```

**[products.json](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/data/products.json)** — 14 款商品，每款结构：
| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | number | 商品唯一 id |
| `categoryId` | string | 所属分类 id，关联 categories.json |
| `name` | string | 商品名 |
| `description` | string | 商品描述 |
| `price` | number | 单价（元） |
| `image` | string | 商品图 URL |
| `tags` | string[] | 搜索关键词标签（手冲/拿铁/芝士 等） |
| `specs` | array | 规格配置：`{ label, options[], default }` |

> 💡 **后端替换方案**：把 `import products from '@/data/products.json'` 改成 `fetch('/api/products')` 即可，composable 和 store 无需改动。

---

### 4.2 状态管理层（stores/）

#### 4.2.1 购物车 Store — [cart.js](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/stores/cart.js#L1-L72)

**State:**
```js
items: [{
  id: '1-温度:冰|甜度:标准',   // 唯一标识：商品id+规格组合
  productId: 1,
  name: '手冲曼特宁',
  image: '...',
  price: 28,
  specs: { 温度: '冰', 甜度: '标准' },
  quantity: 2
}]
```

**Getters:**
| 名称 | 计算逻辑 |
|---|---|
| `totalCount` | `items.reduce(sum, i) => sum + i.quantity` |
| `totalPrice` | `items.reduce(sum, i) => sum + i.price * i.quantity` |

**Actions:**
| 方法 | 作用 | 关键逻辑 |
|---|---|---|
| `addItem(product, specs, qty)` | 加入购物车 | 相同 id（商品+规格同）累加数量，不同则新增 |
| `updateQuantity(id, qty)` | 修改数量 | qty <= 0 自动走 removeItem |
| `removeItem(id)` | 删除商品 | splice |
| `clearCart()` | 清空购物车 | 下单后调用 |

**唯一键生成逻辑** [cart.js#L4-L10](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/stores/cart.js#L4-L10)：
```js
// 按规格 label 排序后拼接，确保 {温度:冰,甜度:标准} 和 {甜度:标准,温度:冰} 是同一条
generateCartItemId(productId, specs) => "1-甜度:标准|温度:冰"
```

---

#### 4.2.2 订单 Store — [order.js](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/stores/order.js#L1-L54)

**State:**
```js
orders: [{
  id: '20260624153022001',          // 时间戳+随机数
  items: [/* 从 cart.items 深拷贝 */],
  totalCount: 3,
  totalPrice: 88,
  status: '已下单',
  createdAt: '2026-06-24T15:30:22.000Z'
}]
```

**Getters:**
| 名称 | 逻辑 |
|---|---|
| `sortedOrders` | 按 `createdAt` 倒序 |

**Actions:**
| 方法 | 作用 | 关键逻辑 |
|---|---|---|
| `createOrder()` | 创建订单 | 从 cartStore 取数据 → 深拷贝 → 生成 id → `unshift` 到 orders → `cartStore.clearCart()` |
| `getOrderById(id)` | 查单详情 | `find` |

**订单号生成规则** [order.js#L6-L11](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/stores/order.js#L6-L11)：
```
YYYYMMDDHHmmss + 3位随机数  →  20260624153022001
```

---

### 4.3 业务逻辑层（composables/）

#### useProductSearch — [useProductSearch.js](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/composables/useProductSearch.js#L1-L94)

菜单页的大脑，完全接管**搜索 + 分类浏览**两套状态，Menu.vue 只负责渲染。

**内部 State:**
- `searchKeyword: ref('')` — 搜索词
- `activeCategory: ref('coffee')` — 当前分类 id
- `watch(activeCategory)` — 分类一变自动清搜索词（兜底保险）

**对外暴露（Menu.vue 全部用这些）:**
| 暴露项 | 类型 | 用途 |
|---|---|---|
| `categories` | 数组 | 分类列表 |
| `isSearching` | computed | 是否在搜索态 |
| `activeCategoryInfo` | computed | 当前分类完整对象（给标题栏） |
| `activeCategoryProducts` | computed | 当前分类商品（非搜索） |
| `resultsGroupedByCategory` | computed | 搜索结果按分类分组 |
| `totalMatchCount` | computed | 命中总数 |
| `selectCategory(id)` | 方法 | 切换分类（自动清搜索） |
| `getCategoryClass(id)` | 方法 | 返回 `{ active, search-hit }` class 对象 |
| `isCategoryHit(id)` | 方法 | 该分类是否有搜索命中 |
| `clearSearch()` | 方法 | 清空搜索词 |

**搜索匹配规则** [useProductSearch.js#L11-L20](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/composables/useProductSearch.js#L11-L20)：
1. 商品名包含关键词 → 命中
2. 商品描述包含关键词 → 命中
3. tags 数组任意标签包含关键词 → 命中

---

### 4.4 路由层（router/）

**[router/index.js](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/router/index.js#L1-L28)** — Hash 模式

| 路径 | 组件 | 说明 |
|---|---|---|
| `/` | redirect → `/menu` | 默认跳菜单 |
| `/menu` | Menu.vue | 菜单页 |
| `/cart` | Cart.vue | 购物车页 |
| `/orders` | Orders.vue | 订单历史 |
| `/orders/:id` | OrderDetail.vue | 订单详情 |

---

## 五、页面时序与状态流转

### 5.1 三页面跳转时序

```
  ┌─────────┐     点商品 / 加购     ┌─────────┐
  │  Menu   │─────addItem()───────►│  Cart   │
  │ (菜单)  │                       │ (购物车)│
  └────┬────┘                       └────┬────┘
       │                                 │
       │ Tab 切换                        │ 结算
       │                                 │ createOrder()
       ▼                                 ▼
  ┌─────────┐     点某一单       ┌──────────────┐
  │ Orders  │──────────────────►│ OrderDetail  │
  │(订单列表│                   │  (订单详情)   │
  └─────────┘                   └──────┬───────┘
                                       │
                                       └──► 继续点单 / 查看订单
```

**下单完整链路：**
```
Menu.vue 点「加入购物车」
  ↓ (specModalVisible = true, 规格选择)
confirmAddToCart() 调用
  ↓
cartStore.addItem(product, specs, qty)
  ↓ (triggerFlyAnimation 飞入动效)
↓↓↓ 切换到 Cart.vue ↓↓↓
  ↓ (用户可 +/- 数量 / 删除)
点「去结算」
  ↓ (showConfirm = true 二次确认)
confirmCheckout()
  ↓
orderStore.createOrder()
  ↓ 深拷贝 cart.items + 生成订单号 + 清购物车
  ↓ (show success 动画 1.2s)
自动跳 /orders/:id 订单详情页
```

---

### 5.2 规格弹窗与加购按钮 — 状态归属

**⚠️ 重要：规格弹窗和加购状态**全部由 **[Menu.vue](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/views/Menu.vue)** 本地管理，不进 Pinia。

| 状态变量 | 定义位置 | 作用域 | 理由 |
|---|---|---|---|
| `selectedProduct` | Menu.vue L19 | 当前商品 | 属于「正在操作」的临时上下文，不需要持久化 |
| `selectedSpecs` | Menu.vue L20 | 规格选项 | 同上 |
| `quantity` | Menu.vue L21 | 数量 | 同上 |
| `specModalVisible` | Menu.vue L22 | 弹窗显隐 | 纯 UI 状态 |

**流程：**
```
点击商品卡片 / + 按钮
  ↓
openSpecModal(product) 被调用
  → selectedProduct = product
  → selectedSpecs = 初始化规格默认值
  → quantity = 1
  → specModalVisible = true
  ↓
(用户选择规格 / 调整数量)
  ↓
点「加入购物车」
  → cartStore.addItem(selectedProduct, selectedSpecs, quantity)
  → triggerFlyAnimation(btn) 飞行动效
  → closeSpecModal() 清所有本地状态
```

**飞入动画实现** [Menu.vue#L33-L54](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/views/Menu.vue#L33-L54)：
1. 动态创建 `.fly-ball` DOM 元素
2. 定位到「加购按钮」中心
3. `requestAnimationFrame` 内改 left/top 到购物车 Tab 角标位置 + 缩小
4. 650ms 后移除元素
5. CSS 类 `.fly-ball` 定义在 [global.css](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/styles/global.css#L110-L130)

---

### 5.3 购物车页（Cart.vue）交互时序

```
进入 /cart
  ↓
cartStore.items 为空 → 显示空状态 + 去点单按钮
  ↓ 有商品
渲染 item 列表（商品图 + 名 + 规格 + 价格 + 数量控件 + 删除）
  ↓
点 + → cartStore.updateQuantity(id, qty+1)
点 − → cartStore.updateQuantity(id, qty-1) （qty=1 时自动删）
点 × → cartStore.removeItem(id)
  ↓
点右下角「去结算」
  ↓
confirm-mask 弹窗：确认/取消
  ↓ 确认
orderStore.createOrder()
  → 生成订单号 + 保存
  → 清空购物车
  → 显示 success-mask  ✓ 动画
  → 1.2s 后 router.replace('/orders/:id')
```

---

### 5.4 订单历史 & 详情

**Orders.vue** [Orders.vue](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/views/Orders.vue)：
- 从 `orderStore.sortedOrders` 取倒序数据
- 每张订单卡片显示：下单时间、状态、商品缩略图（最多 4 张 + N）、商品名、件数、总价
- 点击卡片 → `router.push('/orders/' + order.id)`

**OrderDetail.vue** [OrderDetail.vue](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/views/OrderDetail.vue)：
- 从路由参数 `$route.params.id` → `orderStore.getOrderById(id)`
- 显示：状态横幅、取餐号（订单号后 4 位）、商品清单（含规格）、订单信息
- 底部两个按钮：「继续点单」→ /menu，「查看订单」→ /orders

---

## 六、全局样式与设计规范

**[global.css](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/styles/global.css)**

### CSS 变量（文艺米色 + 深棕）：
```css
--color-bg: #FAF6F0;         /* 米色背景 */
--color-bg-warm: #F5EFE6;    /* 暖米色 */
--color-primary: #5D4037;    /* 深棕主色 */
--color-primary-light: #8D6E63;
--color-primary-dark: #3E2723;
--color-text: #3E2723;       /* 文字深棕 */
--color-border: #D7CCC8;     /* 边框浅棕 */
--font-serif: 'Noto Serif SC', 'SimSun', '宋体', serif;
```

### 组件级布局约定：
- 最大宽度 `768px` 居中，适配平板和桌面
- 顶栏 56px，底栏 64px + `env(safe-area-inset-bottom)` 适配刘海屏
- 所有交互元素 `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- 卡片圆角 `--radius-md: 12px`，按钮圆角 `--radius-lg: 20px`

### 响应式断点：
```css
@media (max-width: 360px) {
  .product-grid { grid-template-columns: 1fr; }  /* 小屏单列 */
  .category-sidebar { width: 72px; }
}
```

---

## 七、新人接手指南

### 第一次跑项目
```bash
cd project61
npm install
npm run dev     # 开发：http://localhost:5173
npm run build   # 生产构建
```

### 想加一款新商品？
→ 直接编辑 [products.json](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/data/products.json)，复制一条现有结构改 id/name/description/price/image/tags/specs 即可，**不用改任何其他代码**。

### 想改搜索匹配逻辑？
→ 改 [useProductSearch.js](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/composables/useProductSearch.js#L11-L20) 的 filter 条件。

### 想加「商品详情页」路由？
1. 在 [router/index.js](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/router/index.js) 加一条 `/products/:id` 路由
2. 组件里 `products.find(p => p.id === route.params.id)` 即可

### 想接后端 API？
1. 新建 `src/api/` 目录，封装 `getProducts()` / `getCategories()` / `submitOrder()`
2. 在 useProductSearch.js 里用 `onMounted` 调用 `getProducts()` 替换 import 的 JSON
3. 在 orderStore 的 `createOrder()` 里加 `submitOrder(order)` 调用
4. 其他业务逻辑**不需要改**

### 常见坑提醒
1. **购物车的 id 是复合键**：不是 product.id，是 `productId + 规格组合`。同商品不同规格（冰/热）算两条。
2. **activeCategory 变化自动清搜索词**：在 useProductSearch.js 有 watch 兜底，不用手动清。
3. **搜索结果不经过 activeCategory 过滤**：搜索是全商品搜，结果按分类分组展示，和当前分类无关。
4. **订单数据是本地内存**：刷新页面就丢。上生产时要在 orderStore 的 createOrder 里调 API 存后端，或者存 localStorage。
5. **规格弹窗状态是本地的**：关弹窗会清 selectedProduct，不要把业务逻辑依赖在这上面。

---

## 八、关键文件索引速查

| 功能点 | 文件位置 |
|---|---|
| 商品数据 | [products.json](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/data/products.json) |
| 分类数据 | [categories.json](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/data/categories.json) |
| 购物车逻辑 | [cart.js](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/stores/cart.js) |
| 订单逻辑 | [order.js](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/stores/order.js) |
| 搜索+分类 composable | [useProductSearch.js](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/composables/useProductSearch.js) |
| 菜单页 | [Menu.vue](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/views/Menu.vue) |
| 购物车页 | [Cart.vue](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/views/Cart.vue) |
| 订单列表 | [Orders.vue](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/views/Orders.vue) |
| 订单详情 | [OrderDetail.vue](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/views/OrderDetail.vue) |
| 全局样式 & 飞入动画 | [global.css](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/styles/global.css) |
| 路由配置 | [router/index.js](file:///d:/code/ai-prompt/solo-chrome-dev-F12/repos/repo61/project61/src/router/index.js) |
