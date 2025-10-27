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
      <!-- Header Section -->
      <div class="text-center mb-12">
        <div class="flex items-center justify-center space-x-4 mb-6">
          <div
            class="w-16 h-16 bg-gradient-to-br from-frontier-400 to-starlight-400 rounded-2xl flex items-center justify-center text-2xl animate-pulse">
            🚀
          </div>
          <div>
            <h1
              class="text-5xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
              Create a New Circle
            </h1>
            <p class="text-xl text-dusty-300">
              Start a new lending circle in your community
            </p>
          </div>
        </div>
      </div>

      <!-- Main Form Card -->
      <div
        class="bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-8 border border-dusty-600/40 shadow-2xl">
        <form @submit.prevent="createCircle" class="space-y-8">
          <!-- Circle Name Section -->
          <div class="space-y-4">
            <label class="block text-lg font-semibold text-frontier-300 mb-3">
              Circle Name
            </label>
            <div class="relative">
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g., Pioneer Circle"
                class="w-full px-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 placeholder-dusty-400 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-lg" />
              <div
                class="absolute inset-0 rounded-2xl bg-gradient-to-r from-frontier-500/10 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          <!-- Description Section -->
          <div class="space-y-4">
            <label class="block text-lg font-semibold text-frontier-300 mb-3">
              Description
            </label>
            <div class="relative">
            <textarea
              v-model="form.description"
                rows="4"
                placeholder="What is this circle for? Describe the purpose and goals..."
                class="w-full px-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 placeholder-dusty-400 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-lg resize-none"></textarea>
              <div
                class="absolute inset-0 rounded-2xl bg-gradient-to-r from-frontier-500/10 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          <!-- Financial Settings Grid -->
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Monthly Contribution -->
            <div class="space-y-4">
              <label class="block text-lg font-semibold text-frontier-300 mb-3">
                Monthly Contribution
              </label>
            <div class="relative">
                <div
                  class="absolute left-6 top-4 text-2xl text-dusty-400 font-bold">
                  $
                </div>
              <input
                v-model.number="form.monthly_amount"
                type="number"
                required
                min="10"
                placeholder="100"
                  class="w-full pl-12 pr-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 placeholder-dusty-400 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-xl font-semibold" />
                <div
                  class="absolute inset-0 rounded-2xl bg-gradient-to-r from-frontier-500/10 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <p class="text-sm text-dusty-400 flex items-center">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Each member contributes this amount monthly
              </p>
          </div>

            <!-- Maximum Members -->
            <div class="space-y-4">
              <label class="block text-lg font-semibold text-frontier-300 mb-3">
                Maximum Members
              </label>
              <div class="relative">
            <input
              v-model.number="form.max_members"
              type="number"
              required
              min="3"
              max="50"
              placeholder="20"
                  class="w-full px-6 py-4 bg-dusty-900/50 border border-dusty-600/50 rounded-2xl text-dusty-100 placeholder-dusty-400 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 text-xl font-semibold" />
                <div
                  class="absolute inset-0 rounded-2xl bg-gradient-to-r from-frontier-500/10 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <p class="text-sm text-dusty-400 flex items-center">
                <span class="w-2 h-2 bg-starlight-400 rounded-full mr-2"></span>
                Number of people in the circle (3-50)
              </p>
            </div>
          </div>

          <!-- Circle Summary Section -->
          <div
            class="bg-gradient-to-br from-frontier-800/20 via-dusty-800/30 to-green-800/20 backdrop-blur-sm rounded-2xl p-6 border border-frontier-600/30">
            <div class="flex items-center space-x-3 mb-6">
              <div
                class="w-10 h-10 bg-gradient-to-br from-frontier-400 to-green-400 rounded-xl flex items-center justify-center text-xl">
                📊
              </div>
              <h4
                class="text-xl font-bold bg-gradient-to-r from-frontier-300 to-green-300 bg-clip-text text-transparent">
                Circle Summary
              </h4>
            </div>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-frontier-400 mb-1">
                  ${{ form.monthly_amount }}
                </div>
                <div class="text-sm text-dusty-400">Monthly Contribution</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-starlight-400 mb-1">
                  {{ form.max_members }}
                </div>
                <div class="text-sm text-dusty-400">Max Members</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-400 mb-1">
                  ${{ totalPotAmount }}
                </div>
                <div class="text-sm text-dusty-400">Total Pot Amount</div>
              </div>
            </div>
          </div>

          <!-- How It Works Section -->
          <div
            class="bg-gradient-to-br from-starlight-800/20 via-dusty-800/30 to-cosmic-800/20 backdrop-blur-sm rounded-2xl p-6 border border-starlight-600/30">
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-10 h-10 bg-gradient-to-br from-starlight-400 to-cosmic-400 rounded-xl flex items-center justify-center text-xl">
                💡
              </div>
              <h4
                class="text-xl font-bold bg-gradient-to-r from-starlight-300 to-cosmic-300 bg-clip-text text-transparent">
                How it works
              </h4>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="space-y-3">
                <div class="flex items-start space-x-3">
                  <div
                    class="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-green-400 text-sm">✓</span>
                  </div>
                  <p class="text-dusty-300">Each member contributes monthly</p>
                </div>
                <div class="flex items-start space-x-3">
                  <div
                    class="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-green-400 text-sm">✓</span>
                  </div>
                  <p class="text-dusty-300">
                    One member receives the full pot each month
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
                    Rotation continues until everyone has received
                  </p>
                </div>
                <div class="flex items-start space-x-3">
                  <div
                    class="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-green-400 text-sm">✓</span>
                  </div>
                  <p class="text-dusty-300">
                    Build credit with every on-time payment
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="errors.message"
            class="bg-red-900/20 border border-red-600/30 rounded-2xl p-4">
            <div class="flex items-center space-x-3">
              <div
                class="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-red-400 text-sm">⚠</span>
              </div>
              <p class="text-red-300">{{ errors.message }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="group relative flex-1 bg-gradient-to-r from-frontier-500 to-starlight-500 hover:from-frontier-600 hover:to-starlight-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-frontier-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
              <div class="flex items-center justify-center space-x-3">
                <div
                  v-if="loading"
                  class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span v-else class="text-xl">🚀</span>
                <span class="text-lg">{{
                  loading ? "Creating Circle..." : "Create Circle"
                }}</span>
              </div>
            </button>

            <button
              type="button"
              @click="$router.back()"
              class="group flex-1 bg-dusty-700/50 hover:bg-dusty-600/50 text-dusty-300 font-semibold py-4 px-8 rounded-2xl border border-dusty-600/50 hover:border-dusty-500/50 transition-all duration-300 hover:scale-105">
              <div class="flex items-center justify-center space-x-3">
                <span class="text-xl">←</span>
                <span class="text-lg">Cancel</span>
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
const loading = ref(false);
const errors = ref({});

const form = ref({
  name: "",
  description: "",
  monthly_amount: 100,
  max_members: 20,
});

// Form validation
const isFormValid = computed(() => {
  return (
    form.value.name.trim() &&
    form.value.monthly_amount >= 10 &&
    form.value.max_members >= 3 &&
    form.value.max_members <= 50
  );
});

// Calculate total pot amount
const totalPotAmount = computed(() => {
  return form.value.monthly_amount * form.value.max_members;
});

const createCircle = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  errors.value = {};

  try {
    const response = await api.circles.create(form.value);
    router.push(`/circles/${response.data.data.id}`);
  } catch (error) {
    console.error("Error creating circle:", error);
    errors.value = error.response?.data?.error || {
      message: "Failed to create circle. Please try again.",
    };
  } finally {
    loading.value = false;
  }
};
</script>
