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

    <div class="relative max-w-6xl mx-auto px-4 py-12">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-flex flex-col items-center space-y-4">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-frontier-400"></div>
          <p class="text-dusty-300 text-lg">Loading item details...</p>
        </div>
      </div>

      <!-- Item Details -->
      <div v-else-if="item">
        <!-- Back Button -->
        <button
          @click="$router.push('/marketplace')"
          class="group flex items-center space-x-2 text-dusty-300 hover:text-frontier-300 mb-8 transition-colors duration-300">
          <svg
            class="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"></path>
          </svg>
          <span>Back to Marketplace</span>
        </button>

        <div
          class="bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-8 border border-dusty-600/40 shadow-2xl">
          <!-- Header -->
          <div
            class="flex flex-col lg:flex-row items-start justify-between mb-8">
            <div class="flex items-center space-x-6 mb-6 lg:mb-0">
              <div class="text-8xl">{{ getCategoryIcon(item.category) }}</div>
              <div>
                <h1
                  class="text-4xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
                  {{ item.title }}
                </h1>
                <p class="text-xl text-dusty-400 capitalize">
                  {{ item.category }}
                </p>
              </div>
            </div>
            <div class="flex flex-col items-end space-y-2">
              <span
                :class="getStatusBadge(item.status)"
                class="px-4 py-2 rounded-full text-sm font-semibold">
                {{ item.status }}
              </span>
              <div class="text-sm text-dusty-400">
                {{ item.total_borrows || 0 }} times borrowed
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-frontier-300 mb-4">
              Description
            </h2>
            <div
              class="bg-dusty-800/40 rounded-2xl p-6 border border-dusty-700/30">
              <p class="text-dusty-300 text-lg leading-relaxed">
                {{ item.description || "No description provided" }}
              </p>
            </div>
          </div>

          <!-- Details Grid -->
          <div class="grid md:grid-cols-3 gap-6 mb-8">
            <div
              class="bg-gradient-to-br from-frontier-800/30 to-dusty-700/30 rounded-2xl p-6 border border-frontier-600/30">
              <div class="flex items-center space-x-3 mb-3">
                <div
                  class="w-10 h-10 bg-gradient-to-br from-frontier-400 to-starlight-400 rounded-xl flex items-center justify-center text-xl">
                  💰
                </div>
                <div class="text-sm text-dusty-400">Deposit Required</div>
              </div>
              <div class="text-3xl font-bold text-frontier-400 mb-1">
                ${{ item.deposit_amount }}
              </div>
              <div class="text-xs text-dusty-400">Refundable</div>
            </div>

            <div
              class="bg-gradient-to-br from-starlight-800/30 to-dusty-700/30 rounded-2xl p-6 border border-starlight-600/30">
              <div class="flex items-center space-x-3 mb-3">
                <div
                  class="w-10 h-10 bg-gradient-to-br from-starlight-400 to-cosmic-400 rounded-xl flex items-center justify-center text-xl">
                  📅
                </div>
                <div class="text-sm text-dusty-400">Daily Rate</div>
              </div>
              <div class="text-3xl font-bold text-starlight-400 mb-1">
                {{ item.daily_rate > 0 ? `$${item.daily_rate}` : "Free" }}
              </div>
              <div class="text-xs text-dusty-400">Per day</div>
            </div>

            <div
              class="bg-gradient-to-br from-cosmic-800/30 to-dusty-700/30 rounded-2xl p-6 border border-cosmic-600/30">
              <div class="flex items-center space-x-3 mb-3">
                <div
                  class="w-10 h-10 bg-gradient-to-br from-cosmic-400 to-green-400 rounded-xl flex items-center justify-center text-xl">
                  ⭐
                </div>
                <div class="text-sm text-dusty-400">Condition</div>
              </div>
              <div class="text-3xl font-bold text-cosmic-400 mb-1 capitalize">
                {{ item.condition }}
              </div>
              <div class="text-xs text-dusty-400">Item quality</div>
            </div>
          </div>

          <!-- Owner Info -->
          <div
            class="bg-gradient-to-br from-starlight-800/20 to-cosmic-800/20 rounded-2xl p-6 border border-starlight-600/30 mb-8">
            <div class="flex items-center space-x-3 mb-6">
              <div
                class="w-10 h-10 bg-gradient-to-br from-starlight-400 to-cosmic-400 rounded-xl flex items-center justify-center text-xl">
                👤
              </div>
              <h3
                class="text-2xl font-bold bg-gradient-to-r from-starlight-300 to-cosmic-300 bg-clip-text text-transparent">
                Owner Information
              </h3>
            </div>
            <div
              class="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <div class="flex items-center space-x-4">
                <div
                  class="w-16 h-16 bg-gradient-to-br from-starlight-500/20 to-cosmic-500/20 rounded-2xl flex items-center justify-center text-2xl">
                  {{ item.owner_name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="text-xl font-semibold text-dusty-100">
                    {{ item.owner_name }}
                  </p>
                  <p class="text-sm text-dusty-400">
                    Member since {{ formatDate(item.created_at) }}
                  </p>
                </div>
              </div>
              <div class="bg-dusty-800/40 rounded-xl p-4 text-center">
                <div class="text-sm text-dusty-400 mb-1">Credit Score</div>
                <div class="text-2xl font-bold text-frontier-400">
                  {{ item.owner_credit_score }}
                </div>
              </div>
            </div>
          </div>

          <!-- Borrow Section (if not owner and item available) -->
          <div
            v-if="!isOwner && item.status === 'available'"
            class="bg-gradient-to-br from-frontier-800/20 to-dusty-700/30 rounded-2xl p-8 border border-frontier-600/30">
            <div class="flex items-center space-x-3 mb-6">
              <div
                class="w-10 h-10 bg-gradient-to-br from-frontier-400 to-starlight-400 rounded-xl flex items-center justify-center text-xl">
                🤝
              </div>
              <h3
                class="text-2xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent">
                Request to Borrow
              </h3>
            </div>

            <!-- Credit Check -->
            <div
              v-if="userCreditScore < item.min_credit_score"
              class="bg-red-900/20 border border-red-600/30 rounded-2xl p-6 mb-6">
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-xl">
                  ⚠️
                </div>
                <div>
                  <p class="text-red-400 font-semibold text-lg">
                    Credit Score Too Low
                  </p>
                  <p class="text-sm text-dusty-300 mt-1">
                    Required: {{ item.min_credit_score }} | Your score:
                    {{ userCreditScore }}
                  </p>
                </div>
              </div>
            </div>

            <form
              v-else
              @submit.prevent="submitBorrowRequest"
              class="space-y-6">
              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <label
                    class="block text-lg font-semibold text-frontier-300 mb-3"
                    >Start Date</label
                  >
                  <div class="relative">
                    <input
                      v-model="borrowForm.start_date"
                      type="date"
                      required
                      :min="today"
                      class="w-full px-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-lg"
                      :disabled="isRequesting" />
                    <div
                      class="absolute inset-0 rounded-2xl bg-gradient-to-r from-frontier-500/10 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
                <div class="space-y-3">
                  <label
                    class="block text-lg font-semibold text-frontier-300 mb-3"
                    >End Date</label
                  >
                  <div class="relative">
                    <input
                      v-model="borrowForm.end_date"
                      type="date"
                      required
                      :min="borrowForm.start_date || today"
                      class="w-full px-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-lg"
                      :disabled="isRequesting" />
                    <div
                      class="absolute inset-0 rounded-2xl bg-gradient-to-r from-frontier-500/10 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <label
                  class="block text-lg font-semibold text-frontier-300 mb-3"
                  >Notes (Optional)</label
                >
                <div class="relative">
                  <textarea
                    v-model="borrowForm.notes"
                    rows="3"
                    placeholder="Tell the owner why you need this item..."
                    class="w-full px-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 placeholder-dusty-400 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-lg resize-none"
                    :disabled="isRequesting"></textarea>
                  <div
                    class="absolute inset-0 rounded-2xl bg-gradient-to-r from-frontier-500/10 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <!-- Cost Calculation -->
              <div
                v-if="totalCost"
                class="bg-gradient-to-br from-frontier-800/20 to-green-800/20 rounded-2xl p-6 border border-frontier-600/30">
                <div class="flex items-center space-x-3 mb-4">
                  <div
                    class="w-8 h-8 bg-gradient-to-br from-frontier-400 to-green-400 rounded-lg flex items-center justify-center text-sm">
                    💰
                  </div>
                  <h4 class="text-lg font-semibold text-frontier-300">
                    Cost Breakdown
                  </h4>
                </div>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-dusty-300">Deposit:</span>
                    <span class="font-bold text-dusty-100"
                      >${{ item.deposit_amount }}</span
                    >
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-dusty-300"
                      >Rental ({{ borrowDays }} days):</span
                    >
                    <span class="font-bold text-dusty-100"
                      >${{ rentalFee }}</span
                    >
                  </div>
                  <div
                    class="flex justify-between items-center pt-3 border-t border-frontier-500/30">
                    <span class="text-frontier-400 font-bold text-lg"
                      >Total:</span
                    >
                    <span class="text-frontier-400 font-bold text-2xl"
                      >${{ totalCost }}</span
                    >
                  </div>
                </div>
                <p class="text-sm text-dusty-400 mt-4 flex items-center">
                  <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Deposit will be refunded when item is returned in good
                  condition
                </p>
              </div>

              <button
                type="submit"
                class="group relative w-full bg-gradient-to-r from-frontier-500 to-starlight-500 hover:from-frontier-600 hover:to-starlight-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-frontier-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                :disabled="
                  isRequesting || !borrowForm.start_date || !borrowForm.end_date
                ">
                <div class="flex items-center justify-center space-x-3">
                  <div
                    v-if="isRequesting"
                    class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span v-else class="text-xl">🤝</span>
                  <span class="text-lg">{{
                    isRequesting ? "Sending Request..." : "Request to Borrow"
                  }}</span>
                </div>
              </button>
            </form>
          </div>

          <!-- Owner Actions -->
          <div v-else-if="isOwner" class="flex flex-col sm:flex-row gap-4">
            <button
              @click="editItem"
              class="group flex-1 bg-dusty-700/50 hover:bg-dusty-600/50 text-dusty-300 font-semibold py-4 px-8 rounded-2xl border border-dusty-600/50 hover:border-dusty-500/50 transition-all duration-300 hover:scale-105">
              <div class="flex items-center justify-center space-x-3">
                <span class="text-xl">✏️</span>
                <span class="text-lg">Edit Item</span>
              </div>
            </button>
            <button
              @click="deleteItem"
              class="group flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25">
              <div class="flex items-center justify-center space-x-3">
                <span class="text-xl">🗑️</span>
                <span class="text-lg">Delete Item</span>
              </div>
            </button>
          </div>

          <!-- Already Borrowed -->
          <div
            v-else-if="item.status === 'borrowed'"
            class="bg-gradient-to-br from-yellow-800/20 to-orange-800/20 rounded-2xl p-6 border border-yellow-600/30">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-xl">
                ⏳
              </div>
              <div>
                <p class="text-yellow-400 font-semibold text-lg">
                  Currently Borrowed
                </p>
                <p class="text-sm text-dusty-300 mt-1">
                  This item is currently borrowed by someone else.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const isRequesting = ref(false);
const item = ref(null);
const currentUserId = ref(null);
const userCreditScore = ref(500);

const borrowForm = ref({
  start_date: "",
  end_date: "",
  notes: "",
});

const today = computed(() => {
  return new Date().toISOString().split("T")[0];
});

const isOwner = computed(() => {
  return (
    item.value &&
    currentUserId.value &&
    item.value.owner_id === currentUserId.value
  );
});

const borrowDays = computed(() => {
  if (!borrowForm.value.start_date || !borrowForm.value.end_date) return 0;
  const start = new Date(borrowForm.value.start_date);
  const end = new Date(borrowForm.value.end_date);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

const rentalFee = computed(() => {
  return item.value ? borrowDays.value * item.value.daily_rate : 0;
});

const totalCost = computed(() => {
  if (!item.value) return 0;
  return parseFloat(item.value.deposit_amount) + rentalFee.value;
});

const loadItem = async () => {
  loading.value = true;
  try {
    // Get current user
    const userResponse = await api.auth.getCurrentUser();
    currentUserId.value = userResponse.data.data.id;
    userCreditScore.value = userResponse.data.data.credit_score || 500;

    // Get item details
    const response = await api.marketplace.getById(route.params.id);
    item.value = response.data.data;
  } catch (error) {
    console.error("Error loading item:", error);
    alert("Failed to load item details.");
    router.push("/marketplace");
  } finally {
    loading.value = false;
  }
};

const submitBorrowRequest = async () => {
  isRequesting.value = true;
  try {
    await api.marketplace.requestBorrow(route.params.id, {
      borrow_start_date: borrowForm.value.start_date,
      borrow_end_date: borrowForm.value.end_date,
      notes: borrowForm.value.notes,
    });

    alert("Borrow request sent successfully! The owner will be notified.");
    router.push("/marketplace/my-dashboard");
  } catch (error) {
    console.error("Error requesting borrow:", error);
    alert(
      error.response?.data?.error?.message ||
        "Failed to send borrow request. Please try again."
    );
  } finally {
    isRequesting.value = false;
  }
};

const editItem = () => {
  router.push(`/marketplace/edit/${item.value.id}`);
};

const deleteItem = async () => {
  if (
    !confirm(
      "Are you sure you want to delete this item? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    await api.marketplace.delete(item.value.id);
    alert("Item deleted successfully!");
    router.push("/marketplace");
  } catch (error) {
    console.error("Error deleting item:", error);
    alert(error.response?.data?.error?.message || "Failed to delete item.");
  }
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

onMounted(async () => {
  await loadItem();
});
</script>
