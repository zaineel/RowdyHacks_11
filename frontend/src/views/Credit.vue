<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-frontier-400 mb-2">Credit Score</h1>
        <p class="text-dusty-300">Track your financial reputation</p>
      </div>
      <button
        @click="downloadCreditReport"
        :disabled="loading || isGeneratingPDF"
        class="btn-frontier flex items-center space-x-2"
      >
        <svg v-if="!isGeneratingPDF" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <span v-if="isGeneratingPDF" class="spinner inline-block"></span>
        <span>{{ isGeneratingPDF ? 'Generating...' : 'Download Report' }}</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-16">
      <div class="spinner mx-auto mb-4"></div>
      <p class="text-dusty-400">Loading your credit data...</p>
    </div>

    <!-- Credit Score Card -->
    <div v-else class="card mb-8 text-center">
      <div class="text-dusty-400 text-sm mb-2">Your Credit Score</div>
      <div class="text-7xl font-bold text-frontier-400 mb-4">{{ creditScore }}</div>
      <div v-if="creditTrend !== 0" class="text-sm" :class="creditTrend > 0 ? 'text-green-400' : 'text-red-400'">
        {{ creditTrend > 0 ? '+' : '' }}{{ creditTrend }} points this month {{ creditTrend > 0 ? '📈' : '📉' }}
      </div>
      <div v-else class="text-sm text-dusty-400">No change this month</div>

      <div class="mt-6 h-4 bg-dusty-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
          :style="{ width: `${((creditScore - 300) / 550) * 100}%` }"
        ></div>
      </div>
      <div class="flex justify-between text-xs text-dusty-400 mt-2">
        <span>300</span>
        <span>850</span>
      </div>
    </div>

    <!-- Credit Factors -->
    <div v-if="!loading" class="grid md:grid-cols-3 gap-6 mb-8">
      <div class="card">
        <h3 class="text-sm text-dusty-400 mb-2">Payment History</h3>
        <div class="text-2xl font-bold" :class="paymentHistoryPercent >= 90 ? 'text-green-400' : paymentHistoryPercent >= 70 ? 'text-yellow-400' : 'text-red-400'">
          {{ paymentHistoryPercent }}%
        </div>
        <p class="text-xs text-dusty-300 mt-2">{{ onTimePayments }} / {{ totalPayments }} on-time</p>
      </div>

      <div class="card">
        <h3 class="text-sm text-dusty-400 mb-2">Circle Participation</h3>
        <div class="text-2xl font-bold text-starlight-400">{{ activeCircles }}</div>
        <p class="text-xs text-dusty-300 mt-2">Active circles</p>
      </div>

      <div class="card">
        <h3 class="text-sm text-dusty-400 mb-2">Community Trust</h3>
        <div class="text-2xl font-bold text-cosmic-400">{{ vouchesReceived }}</div>
        <p class="text-xs text-dusty-300 mt-2">Vouches received</p>
      </div>
    </div>

    <!-- Credit History -->
    <div v-if="!loading" class="card">
      <h2 class="text-2xl font-semibold mb-4 text-frontier-400">Recent Activity</h2>

      <!-- Empty state -->
      <div v-if="creditHistory.length === 0" class="text-center py-12">
        <span class="text-6xl mb-4 block">🌟</span>
        <p class="text-dusty-300 mb-2">No credit activity yet</p>
        <p class="text-sm text-dusty-400">Start by joining a circle and making payments!</p>
      </div>

      <!-- Credit history list -->
      <div v-else class="space-y-3">
        <div
          v-for="event in creditHistory"
          :key="event.id"
          class="flex items-center justify-between p-3 bg-dusty-700 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <span :class="event.impact > 0 ? 'text-green-400' : 'text-red-400'">
              {{ event.impact > 0 ? '📈' : '📉' }}
            </span>
            <div>
              <p class="text-dusty-100">{{ event.description || event.event_type.replace(/_/g, ' ') }}</p>
              <p class="text-sm text-dusty-400">{{ event.circle_name || 'PayItForward' }}</p>
            </div>
          </div>
          <div class="text-right">
            <p :class="event.impact > 0 ? 'text-green-400' : 'text-red-400'" class="font-semibold">
              {{ event.impact > 0 ? '+' : '' }}{{ event.impact }}
            </p>
            <p class="text-xs text-dusty-400">{{ event.date }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { generateCreditReportPDF } from '../utils/pdfGenerator';

const loading = ref(true);
const isGeneratingPDF = ref(false);
const creditScore = ref(500);
const activeCircles = ref(0);
const vouchesReceived = ref(0);
const totalPayments = ref(0);
const onTimePayments = ref(0);
const creditTrend = ref(0);

const creditHistory = ref([]);
const currentUserId = ref(null);
const currentUserData = ref(null);
const userCircles = ref([]);
const userPayments = ref([]);

// Calculate payment history percentage
const paymentHistoryPercent = computed(() => {
  if (totalPayments.value === 0) return 100;
  return Math.round((onTimePayments.value / totalPayments.value) * 100);
});

// Format relative time
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

// Load credit data
const loadCreditData = async () => {
  try {
    loading.value = true;

    // Get current user
    const userResponse = await api.auth.getCurrentUser();
    currentUserId.value = userResponse.data.data.id;
    currentUserData.value = userResponse.data.data;

    // Get credit score and user stats
    const scoreResponse = await api.credit.getScore(currentUserId.value);
    const userData = scoreResponse.data.data;
    creditScore.value = userData.credit_score || 500;

    // Get credit report for detailed stats
    const reportResponse = await api.credit.getReport(currentUserId.value);
    const reportData = reportResponse.data.data;

    // Extract payment stats
    if (reportData.payment_history) {
      totalPayments.value = parseInt(reportData.payment_history.total_payments) || 0;
      onTimePayments.value = parseInt(reportData.payment_history.on_time_payments) || 0;
    }

    // Get active circles count and store circles data
    const circlesResponse = await api.users.getCircles(currentUserId.value);
    userCircles.value = circlesResponse.data.data || [];
    activeCircles.value = userCircles.value.filter(c => c.status === 'active').length;

    // Get payments for PDF
    const paymentsResponse = await api.payments.getByUser(currentUserId.value);
    userPayments.value = paymentsResponse.data.data || [];

    // Get credit history
    const historyResponse = await api.credit.getHistory(currentUserId.value);
    creditHistory.value = (historyResponse.data.data || []).map(event => ({
      ...event,
      date: formatRelativeTime(event.created_at)
    }));

    // Calculate credit trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEvents = creditHistory.value.filter(
      event => new Date(event.created_at) >= thirtyDaysAgo
    );

    creditTrend.value = recentEvents.reduce((sum, event) => sum + (event.impact || 0), 0);

    // Count vouches received
    const vouchEvents = creditHistory.value.filter(e => e.event_type === 'vouch_received');
    vouchesReceived.value = vouchEvents.length;

  } catch (error) {
    console.error('Error loading credit data:', error);
    // Show user-friendly error
    if (error.response?.status === 404) {
      console.log('User not found in database');
    }
  } finally {
    loading.value = false;
  }
};

// Download credit report as PDF
const downloadCreditReport = async () => {
  try {
    isGeneratingPDF.value = true;

    // Prepare data for PDF
    const userData = {
      name: currentUserData.value.name,
      created_at: currentUserData.value.created_at
    };

    const creditData = {
      credit_score: creditScore.value,
      history: creditHistory.value
    };

    // Generate and download PDF
    await generateCreditReportPDF(userData, creditData, userPayments.value, userCircles.value);

    // Success feedback
    alert('Credit report downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate credit report. Please try again.');
  } finally {
    isGeneratingPDF.value = false;
  }
};

onMounted(async () => {
  await loadCreditData();
});
</script>
