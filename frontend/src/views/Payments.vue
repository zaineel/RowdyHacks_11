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
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-flex flex-col items-center space-y-4">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-frontier-400"></div>
          <p class="text-dusty-300 text-lg">Loading payment data...</p>
        </div>
      </div>

      <div v-else>
        <!-- Header Section -->
        <div class="mb-12">
          <div class="flex items-center space-x-4 mb-4">
            <div
              class="w-16 h-16 bg-gradient-to-br from-frontier-400 to-starlight-400 rounded-2xl flex items-center justify-center text-2xl animate-pulse">
              💳
            </div>
            <div>
              <h1
                class="text-5xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
                Payments
              </h1>
              <p class="text-xl text-dusty-300">
                Track your contributions and payouts
              </p>
            </div>
          </div>
        </div>

        <!-- Upcoming Payments -->
        <div
          class="relative bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-8 border border-dusty-600/40 shadow-2xl mb-8">
          <div class="flex items-center space-x-3 mb-6">
            <div
              class="w-10 h-10 bg-gradient-to-br from-starlight-400 to-cosmic-400 rounded-xl flex items-center justify-center text-xl">
              📅
            </div>
            <h2
              class="text-2xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent">
              Upcoming Payments
            </h2>
          </div>

          <div
            v-if="upcomingPayments.length === 0"
            class="text-center py-12">
            <div
              class="w-20 h-20 bg-gradient-to-br from-frontier-500/20 to-starlight-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">✅</span>
            </div>
            <p class="text-dusty-300 text-lg">No upcoming payments</p>
            <p class="text-dusty-400 text-sm mt-2">
              All caught up! Check back later.
            </p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="payment in upcomingPayments"
              :key="payment.id"
              class="group relative bg-gradient-to-br from-dusty-800/40 via-frontier-800/30 to-dusty-700/40 rounded-2xl p-6 border border-dusty-600/40 hover:border-frontier-500/50 transition-all duration-300 hover:scale-105">
              <div
                class="absolute inset-0 bg-gradient-to-br from-frontier-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div class="relative z-10 flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div
                    class="w-12 h-12 bg-gradient-to-br from-frontier-500 to-starlight-500 rounded-xl flex items-center justify-center text-xl">
                    🏕️
                  </div>
                  <div>
                    <p class="text-dusty-100 font-semibold text-lg">
                      {{ payment.circle_name }}
                    </p>
                    <p class="text-sm text-dusty-400">
                      Due: {{ formatDate(payment.due_date) }}
                    </p>
                  </div>
                </div>
                <div class="text-right flex items-center space-x-4">
                  <div>
                    <p class="text-3xl font-bold text-frontier-400">
                      ${{ payment.monthly_amount || payment.amount }}
                    </p>
                  </div>
                  <button
                    class="bg-gradient-to-r from-frontier-500 to-starlight-500 hover:from-frontier-600 hover:to-starlight-600 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-frontier-500/25">
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment History -->
        <div
          class="relative bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-8 border border-dusty-600/40 shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-gradient-to-br from-starlight-400 to-cosmic-400 rounded-xl flex items-center justify-center text-xl">
                📜
              </div>
              <h2
                class="text-2xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent">
                Payment History
              </h2>
            </div>
            <select
              v-model="selectedCircle"
              class="px-4 py-2 bg-dusty-900/50 border border-dusty-600/50 rounded-xl text-dusty-100 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300">
              <option value="all">All Circles</option>
              <option
                v-for="circle in userCircles"
                :key="circle.id"
                :value="circle.id">
                {{ circle.name }}
              </option>
            </select>
          </div>

          <div
            v-if="filteredPaymentHistory.length === 0"
            class="text-center py-12">
            <div
              class="w-20 h-20 bg-gradient-to-br from-frontier-500/20 to-starlight-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">📭</span>
            </div>
            <p class="text-dusty-300 text-lg">No payment history yet</p>
            <p class="text-dusty-400 text-sm mt-2">
              Your payments and payouts will appear here.
            </p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="payment in filteredPaymentHistory"
              :key="payment.id"
              class="group relative bg-gradient-to-br from-dusty-800/40 via-frontier-800/30 to-dusty-700/40 rounded-2xl p-4 border border-dusty-600/40 hover:border-frontier-500/50 transition-all duration-300">
              <div
                class="absolute inset-0 bg-gradient-to-br from-frontier-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div class="relative z-10 flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div
                    :class="
                      payment.type === 'payout'
                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                        : 'bg-gradient-to-br from-frontier-500 to-starlight-500'
                    "
                    class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl">
                    {{ payment.type === "payout" ? "💰" : "💳" }}
                  </div>
                  <div>
                    <p class="text-dusty-100 font-semibold">
                      {{
                        payment.type === "payout"
                          ? "Received Payout"
                          : "Made Payment"
                      }}
                    </p>
                    <p class="text-sm text-dusty-400">
                      {{ payment.circle_name }}
                    </p>
                    <p class="text-xs text-dusty-500">
                      Cycle {{ payment.cycle_number }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p
                    :class="
                      payment.type === 'payout'
                        ? 'text-green-400'
                        : 'text-frontier-400'
                    "
                    class="text-2xl font-bold mb-1">
                    {{ payment.type === "payout" ? "+" : "-" }}${{
                      payment.amount
                    }}
                  </p>
                  <p class="text-xs text-dusty-400 mb-1">{{ payment.date }}</p>
                  <span
                    :class="
                      payment.status === 'completed'
                        ? 'bg-green-500/20 text-green-400 border-green-500'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
                    "
                    class="text-xs px-2 py-1 rounded border">
                    {{ payment.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import api from '../services/api';

const { user } = useAuth0();
const loading = ref(true);
const currentUserId = ref(null);
const upcomingPayments = ref([]);
const paymentHistory = ref([]);
const selectedCircle = ref('all');
const userCircles = ref([]);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const loadData = async () => {
  loading.value = true;
  try {
    // Get current user's database ID
    const currentUserResponse = await api.auth.getCurrentUser();
    currentUserId.value = currentUserResponse.data.data.id;

    // Load user's circles
    const circlesResponse = await api.users.getCircles(currentUserId.value);
    userCircles.value = circlesResponse.data.data || [];

    // Load upcoming payments
    const upcomingResponse = await api.payments.getUpcoming(currentUserId.value);
    upcomingPayments.value = upcomingResponse.data.data || [];

    // Load payment history
    const historyResponse = await api.payments.getByUser(currentUserId.value);
    paymentHistory.value = (historyResponse.data.data || []).map(payment => ({
      ...payment,
      type: 'payment', // For now, we're only showing payments (not payouts)
      date: formatDate(payment.created_at),
    }));
  } catch (error) {
    console.error('Error loading payment data:', error);
  } finally {
    loading.value = false;
  }
};

const filteredPaymentHistory = computed(() => {
  if (selectedCircle.value === 'all') {
    return paymentHistory.value;
  }
  return paymentHistory.value.filter(p => p.circle_id === parseInt(selectedCircle.value));
});

onMounted(() => {
  loadData();
});
</script>
