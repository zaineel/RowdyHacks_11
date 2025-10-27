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

    <div class="relative max-w-4xl mx-auto px-4 py-12">
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

      <!-- Header Section -->
      <div class="text-center mb-12">
        <div class="flex items-center justify-center space-x-4 mb-6">
          <div
            class="w-16 h-16 bg-gradient-to-br from-frontier-400 to-starlight-400 rounded-2xl flex items-center justify-center text-2xl animate-pulse">
            ➕
          </div>
          <div>
            <h1
              class="text-5xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
              List an Item
            </h1>
            <p class="text-xl text-dusty-300">
              Share your items with the community and build credit!
            </p>
          </div>
        </div>
      </div>

      <!-- Main Form Card -->
      <div
        class="bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-8 border border-dusty-600/40 shadow-2xl">
        <form @submit.prevent="submitItem" class="space-y-8">
          <!-- Title -->
          <div class="space-y-4">
            <label class="block text-lg font-semibold text-frontier-300 mb-3"
              >Item Title *</label
            >
            <div class="relative">
              <input
                v-model="form.title"
                type="text"
                required
                placeholder="e.g., Power Drill, Gaming Console, Textbook"
                class="w-full px-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 placeholder-dusty-400 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-lg"
                :disabled="isSubmitting" />
              <div
                class="absolute inset-0 rounded-2xl bg-gradient-to-r from-frontier-500/10 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-4">
            <label class="block text-lg font-semibold text-frontier-300 mb-3"
              >Description</label
            >
            <div class="relative">
              <textarea
                v-model="form.description"
                rows="4"
                placeholder="Describe the item, its features, and any special instructions..."
                class="w-full px-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 placeholder-dusty-400 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-lg resize-none"
                :disabled="isSubmitting"></textarea>
              <div
                class="absolute inset-0 rounded-2xl bg-gradient-to-r from-frontier-500/10 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          <!-- Category & Condition -->
          <div class="grid md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <label class="block text-lg font-semibold text-frontier-300 mb-3"
                >Category *</label
              >
              <div class="relative">
                <select
                  v-model="form.category"
                  required
                  class="w-full px-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-lg appearance-none cursor-pointer"
                  :disabled="isSubmitting">
                  <option value="" disabled>Select category</option>
                  <option value="tools">🔧 Tools</option>
                  <option value="electronics">💻 Electronics</option>
                  <option value="books">📚 Books</option>
                  <option value="sports">⚽ Sports Equipment</option>
                  <option value="household">🏠 Household Items</option>
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

            <div class="space-y-4">
              <label class="block text-lg font-semibold text-frontier-300 mb-3"
                >Condition *</label
              >
              <div class="relative">
                <select
                  v-model="form.condition"
                  required
                  class="w-full px-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-lg appearance-none cursor-pointer"
                  :disabled="isSubmitting">
                  <option value="" disabled>Select condition</option>
                  <option value="new">New</option>
                  <option value="like_new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
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

          <!-- Deposit & Daily Rate -->
          <div class="grid md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <label class="block text-lg font-semibold text-frontier-300 mb-3">
                Security Deposit *
                <span class="text-sm text-dusty-400 font-normal"
                  >(Refundable)</span
                >
              </label>
              <div class="relative">
                <div
                  class="absolute left-6 top-4 text-2xl text-dusty-400 font-bold">
                  $
                </div>
                <input
                  v-model.number="form.deposit_amount"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  class="w-full pl-12 pr-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 placeholder-dusty-400 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-xl font-semibold"
                  :disabled="isSubmitting" />
                <div
                  class="absolute inset-0 rounded-2xl bg-gradient-to-r from-frontier-500/10 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <p class="text-sm text-dusty-400 flex items-center">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Protects your item if damaged or not returned
              </p>
            </div>

            <div class="space-y-4">
              <label class="block text-lg font-semibold text-frontier-300 mb-3">
                Daily Rental Fee
                <span class="text-sm text-dusty-400 font-normal"
                  >(Optional)</span
                >
              </label>
              <div class="relative">
                <div
                  class="absolute left-6 top-4 text-2xl text-dusty-400 font-bold">
                  $
                </div>
                <input
                  v-model.number="form.daily_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  class="w-full pl-12 pr-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 placeholder-dusty-400 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-xl font-semibold"
                  :disabled="isSubmitting" />
                <div
                  class="absolute inset-0 rounded-2xl bg-gradient-to-r from-frontier-500/10 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <p class="text-sm text-dusty-400 flex items-center">
                <span class="w-2 h-2 bg-starlight-400 rounded-full mr-2"></span>
                Leave at 0 for free lending
              </p>
            </div>
          </div>

          <!-- Minimum Credit Score -->
          <div class="space-y-6">
            <div class="space-y-4">
              <label class="block text-lg font-semibold text-frontier-300 mb-3">
                Minimum Borrower Credit Score:
                <span class="text-2xl font-bold text-starlight-400">{{
                  form.min_credit_score
                }}</span>
              </label>
              <div class="relative">
                <input
                  v-model.number="form.min_credit_score"
                  type="range"
                  min="300"
                  max="850"
                  step="10"
                  class="w-full h-3 bg-dusty-700 rounded-lg appearance-none cursor-pointer slider"
                  :disabled="isSubmitting" />
                <div class="flex justify-between text-sm text-dusty-400 mt-2">
                  <span>300 (Anyone)</span>
                  <span>500 (Default)</span>
                  <span>850 (Highest)</span>
                </div>
              </div>
              <p class="text-sm text-dusty-400 flex items-center">
                <span class="w-2 h-2 bg-cosmic-400 rounded-full mr-2"></span>
                Only users with this credit score or higher can borrow your item
              </p>
            </div>
          </div>

          <!-- Benefits Info -->
          <div
            class="bg-gradient-to-br from-frontier-800/20 via-dusty-800/30 to-green-800/20 backdrop-blur-sm rounded-2xl p-6 border border-frontier-600/30">
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-10 h-10 bg-gradient-to-br from-frontier-400 to-green-400 rounded-xl flex items-center justify-center text-xl">
                💡
              </div>
              <h4
                class="text-xl font-bold bg-gradient-to-r from-frontier-300 to-green-300 bg-clip-text text-transparent">
                Benefits of Lending
              </h4>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="space-y-3">
                <div class="flex items-start space-x-3">
                  <div
                    class="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-green-400 text-sm">✓</span>
                  </div>
                  <p class="text-dusty-300">
                    Earn +10 credit points for each successful lending
                  </p>
                </div>
                <div class="flex items-start space-x-3">
                  <div
                    class="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-green-400 text-sm">✓</span>
                  </div>
                  <p class="text-dusty-300">
                    Help your community members access items they need
                  </p>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex items-start space-x-3">
                  <div
                    class="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-green-400 text-sm">✓</span>
                  </div>
                  <p class="text-dusty-300">
                    Deposit protects your item from damage
                  </p>
                </div>
                <div class="flex items-start space-x-3">
                  <div
                    class="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-green-400 text-sm">✓</span>
                  </div>
                  <p class="text-dusty-300">
                    Build your reputation in the marketplace
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              @click="$router.push('/marketplace')"
              class="group flex-1 bg-dusty-700/50 hover:bg-dusty-600/50 text-dusty-300 font-semibold py-4 px-8 rounded-2xl border border-dusty-600/50 hover:border-dusty-500/50 transition-all duration-300 hover:scale-105"
              :disabled="isSubmitting">
              <div class="flex items-center justify-center space-x-3">
                <span class="text-xl">←</span>
                <span class="text-lg">Cancel</span>
              </div>
            </button>
            <button
              type="submit"
              class="group relative flex-1 bg-gradient-to-r from-frontier-500 to-starlight-500 hover:from-frontier-600 hover:to-starlight-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-frontier-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              :disabled="isSubmitting || !isFormValid">
              <div class="flex items-center justify-center space-x-3">
                <div
                  v-if="isSubmitting"
                  class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span v-else class="text-xl">🚀</span>
                <span class="text-lg">{{
                  isSubmitting ? "Listing..." : "List Item"
                }}</span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const router = useRouter();
