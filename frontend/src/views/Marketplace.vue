<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-frontier-400 mb-2">
          Community Marketplace
        </h1>
        <p class="text-dusty-300">
          Borrow items from your community, build credit together
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="$router.push('/marketplace/my-dashboard')"
          class="btn-frontier-outline">
          My Marketplace
          <span
            v-if="pendingRequestsCount > 0"
            class="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
            {{ pendingRequestsCount }}
          </span>
        </button>
        <button @click="$router.push('/marketplace/list')" class="btn-frontier">
          + List an Item
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="searchQuery"
            @input="searchItems"
            type="text"
            placeholder="Search items..."
            class="input-field" />
        </div>
        <div class="min-w-[150px]">
          <select
            v-model="categoryFilter"
            @change="loadItems"
            class="input-field">
            <option value="all">All Categories</option>
            <option value="tools">Tools</option>
            <option value="electronics">Electronics</option>
            <option value="books">Books</option>
            <option value="sports">Sports</option>
            <option value="household">Household</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="spinner mx-auto"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="items.length === 0" class="card text-center py-12">
      <span class="text-6xl mb-4 block">🏪</span>
      <p class="text-dusty-300 mb-2">No items available yet</p>
      <p class="text-sm text-dusty-400 mb-6">Be the first to list something!</p>
      <button @click="$router.push('/marketplace/list')" class="btn-frontier">
        List an Item
      </button>
    </div>

    <!-- Items Grid -->
    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in items"
        :key="item.id"
        @click="$router.push(`/marketplace/${item.id}`)"
        class="card-hover cursor-pointer">
        <!-- Category Icon -->
        <div class="flex items-start justify-between mb-3">
          <div class="text-4xl">{{ getCategoryIcon(item.category) }}</div>
          <span :class="getStatusBadge(item.status)">
            {{ item.status }}
          </span>
        </div>

        <!-- Title & Description -->
        <h3 class="text-xl font-semibold text-frontier-400 mb-2">
          {{ item.title }}
        </h3>
        <p class="text-sm text-dusty-300 mb-4 line-clamp-2">
          {{ item.description }}
        </p>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3 pt-3 border-t border-dusty-700">
          <div>
            <div class="text-xs text-dusty-400">Deposit</div>
            <div class="text-lg font-semibold text-frontier-400">
              ${{ item.deposit_amount }}
            </div>
          </div>
          <div v-if="item.daily_rate > 0">
            <div class="text-xs text-dusty-400">Daily Rate</div>
            <div class="text-lg font-semibold text-starlight-400">
              ${{ item.daily_rate }}/day
            </div>
          </div>
          <div v-else>
            <div class="text-xs text-dusty-400">Daily Rate</div>
            <div class="text-lg font-semibold text-green-400">Free</div>
          </div>
        </div>

        <!-- Owner Info -->
        <div
          class="mt-3 pt-3 border-t border-dusty-700 flex items-center justify-between text-sm">
          <div class="text-dusty-400">
            <span class="font-medium">{{ item.owner_name }}</span>
          </div>
          <div class="text-dusty-400">
            {{ item.total_borrows || 0 }} borrows
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

    const response = await api.marketplace.list(filters);
    items.value = response.data.data;
  } catch (error) {
    console.error("Error loading marketplace items:", error);
    alert("Failed to load items. Please try again.");
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
