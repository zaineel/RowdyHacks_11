<template>
  <div
    class="min-h-screen bg-gradient-to-br from-dusty-900 via-dusty-800 to-frontier-900">
    <!-- Animated Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-40 -right-40 w-80 h-80 bg-frontier-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div
        class="absolute -bottom-40 -left-40 w-80 h-80 bg-starlight-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cosmic-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 py-12">
      <!-- Header Section -->
      <div class="mb-12">
        <div
          class="flex flex-col lg:flex-row items-center justify-between mb-8">
          <div class="flex-1 mb-6 lg:mb-0">
            <div class="flex items-center space-x-4 mb-4">
              <div
                class="w-16 h-16 bg-gradient-to-br from-frontier-400 to-starlight-400 rounded-2xl flex items-center justify-center text-2xl animate-pulse">
                🏪
              </div>
              <div>
                <h1
                  class="text-5xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
                  Community Marketplace
                </h1>
                <p class="text-xl text-dusty-300">
                  Borrow items from your community, build credit together
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="$router.push('/marketplace/my-dashboard')"
              class="group relative bg-dusty-700/50 hover:bg-dusty-600/50 text-dusty-300 font-semibold py-3 px-6 rounded-2xl border border-dusty-600/50 hover:border-dusty-500/50 transition-all duration-300 hover:scale-105">
              <div class="flex items-center space-x-3">
                <span class="text-xl">📊</span>
                <span>My Marketplace</span>
                <span
                  v-if="pendingRequestsCount > 0"
                  class="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs animate-pulse">
                  {{ pendingRequestsCount }}
                </span>
              </div>
            </button>
            <button
              @click="$router.push('/marketplace/list')"
              class="group relative bg-gradient-to-r from-frontier-500 to-starlight-500 hover:from-frontier-600 hover:to-starlight-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-frontier-500/25">
              <div class="flex items-center space-x-3">
                <span class="text-xl">➕</span>
                <span>List an Item</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="mb-12">
        <div
          class="bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-8 border border-dusty-600/40 shadow-2xl">
          <div class="flex items-center space-x-3 mb-6">
            <div
              class="w-10 h-10 bg-gradient-to-br from-frontier-400 to-starlight-400 rounded-xl flex items-center justify-center text-xl">
              🔍
            </div>
            <h2
              class="text-2xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent">
              Find What You Need
            </h2>
          </div>

          <div class="flex flex-col lg:flex-row gap-6">
            <div class="flex-1">
              <label class="block text-sm font-medium text-dusty-300 mb-3"
                >Search Items</label
              >
              <div class="relative">
                <input
                  v-model="searchQuery"
                  @input="searchItems"
                  type="text"
                  placeholder="Search for tools, electronics, books..."
                  class="w-full px-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 placeholder-dusty-400 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-lg" />
                <div
                  class="absolute inset-0 rounded-2xl bg-gradient-to-r from-frontier-500/10 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div class="lg:w-80">
              <label class="block text-sm font-medium text-dusty-300 mb-3"
                >Category</label
              >
              <div class="relative">
                <select
                  v-model="categoryFilter"
                  @change="loadItems"
                  class="w-full px-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-lg appearance-none cursor-pointer">
                  <option value="all">🔍 All Categories</option>
                  <option value="tools">🔧 Tools</option>
                  <option value="electronics">💻 Electronics</option>
                  <option value="books">📚 Books</option>
                  <option value="sports">⚽ Sports</option>
                  <option value="household">🏠 Household</option>
                  <option value="other">📦 Other</option>
                </select>
                <div
                  class="absolute inset-0 rounded-2xl bg-gradient-to-r from-frontier-500/10 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    class="w-5 h-5 text-dusty-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-flex flex-col items-center space-y-4">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-frontier-400"></div>
          <p class="text-dusty-300 text-lg">Loading marketplace items...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="items.length === 0" class="relative">
        <div
          class="bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-12 border border-dusty-600/40 shadow-2xl text-center">
          <div
            class="w-24 h-24 bg-gradient-to-br from-frontier-500/20 to-starlight-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-4xl">🏪</span>
          </div>
          <h3 class="text-2xl font-bold text-dusty-300 mb-4">
            No Items Available Yet
          </h3>
          <p class="text-dusty-400 mb-8 text-lg">
            Be the first to list something and help build our community
            marketplace!
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              @click="$router.push('/marketplace/list')"
              class="bg-gradient-to-r from-frontier-500 to-starlight-500 hover:from-frontier-600 hover:to-starlight-600 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-frontier-500/25">
              <div class="flex items-center space-x-3">
                <span class="text-xl">➕</span>
                <span>List Your First Item</span>
              </div>
            </button>
            <button
              @click="$router.push('/marketplace/my-dashboard')"
              class="bg-dusty-700/50 hover:bg-dusty-600/50 text-dusty-300 font-semibold py-3 px-8 rounded-2xl border border-dusty-600/50 hover:border-dusty-500/50 transition-all duration-300 hover:scale-105">
              <div class="flex items-center space-x-3">
                <span class="text-xl">📊</span>
                <span>View My Dashboard</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Items Grid -->
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="item in items"
          :key="item.id"
          @click="$router.push(`/marketplace/${item.id}`)"
          class="group relative bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-6 border border-dusty-600/40 shadow-2xl cursor-pointer hover:shadow-frontier-500/20 transition-all duration-300 hover:scale-105">
          <!-- Animated background -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-frontier-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div class="relative z-10">
            <!-- Header -->
            <div class="flex items-start justify-between mb-6">
              <div class="flex-1">
                <div class="text-5xl mb-3">
                  {{ getCategoryIcon(item.category) }}
                </div>
                <h3
                  class="text-2xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
                  {{ item.title }}
                </h3>
                <p class="text-dusty-300 text-sm leading-relaxed line-clamp-2">
                  {{ item.description || "No description provided" }}
                </p>
              </div>

              <div class="flex flex-col items-end space-y-2">
                <span
                  :class="getStatusBadge(item.status)"
                  class="px-3 py-1 rounded-full text-xs font-semibold">
                  {{ item.status }}
                </span>
                <div class="text-xs text-dusty-400">
                  {{ item.total_borrows || 0 }} borrows
                </div>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-dusty-800/40 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-frontier-400 mb-1">
                  ${{ item.deposit_amount }}
                </div>
                <div class="text-xs text-dusty-400">Deposit</div>
              </div>
              <div class="bg-dusty-800/40 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-starlight-400 mb-1">
                  {{ item.daily_rate > 0 ? `$${item.daily_rate}` : "Free" }}
                </div>
                <div class="text-xs text-dusty-400">Daily Rate</div>
              </div>
            </div>

            <!-- Owner Info -->
            <div
              class="bg-gradient-to-r from-starlight-800/20 to-cosmic-800/20 rounded-xl p-4 border border-starlight-600/30">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-8 h-8 bg-gradient-to-br from-starlight-400 to-cosmic-400 rounded-lg flex items-center justify-center text-sm">
                    👤
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-dusty-100">
                      {{ item.owner_name }}
                    </div>
                    <div class="text-xs text-dusty-400">Owner</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-dusty-400">Category</div>
                  <div class="text-sm font-semibold text-dusty-300 capitalize">
                    {{ item.category }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Hover indicator -->
            <div
              class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div
                class="w-2 h-2 bg-frontier-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

const loading = ref(false);
const items = ref([]);
const searchQuery = ref("");
const categoryFilter = ref("all");
const pendingRequestsCount = ref(0);

const loadItems = async () => {
  loading.value = true;
  try {
    const filters = {
      status: "available",
    };

    if (categoryFilter.value !== "all") {
      filters.category = categoryFilter.value;
    }

    if (searchQuery.value.trim()) {
      filters.search = searchQuery.value.trim();
    }

    console.log("Loading marketplace items with filters:", filters);
    const response = await api.marketplace.list(filters);
    console.log("Marketplace response:", response.data);

    items.value = response.data.data || [];
    console.log(`Loaded ${items.value.length} items`);
  } catch (error) {
    console.error("Error loading marketplace items:", error);
    console.error("Error details:", error.response?.data);

    const errorMessage = error.response?.data?.error?.message || error.message || "Unknown error";
    const errorStatus = error.response?.status;

    if (errorStatus === 404) {
      console.warn("Marketplace endpoint not found - database table may not exist");
      items.value = [];
    } else if (errorStatus === 401 || errorStatus === 403) {
      alert(`Authentication error: ${errorMessage}\n\nPlease make sure you're logged in.`);
    } else if (error.response?.data?.error?.message?.includes("relation") ||
               error.response?.data?.error?.message?.includes("table")) {
      console.error("Database table error - marketplace tables may not be created");
      alert("⚠️ Marketplace Setup Required\n\nThe marketplace database tables haven't been created yet.\n\nPlease run the marketplace migration:\ncd backend && node db/migrate.js");
      items.value = [];
    } else {
      alert(`Failed to load marketplace items: ${errorMessage}`);
    }
  } finally {
    loading.value = false;
  }
};

const searchItems = () => {
  // Debounce search
  clearTimeout(searchItems.timeout);
  searchItems.timeout = setTimeout(() => {
    loadItems();
  }, 300);
};

const getCategoryIcon = (category) => {
  const icons = {
    tools: "🔧",
    electronics: "💻",
    books: "📚",
    sports: "⚽",
    household: "🏠",
    other: "📦",
  };
  return icons[category] || icons.other;
};

const getStatusBadge = (status) => {
  const badges = {
    available: "badge-success",
    borrowed: "badge-warning",
    unavailable: "badge-danger",
  };
  return badges[status] || "badge";
};

const loadPendingRequestsCount = async () => {
  try {
    const response = await api.marketplace.pendingRequests();
    pendingRequestsCount.value = response.data.data.length;
  } catch (error) {
    console.error("Error loading pending requests count:", error);
  }
};

onMounted(async () => {
  await loadItems();
  await loadPendingRequestsCount();
});
</script>
