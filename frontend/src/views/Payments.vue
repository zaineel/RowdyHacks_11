<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="spinner mx-auto"></div>
      <p class="text-dusty-300 mt-4">Loading payment data...</p>
    </div>

    <div v-else>
      <h1 class="text-3xl font-bold text-frontier-400 mb-2">Payments</h1>
      <p class="text-dusty-300 mb-8">Track your contributions and payouts</p>

      <!-- Upcoming Payments -->
      <div class="card mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-frontier-400">Upcoming Payments</h2>
        <div v-if="upcomingPayments.length === 0" class="text-center py-8 text-dusty-400">
          No upcoming payments
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="payment in upcomingPayments"
            :key="payment.id"
            class="flex items-center justify-between p-4 bg-dusty-700 rounded-lg"
          >
            <div>
              <p class="text-dusty-100 font-medium">{{ payment.circle_name }}</p>
              <p class="text-sm text-dusty-400">Due: {{ formatDate(payment.due_date) }}</p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-frontier-400">${{ payment.monthly_amount || payment.amount }}</p>
              <button class="btn-frontier mt-2 text-sm">Pay Now</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment History -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-semibold text-frontier-400">Payment History</h2>
          <select v-model="selectedCircle" class="input-field w-auto">
            <option value="all">All Circles</option>
            <option v-for="circle in userCircles" :key="circle.id" :value="circle.id">
              {{ circle.name }}
            </option>
          </select>
        </div>

        <div v-if="filteredPaymentHistory.length === 0" class="text-center py-8 text-dusty-400">
          No payment history yet
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="payment in filteredPaymentHistory"
            :key="payment.id"
            class="flex items-center justify-between p-3 bg-dusty-700 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <span class="text-2xl">
                {{ payment.type === 'payout' ? '💰' : '💳' }}
              </span>
              <div>
                <p class="text-dusty-100">
                  {{ payment.type === 'payout' ? 'Received Payout' : 'Made Payment' }}
                </p>
                <p class="text-sm text-dusty-400">{{ payment.circle_name }}</p>
                <p class="text-xs text-dusty-500">Cycle {{ payment.cycle_number }}</p>
              </div>
            </div>
            <div class="text-right">
              <p :class="payment.type === 'payout' ? 'text-green-400' : 'text-frontier-400'" class="font-bold">
                {{ payment.type === 'payout' ? '+' : '-' }}${{ payment.amount }}
              </p>
              <p class="text-xs text-dusty-400">{{ payment.date }}</p>
              <span :class="`badge-${payment.status === 'completed' ? 'success' : 'warning'} text-xs`">
                {{ payment.status }}
              </span>
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
