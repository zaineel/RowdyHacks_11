<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-frontier-400 mb-2">
        Welcome back, {{ user?.name || 'Pioneer' }}! 🤠
      </h1>
      <p class="text-dusty-300">Your frontier at a glance</p>
    </div>

    <!-- Credit Score Spotlight -->
    <div class="card mb-8 bg-gradient-to-r from-frontier-900/30 to-green-900/30 border-frontier-700">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-frontier-400 mb-2">Your Credit Score</h2>
          <p class="text-dusty-300 mb-4">Building financial trust on the frontier</p>

          <div class="flex items-end space-x-4">
            <div>
              <div class="text-5xl font-bold text-frontier-400">{{ userStats.creditScore }}</div>
              <div v-if="creditTrend > 0" class="text-sm text-green-400 mt-1">
                ↗ +{{ creditTrend }} this month
              </div>
              <div v-else-if="creditTrend < 0" class="text-sm text-red-400 mt-1">
                ↘ {{ creditTrend }} this month
              </div>
            </div>

            <!-- Credit Score Gauge -->
            <div class="relative w-32 h-32">
              <svg class="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  stroke-width="8"
                  fill="transparent"
                  class="text-dusty-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  :stroke="getCreditScoreColor(userStats.creditScore)"
                  stroke-width="8"
                  fill="transparent"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="circumference - (userStats.creditScore / 850) * circumference"
                  class="transition-all duration-1000"
                  stroke-linecap="round"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xs text-dusty-400">{{ getCreditRating(userStats.creditScore) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Credit Milestones -->
        <div class="hidden md:block">
          <div class="space-y-2 text-sm">
            <div class="flex items-center space-x-2">
              <span :class="userStats.creditScore >= 300 ? 'text-green-400' : 'text-dusty-500'">✓</span>
              <span class="text-dusty-300">300 - Getting Started</span>
            </div>
            <div class="flex items-center space-x-2">
              <span :class="userStats.creditScore >= 500 ? 'text-green-400' : 'text-dusty-500'">✓</span>
              <span class="text-dusty-300">500 - Fair Credit</span>
            </div>
            <div class="flex items-center space-x-2">
              <span :class="userStats.creditScore >= 650 ? 'text-green-400' : 'text-dusty-500'">✓</span>
              <span class="text-dusty-300">650 - Good Credit</span>
            </div>
            <div class="flex items-center space-x-2">
              <span :class="userStats.creditScore >= 750 ? 'text-green-400' : 'text-dusty-500'">✓</span>
              <span class="text-dusty-300">750 - Excellent</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <div class="card">
        <div class="text-dusty-400 text-sm mb-1">Active Circles</div>
        <div class="text-3xl font-bold text-starlight-400">{{ userStats.activeCircles }}</div>
      </div>

      <div class="card">
        <div class="text-dusty-400 text-sm mb-1">Total Contributed</div>
        <div class="text-3xl font-bold text-cosmic-400">${{ userStats.totalContributed }}</div>
      </div>

      <div class="card">
        <div class="text-dusty-400 text-sm mb-1">Payments Made</div>
        <div class="text-3xl font-bold text-green-400">{{ userStats.paymentsMade }}</div>
      </div>
    </div>

    <!-- Credit History Chart -->
    <div v-if="creditHistory.length > 0" class="card mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-frontier-400">Credit Building Journey</h2>
      <div class="h-64">
        <canvas ref="creditChart"></canvas>
      </div>
      <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div class="text-dusty-400">Payments Made</div>
          <div class="text-green-400 font-bold">+{{ creditEvents.payments_made || 0 }}</div>
        </div>
        <div>
          <div class="text-dusty-400">Vouches Given</div>
          <div class="text-starlight-400 font-bold">+{{ creditEvents.vouches_given || 0 }}</div>
        </div>
        <div>
          <div class="text-dusty-400">Missed Payments</div>
          <div class="text-red-400 font-bold">{{ creditEvents.missed_payments || 0 }}</div>
        </div>
        <div>
          <div class="text-dusty-400">Total Events</div>
          <div class="text-frontier-400 font-bold">{{ creditHistory.length }}</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid md:grid-cols-2 gap-6 mb-8">
      <div class="card-hover cursor-pointer" @click="$router.push('/circles/create')">
        <h3 class="text-xl font-semibold mb-2 text-frontier-400">🚀 Start a New Circle</h3>
        <p class="text-dusty-300">Create a lending circle and invite your community</p>
      </div>

      <div class="card-hover cursor-pointer" @click="joinCircle">
        <h3 class="text-xl font-semibold mb-2 text-starlight-400">🤝 Join a Circle</h3>
        <p class="text-dusty-300">Enter an invite code to join an existing circle</p>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card">
      <h2 class="text-2xl font-semibold mb-4 text-frontier-400">Recent Activity</h2>
      <div v-if="loading" class="text-center py-8">
        <div class="spinner mx-auto"></div>
      </div>
      <div v-else-if="activities.length === 0" class="text-center py-8 text-dusty-400">
        No recent activity. Time to saddle up and get started! 🐎
      </div>
      <div v-else class="space-y-3">
        <div v-for="activity in activities" :key="activity.id" class="flex items-center justify-between p-3 bg-dusty-700 rounded-lg">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">{{ activity.icon }}</span>
            <div>
              <p class="text-dusty-100">{{ activity.title }}</p>
              <p class="text-sm text-dusty-400">{{ activity.description }}</p>
            </div>
          </div>
          <span class="text-sm text-dusty-400">{{ activity.time }}</span>
        </div>
      </div>
    </div>

    <!-- Join Circle Modal -->
    <div v-if="showJoinModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showJoinModal = false">
      <div class="card max-w-md w-full mx-4">
        <h3 class="text-xl font-semibold mb-4 text-frontier-400">Join a Circle</h3>
        <input
          v-model="inviteCode"
          type="text"
          placeholder="Enter invite code"
          class="input-field mb-4"
        />
        <div class="flex space-x-3">
          <button @click="handleJoinCircle" class="btn-frontier flex-1">Join</button>
          <button @click="showJoinModal = false" class="btn-frontier-outline flex-1">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRouter } from 'vue-router';
