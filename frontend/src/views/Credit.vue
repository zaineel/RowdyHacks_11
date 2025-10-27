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
      <div class="mb-12 flex flex-col lg:flex-row items-center justify-between">
        <div class="flex items-center space-x-4 mb-6 lg:mb-0">
          <div
            class="w-16 h-16 bg-gradient-to-br from-frontier-400 to-starlight-400 rounded-2xl flex items-center justify-center text-2xl animate-pulse">
            ⭐
          </div>
          <div>
            <h1
              class="text-5xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
              Credit Score
            </h1>
            <p class="text-xl text-dusty-300">
              Track your financial reputation
            </p>
          </div>
        </div>
        <button
          @click="downloadCreditReport"
          :disabled="loading || isGeneratingPDF"
          class="group relative bg-gradient-to-r from-frontier-500 to-starlight-500 hover:from-frontier-600 hover:to-starlight-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-frontier-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
          <div class="flex items-center space-x-3">
            <svg
              v-if="!isGeneratingPDF"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div
              v-if="isGeneratingPDF"
              class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>{{ isGeneratingPDF ? "Generating..." : "Download Report" }}</span>
          </div>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-flex flex-col items-center space-y-4">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-frontier-400"></div>
          <p class="text-dusty-300 text-lg">Loading your credit data...</p>
        </div>
      </div>

      <!-- Credit Score Card -->
      <div
        v-else
        class="relative bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-12 border border-dusty-600/40 shadow-2xl mb-8 text-center">
        <!-- Animated background -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-frontier-500/10 to-transparent rounded-3xl opacity-50"></div>

        <div class="relative z-10">
          <div class="text-dusty-300 text-lg mb-4 font-semibold">
            Your Credit Score
          </div>
          <div
            class="text-8xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-6">
            {{ creditScore }}
          </div>
          <div
            v-if="creditTrend !== 0"
            class="text-lg font-semibold mb-6"
            :class="creditTrend > 0 ? 'text-green-400' : 'text-red-400'">
            {{ creditTrend > 0 ? "+" : "" }}{{ creditTrend }} points this month
            {{ creditTrend > 0 ? "📈" : "📉" }}
          </div>
          <div v-else class="text-lg text-dusty-400 mb-6">
            No change this month
          </div>

          <div class="mt-8 h-6 bg-dusty-700/50 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500 rounded-full"
              :style="{ width: `${((creditScore - 300) / 550) * 100}%` }"></div>
          </div>
          <div class="flex justify-between text-sm text-dusty-400 mt-3">
            <span class="font-semibold">300</span>
            <span class="font-semibold">850</span>
          </div>
        </div>
      </div>

      <!-- Credit Factors -->
      <div v-if="!loading" class="grid md:grid-cols-3 gap-6 mb-8">
        <!-- Payment History Card -->
        <div
          class="relative bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-6 border border-dusty-600/40 shadow-2xl">
          <div
            class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <div class="relative z-10">
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center text-lg">
                ✅
              </div>
              <h3 class="text-sm text-dusty-300 font-semibold">
                Payment History
              </h3>
            </div>
            <div
              class="text-4xl font-bold mb-2"
              :class="
                paymentHistoryPercent >= 90
                  ? 'text-green-400'
                  : paymentHistoryPercent >= 70
                  ? 'text-yellow-400'
                  : 'text-red-400'
              ">
              {{ paymentHistoryPercent }}%
            </div>
            <p class="text-sm text-dusty-400">
              {{ onTimePayments }} / {{ totalPayments }} on-time
            </p>
          </div>
        </div>

        <!-- Circle Participation Card -->
        <div
          class="relative bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-6 border border-dusty-600/40 shadow-2xl">
          <div
            class="absolute inset-0 bg-gradient-to-br from-starlight-500/10 to-transparent rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <div class="relative z-10">
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-10 h-10 bg-gradient-to-br from-starlight-400 to-starlight-500 rounded-xl flex items-center justify-center text-lg">
                🏕️
              </div>
              <h3 class="text-sm text-dusty-300 font-semibold">
                Circle Participation
              </h3>
            </div>
            <div class="text-4xl font-bold text-starlight-400 mb-2">
              {{ activeCircles }}
            </div>
            <p class="text-sm text-dusty-400">Active circles</p>
          </div>
        </div>

        <!-- Community Trust Card -->
        <div
          class="relative bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-6 border border-dusty-600/40 shadow-2xl">
          <div
            class="absolute inset-0 bg-gradient-to-br from-cosmic-500/10 to-transparent rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <div class="relative z-10">
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-10 h-10 bg-gradient-to-br from-cosmic-400 to-cosmic-500 rounded-xl flex items-center justify-center text-lg">
                🤝
              </div>
              <h3 class="text-sm text-dusty-300 font-semibold">
                Community Trust
              </h3>
            </div>
            <div class="text-4xl font-bold text-cosmic-400 mb-2">
              {{ vouchesReceived }}
            </div>
            <p class="text-sm text-dusty-400">Vouches received</p>
          </div>
        </div>
      </div>

      <!-- Credit History -->
      <div
        v-if="!loading"
        class="relative bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-8 border border-dusty-600/40 shadow-2xl">
        <div class="flex items-center space-x-3 mb-6">
          <div
            class="w-10 h-10 bg-gradient-to-br from-starlight-400 to-cosmic-400 rounded-xl flex items-center justify-center text-xl">
            📊
          </div>
          <h2
            class="text-2xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent">
            Recent Activity
          </h2>
        </div>

        <!-- Empty state -->
        <div v-if="creditHistory.length === 0" class="text-center py-12">
          <div
            class="w-24 h-24 bg-gradient-to-br from-frontier-500/20 to-starlight-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-5xl">🌟</span>
          </div>
          <p class="text-dusty-300 text-lg mb-2">No credit activity yet</p>
          <p class="text-dusty-400">
            Start by joining a circle and making payments!
          </p>
        </div>

        <!-- Credit history list -->
        <div v-else class="space-y-3">
          <div
            v-for="event in creditHistory"
            :key="event.id"
            class="group relative bg-gradient-to-br from-dusty-800/40 via-frontier-800/30 to-dusty-700/40 rounded-2xl p-4 border border-dusty-600/40 hover:border-frontier-500/50 transition-all duration-300">
            <div
              class="absolute inset-0 bg-gradient-to-br from-frontier-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div class="relative z-10 flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div
                  :class="
                    event.impact > 0
                      ? 'bg-gradient-to-br from-green-500 to-green-600'
                      : 'bg-gradient-to-br from-red-500 to-red-600'
                  "
                  class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl">
                  {{ event.impact > 0 ? "📈" : "📉" }}
                </div>
                <div>
                  <p class="text-dusty-100 font-semibold">
                    {{
                      event.description ||
                      event.event_type.replace(/_/g, " ")
                    }}
                  </p>
                  <p class="text-sm text-dusty-400">
                    {{ event.circle_name || "PayItForward" }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p
                  :class="
                    event.impact > 0 ? 'text-green-400' : 'text-red-400'
                  "
                  class="text-2xl font-bold mb-1">
                  {{ event.impact > 0 ? "+" : "" }}{{ event.impact }}
                </p>
                <p class="text-xs text-dusty-400">{{ event.date }}</p>
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
