import { ref, computed } from 'vue'
import products from '@/data/products.json'
import categories from '@/data/categories.json'

export function useProductSearch() {
  const searchKeyword = ref('')
  const activeCategory = ref(categories[0]?.id || '')

  const isSearching = computed(() => searchKeyword.value.trim().length > 0)

  const searchResults = computed(() => {
    const kw = searchKeyword.value.trim().toLowerCase()
    if (!kw) return []

    return products.filter(p => {
      if (p.name.toLowerCase().includes(kw)) return true
      if (p.description.toLowerCase().includes(kw)) return true
      if (p.tags?.some(tag => tag.toLowerCase().includes(kw))) return true
      return false
    })
  })

  const matchedCategoryIds = computed(() => {
    if (!isSearching.value) return new Set()
    return new Set(searchResults.value.map(p => p.categoryId))
  })

  const resultsGroupedByCategory = computed(() => {
    if (!isSearching.value) return []

    return categories
      .filter(cat => matchedCategoryIds.value.has(cat.id))
      .map(cat => ({
        category: cat,
        products: searchResults.value.filter(p => p.categoryId === cat.id)
      }))
  })

  const totalMatchCount = computed(() => searchResults.value.length)

  const activeCategoryInfo = computed(
    () => categories.find(c => c.id === activeCategory.value) || null
  )

  const activeCategoryProducts = computed(() => {
    if (isSearching.value) return []
    return products.filter(p => p.categoryId === activeCategory.value)
  })

  function isCategoryActive(categoryId) {
    return !isSearching.value && activeCategory.value === categoryId
  }

  function isCategoryHit(categoryId) {
    return isSearching.value && matchedCategoryIds.value.has(categoryId)
  }

  function getCategoryClass(categoryId) {
    return {
      active: isCategoryActive(categoryId),
      'search-hit': isCategoryHit(categoryId)
    }
  }

  function selectCategory(categoryId) {
    searchKeyword.value = ''
    activeCategory.value = categoryId
  }

  function clearSearch() {
    searchKeyword.value = ''
  }

  return {
    searchKeyword,
    isSearching,
    searchResults,
    matchedCategoryIds,
    resultsGroupedByCategory,
    totalMatchCount,
    activeCategory,
    activeCategoryInfo,
    activeCategoryProducts,
    categories,
    isCategoryActive,
    isCategoryHit,
    getCategoryClass,
    selectCategory,
    clearSearch
  }
}