import { Chart, registerables } from 'chart.js';
import api from '../services/api';

Chart.register(...registerables);

const { user } = useAuth0();
const router = useRouter();
const loading = ref(false);
const showJoinModal = ref(false);
const inviteCode = ref('');
const creditChart = ref(null);
const currentUserId = ref(null);
const creditTrend = ref(0);
const circumference = 2 * Math.PI * 56; // For SVG circle

const userStats = ref({
  creditScore: 500,
  activeCircles: 0,
  totalContributed: 0,
  paymentsMade: 0,
});

const creditHistory = ref([]);
const creditEvents = ref({
  payments_made: 0,
  vouches_given: 0,
  missed_payments: 0,
});

const activities = ref([]);

const getCreditScoreColor = (score) => {
  if (score >= 750) return '#10b981'; // green-500
  if (score >= 650) return '#3b82f6'; // blue-500
  if (score >= 500) return '#f59e0b'; // amber-500
  return '#ef4444'; // red-500
};

const getCreditRating = (score) => {
  if (score >= 750) return 'Excellent';
  if (score >= 650) return 'Good';
  if (score >= 500) return 'Fair';
  return 'Building';
};

const joinCircle = () => {
  showJoinModal.value = true;
};

const handleJoinCircle = async () => {
  if (!inviteCode.value) return;

  try {
    await api.circles.joinByInviteCode(inviteCode.value);
    alert('Successfully joined circle!');
    showJoinModal.value = false;
    inviteCode.value = '';
    router.push('/circles');
  } catch (error) {
    console.error('Error joining circle:', error);
    alert(error.response?.data?.error?.message || 'Failed to join circle');
  }
};

const loadCreditData = async () => {
  try {
    // Get credit score
    const creditResponse = await api.credit.getScore(currentUserId.value);
    userStats.value.creditScore = creditResponse.data.data.credit_score || 500;

    // Get credit history
    const historyResponse = await api.credit.getHistory(currentUserId.value);
    creditHistory.value = historyResponse.data.data || [];

    // Calculate trend and events
    if (creditHistory.value.length > 0) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentEvents = creditHistory.value.filter(
        event => new Date(event.created_at) >= thirtyDaysAgo
      );

      creditTrend.value = recentEvents.reduce((sum, event) => sum + (event.impact || 0), 0);

      // Count event types
      creditEvents.value = {
        payments_made: creditHistory.value.filter(e => e.event_type === 'payment_made').length,
        vouches_given: creditHistory.value.filter(e => e.event_type === 'vouch_given').length,
        missed_payments: creditHistory.value.filter(e => e.event_type === 'payment_missed').length,
      };

      // Render credit chart
      await nextTick();
      renderCreditChart();
    }
  } catch (error) {
    console.error('Error loading credit data:', error);
  }
};

const renderCreditChart = () => {
  if (!creditChart.value) return;

  const ctx = creditChart.value.getContext('2d');

  // Prepare data
  const sortedHistory = [...creditHistory.value].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  let runningScore = 500; // Starting score
  const scores = sortedHistory.map(event => {
    runningScore += event.impact || 0;
    return runningScore;
  });

  const labels = sortedHistory.map(event =>
    new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Credit Score',
        data: scores,
        borderColor: '#d97706',
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            afterLabel: function(context) {
              const event = sortedHistory[context.dataIndex];
              return event.description || event.event_type;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 300,
          max: 850,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#9ca3af'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#9ca3af'
          }
        }
      }
    }
  });
};

const loadUserData = async () => {
  try {
    const currentUserResponse = await api.auth.getCurrentUser();
    currentUserId.value = currentUserResponse.data.data.id;

    // Load user's circles
    const circlesResponse = await api.users.getCircles(currentUserId.value);
    const circles = circlesResponse.data.data || [];
    userStats.value.activeCircles = circles.filter(c => c.status === 'active').length;

    // Load payment stats
    const paymentsResponse = await api.payments.getByUser(currentUserId.value);
    const payments = paymentsResponse.data.data || [];
    userStats.value.paymentsMade = payments.length;
    userStats.value.totalContributed = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Convert recent payments to activities
    activities.value = payments.slice(0, 5).map(payment => ({
      id: payment.id,
      icon: '✅',
      title: 'Payment Made',
      description: `Contributed to "${payment.circle_name}"`,
      time: new Date(payment.created_at).toLocaleDateString()
    }));

    // Load credit data
    await loadCreditData();

  } catch (error) {
    console.error('Error loading user data:', error);
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await loadUserData();
  } catch (error) {
    console.error('Error loading dashboard:', error);
  } finally {
    loading.value = false;
  }
});
</script>