const isSubmitting = ref(false);

const form = ref({
  title: "",
  description: "",
  category: "",
  condition: "",
  deposit_amount: null,
  daily_rate: 0,
  min_credit_score: 500,
});

const isFormValid = computed(() => {
  return (
    form.value.title &&
    form.value.category &&
    form.value.condition &&
    form.value.deposit_amount !== null &&
    form.value.deposit_amount >= 0
  );
});

const submitItem = async () => {
  if (!isFormValid.value) {
    alert("Please fill in all required fields");
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await api.marketplace.create({
      title: form.value.title,
      description: form.value.description,
      category: form.value.category,
      condition: form.value.condition,
      deposit_amount: form.value.deposit_amount,
      daily_rate: form.value.daily_rate || 0,
      min_credit_score: form.value.min_credit_score,
    });

    alert("Item listed successfully! 🎉");
    router.push(`/marketplace/${response.data.data.id}`);
  } catch (error) {
    console.error("Error creating item:", error);
    alert(
      error.response?.data?.error?.message ||
        "Failed to list item. Please try again."
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d97706, #f59e0b);
  cursor: pointer;
  box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.3);
  transition: all 0.3s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.3);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d97706, #f59e0b);
  cursor: pointer;
  border: none;
  box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.3);
  transition: all 0.3s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.3);
}

.slider::-webkit-slider-track {
  background: linear-gradient(90deg, #374151, #6b7280);
  border-radius: 10px;
  height: 12px;
}

.slider::-moz-range-track {
  background: linear-gradient(90deg, #374151, #6b7280);
  border-radius: 10px;
  height: 12px;
  border: none;
}
</style>
