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

    <!-- Header Section -->
    <div class="relative mb-12">
      <div
        class="bg-gradient-to-r from-frontier-800/20 to-dusty-800/20 backdrop-blur-sm rounded-2xl p-8 border border-frontier-600/30 shadow-2xl">
      <div class="flex items-center justify-between">
        <div class="flex-1">
            <div class="flex items-center space-x-4 mb-4">
              <div
                class="w-16 h-16 bg-gradient-to-br from-frontier-400 to-starlight-400 rounded-full flex items-center justify-center text-2xl animate-pulse">
                🤠
              </div>
              <div>
                <h1
                  class="text-4xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
                  Welcome back, {{ user?.name || "Pioneer" }}!
                </h1>
                <p class="text-dusty-300 text-lg">
                  Your financial frontier awaits
                </p>
              </div>
            </div>

            <!-- Quick Stats Row -->
            <div class="grid grid-cols-3 gap-6 mt-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-frontier-400">
                  {{ userStats.activeCircles }}
                </div>
                <div class="text-sm text-dusty-400">Active Circles</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-starlight-400">
                  ${{ userStats.totalContributed }}
                </div>
                <div class="text-sm text-dusty-400">Total Contributed</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-400">
                  {{ userStats.paymentsMade }}
                </div>
                <div class="text-sm text-dusty-400">Payments Made</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Credit Score Spotlight -->
    <div class="relative mb-12">
      <div
        class="bg-gradient-to-br from-frontier-800/30 via-dusty-800/20 to-green-800/30 backdrop-blur-sm rounded-3xl p-8 border border-frontier-600/40 shadow-2xl overflow-hidden">
        <!-- Animated background pattern -->
        <div class="absolute inset-0 opacity-10">
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-frontier-400 to-transparent rounded-full blur-2xl"></div>
          <div
            class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400 to-transparent rounded-full blur-xl"></div>
        </div>

        <div class="relative z-10">
          <div class="flex flex-col lg:flex-row items-center justify-between">
            <!-- Credit Score Display -->
            <div class="flex-1 text-center lg:text-left mb-8 lg:mb-0">
              <h2
                class="text-3xl font-bold bg-gradient-to-r from-frontier-300 to-green-300 bg-clip-text text-transparent mb-2">
                Credit Score
              </h2>
              <p class="text-dusty-300 mb-6">
                Building financial trust on the frontier
              </p>

              <div
                class="flex items-center justify-center lg:justify-start space-x-8">
                <!-- Main Score Display -->
                <div class="text-center">
                  <div
                    class="text-6xl font-bold bg-gradient-to-r from-frontier-400 to-green-400 bg-clip-text text-transparent mb-2">
                    {{ userStats.creditScore }}
                  </div>
                  <div class="text-lg font-semibold text-dusty-300 mb-2">
                    {{ getCreditRating(userStats.creditScore) }}
                  </div>
                  <div
                    v-if="creditTrend > 0"
                    class="flex items-center justify-center text-green-400 text-sm">
                    <span class="mr-1">↗</span>
                    <span>+{{ creditTrend }} this month</span>
                  </div>
                  <div
                    v-else-if="creditTrend < 0"
                    class="flex items-center justify-center text-red-400 text-sm">
                    <span class="mr-1">↘</span>
                    <span>{{ creditTrend }} this month</span>
                  </div>
                </div>

                <!-- Futuristic Circular Progress -->
                <div class="relative w-40 h-40">
                  <!-- Outer ring -->
                  <svg
                    class="transform -rotate-90 w-40 h-40"
                    viewBox="0 0 160 160">
                <circle
                      cx="80"
                      cy="80"
                      r="70"
                  stroke="currentColor"
                  stroke-width="8"
                  fill="transparent"
                      class="text-dusty-700/30" />
                    <!-- Progress ring with gradient -->
                    <defs>
                      <linearGradient
                        id="creditGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%">
                        <stop
                          offset="0%"
                          :style="`stop-color:${getCreditScoreColor(
                            userStats.creditScore
                          )};stop-opacity:1`" />
                        <stop
                          offset="100%"
                          :style="`stop-color:${getCreditScoreColor(
                            userStats.creditScore
                          )};stop-opacity:0.3`" />
                      </linearGradient>
                    </defs>
                <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#creditGradient)"
                  stroke-width="8"
                  fill="transparent"
                  :stroke-dasharray="circumference"
                      :stroke-dashoffset="
                        circumference -
                        (userStats.creditScore / 850) * circumference
                      "
                      class="transition-all duration-2000 ease-out"
                      stroke-linecap="round"
                      style="filter: drop-shadow(0 0 8px currentColor)" />
                    <!-- Inner glow effect -->
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="transparent"
                      :stroke-dasharray="circumference"
                      :stroke-dashoffset="
                        circumference -
                        (userStats.creditScore / 850) * circumference
                      "
                      class="transition-all duration-2000 ease-out opacity-50"
                  stroke-linecap="round"
                      :style="`color: ${getCreditScoreColor(
                        userStats.creditScore
                      )}`" />
              </svg>

                  <!-- Center content -->
                  <div
                    class="absolute inset-0 flex flex-col items-center justify-center">
                    <div class="text-xs text-dusty-400 mb-1">Score</div>
                    <div class="text-lg font-bold text-frontier-300">
                      {{ userStats.creditScore }}
                    </div>
                    <div class="text-xs text-dusty-500">/ 850</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Credit Milestones -->
            <div class="w-full lg:w-80">
              <h3
                class="text-xl font-semibold text-frontier-300 mb-4 text-center lg:text-left">
                Milestones
              </h3>
              <div class="space-y-3">
                <div
                  class="flex items-center justify-between p-3 bg-dusty-800/30 rounded-lg border border-dusty-700/30">
                  <div class="flex items-center space-x-3">
                    <div
                      :class="
                        userStats.creditScore >= 300
                          ? 'bg-green-500'
                          : 'bg-dusty-600'
                      "
                      class="w-3 h-3 rounded-full"></div>
                    <span class="text-dusty-300">Getting Started</span>
                  </div>
                  <span class="text-dusty-400 text-sm">300</span>
                </div>
                <div
                  class="flex items-center justify-between p-3 bg-dusty-800/30 rounded-lg border border-dusty-700/30">
                  <div class="flex items-center space-x-3">
                    <div
                      :class="
                        userStats.creditScore >= 500
                          ? 'bg-green-500'
                          : 'bg-dusty-600'
                      "
                      class="w-3 h-3 rounded-full"></div>
                    <span class="text-dusty-300">Fair Credit</span>
                  </div>
                  <span class="text-dusty-400 text-sm">500</span>
                </div>
                <div
                  class="flex items-center justify-between p-3 bg-dusty-800/30 rounded-lg border border-dusty-700/30">
                  <div class="flex items-center space-x-3">
                    <div
                      :class="
                        userStats.creditScore >= 650
                          ? 'bg-green-500'
                          : 'bg-dusty-600'
                      "
                      class="w-3 h-3 rounded-full"></div>
                    <span class="text-dusty-300">Good Credit</span>
                  </div>
                  <span class="text-dusty-400 text-sm">650</span>
                </div>
                <div
                  class="flex items-center justify-between p-3 bg-dusty-800/30 rounded-lg border border-dusty-700/30">
                  <div class="flex items-center space-x-3">
                    <div
                      :class="
                        userStats.creditScore >= 750
                          ? 'bg-green-500'
                          : 'bg-dusty-600'
                      "
                      class="w-3 h-3 rounded-full"></div>
                    <span class="text-dusty-300">Excellent</span>
            </div>
                  <span class="text-dusty-400 text-sm">750</span>
            </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Credit History Chart -->
    <div v-if="creditHistory.length > 0" class="relative mb-12">
      <div
        class="bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-8 border border-dusty-600/40 shadow-2xl">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2
              class="text-3xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
              Credit Building Journey
            </h2>
            <p class="text-dusty-300">
              Track your financial progress over time
            </p>
      </div>
          <div class="hidden md:flex items-center space-x-2">
            <div class="w-3 h-3 bg-green-400 rounded-full"></div>
            <span class="text-sm text-dusty-300">Positive Impact</span>
      </div>
    </div>

        <div class="bg-dusty-900/50 rounded-2xl p-6 border border-dusty-700/30">
          <div class="h-80">
        <canvas ref="creditChart"></canvas>
      </div>
        </div>

        <!-- Event Statistics -->
        <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            class="bg-dusty-800/40 rounded-xl p-4 border border-dusty-700/30 text-center">
            <div class="text-2xl font-bold text-green-400 mb-1">
              +{{ creditEvents.payments_made || 0 }}
            </div>
            <div class="text-sm text-dusty-400">Payments Made</div>
          </div>
          <div
            class="bg-dusty-800/40 rounded-xl p-4 border border-dusty-700/30 text-center">
            <div class="text-2xl font-bold text-starlight-400 mb-1">
              +{{ creditEvents.vouches_given || 0 }}
            </div>
            <div class="text-sm text-dusty-400">Vouches Given</div>
          </div>
          <div
            class="bg-dusty-800/40 rounded-xl p-4 border border-dusty-700/30 text-center">
            <div class="text-2xl font-bold text-red-400 mb-1">
              {{ creditEvents.missed_payments || 0 }}
            </div>
            <div class="text-sm text-dusty-400">Missed Payments</div>
          </div>
          <div
            class="bg-dusty-800/40 rounded-xl p-4 border border-dusty-700/30 text-center">
            <div class="text-2xl font-bold text-frontier-400 mb-1">
              {{ creditHistory.length }}
        </div>
            <div class="text-sm text-dusty-400">Total Events</div>
        </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="relative mb-12">
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Start New Circle -->
        <div
          class="group relative bg-gradient-to-br from-frontier-800/30 via-dusty-800/20 to-frontier-700/30 backdrop-blur-sm rounded-3xl p-8 border border-frontier-600/40 shadow-2xl cursor-pointer hover:shadow-frontier-500/20 transition-all duration-300 hover:scale-105"
          @click="$router.push('/circles/create')">
          <!-- Animated background -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-frontier-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div class="relative z-10">
            <div class="flex items-center space-x-4 mb-4">
              <div
                class="w-16 h-16 bg-gradient-to-br from-frontier-400 to-starlight-400 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                🚀
              </div>
              <div>
                <h3
                  class="text-2xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
                  Start a New Circle
                </h3>
                <p class="text-dusty-300">
                  Create a lending circle and invite your community
                </p>
              </div>
            </div>

            <div
              class="flex items-center text-frontier-400 group-hover:text-starlight-400 transition-colors duration-300">
              <span class="text-sm font-semibold">Get Started</span>
              <svg
                class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Join Circle -->
        <div
          class="group relative bg-gradient-to-br from-starlight-800/30 via-dusty-800/20 to-cosmic-700/30 backdrop-blur-sm rounded-3xl p-8 border border-starlight-600/40 shadow-2xl cursor-pointer hover:shadow-starlight-500/20 transition-all duration-300 hover:scale-105"
          @click="joinCircle">
          <!-- Animated background -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-starlight-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div class="relative z-10">
            <div class="flex items-center space-x-4 mb-4">
              <div
                class="w-16 h-16 bg-gradient-to-br from-starlight-400 to-cosmic-400 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                🤝
              </div>
              <div>
                <h3
                  class="text-2xl font-bold bg-gradient-to-r from-starlight-300 to-cosmic-300 bg-clip-text text-transparent mb-2">
                  Join a Circle
                </h3>
                <p class="text-dusty-300">
                  Enter an invite code to join an existing circle
                </p>
              </div>
      </div>

            <div
              class="flex items-center text-starlight-400 group-hover:text-cosmic-400 transition-colors duration-300">
              <span class="text-sm font-semibold">Join Now</span>
              <svg
                class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="relative mb-12">
      <div
        class="bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-8 border border-dusty-600/40 shadow-2xl">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2
              class="text-3xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
              Recent Activity
            </h2>
            <p class="text-dusty-300">
              Your latest financial frontier adventures
            </p>
          </div>
          <div class="hidden md:flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span class="text-sm text-dusty-300">Live Updates</span>
          </div>
        </div>

        <div v-if="loading" class="text-center py-12">
          <div class="inline-flex items-center space-x-2">
            <div
              class="animate-spin rounded-full h-6 w-6 border-b-2 border-frontier-400"></div>
            <span class="text-dusty-300">Loading activity...</span>
          </div>
        </div>

        <div v-else-if="activities.length === 0" class="text-center py-12">
          <div
            class="w-24 h-24 bg-gradient-to-br from-frontier-500/20 to-starlight-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-4xl">🐎</span>
          </div>
          <h3 class="text-xl font-semibold text-dusty-300 mb-2">
            No Recent Activity
          </h3>
          <p class="text-dusty-400 mb-6">
            Time to saddle up and get started on your financial journey!
          </p>
          <button @click="$router.push('/circles/create')" class="btn-frontier">
            Start Your First Circle
          </button>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(activity, index) in activities"
            :key="activity.id"
            class="group relative bg-dusty-800/40 rounded-2xl p-6 border border-dusty-700/30 hover:border-frontier-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-frontier-500/10">
            <!-- Timeline indicator -->
            <div
              class="absolute left-6 top-8 w-0.5 h-full bg-gradient-to-b from-frontier-500 to-transparent opacity-30"
              v-if="index < activities.length - 1"></div>

            <div class="flex items-start space-x-4">
              <!-- Activity Icon -->
              <div
                class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-frontier-500/20 to-starlight-500/20 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                {{ activity.icon }}
              </div>

              <!-- Activity Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h4
                    class="text-lg font-semibold text-dusty-100 group-hover:text-frontier-300 transition-colors duration-300">
                    {{ activity.title }}
                  </h4>
                  <span
                    class="text-sm text-dusty-400 group-hover:text-dusty-300 transition-colors duration-300">
                    {{ activity.time }}
                  </span>
      </div>
                <p
                  class="text-dusty-400 mt-1 group-hover:text-dusty-300 transition-colors duration-300">
                  {{ activity.description }}
                </p>
      </div>

              <!-- Status indicator -->
              <div
                class="flex-shrink-0 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Join Circle Modal -->
    <div
      v-if="showJoinModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showJoinModal = false">
      <div
        class="bg-gradient-to-br from-dusty-800/90 via-frontier-800/80 to-dusty-700/90 backdrop-blur-sm rounded-3xl p-8 border border-frontier-600/40 shadow-2xl max-w-md w-full mx-4">
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 bg-gradient-to-br from-starlight-400 to-cosmic-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
            🤝
          </div>
          <h3
            class="text-2xl font-bold bg-gradient-to-r from-starlight-300 to-cosmic-300 bg-clip-text text-transparent mb-2">
            Join a Circle
          </h3>
          <p class="text-dusty-300">
            Enter the invite code to join an existing lending circle
          </p>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-dusty-300 mb-2"
              >Invite Code</label
            >
        <input
          v-model="inviteCode"
          type="text"
          placeholder="Enter invite code"
              class="w-full px-4 py-3 bg-dusty-900/50 border border-dusty-600/50 rounded-xl text-dusty-100 placeholder-dusty-400 focus:outline-none focus:ring-2 focus:ring-starlight-500/50 focus:border-starlight-500/50 transition-all duration-300" />
          </div>

          <div class="flex space-x-4">
            <button
              @click="handleJoinCircle"
              class="flex-1 bg-gradient-to-r from-starlight-500 to-cosmic-500 hover:from-starlight-600 hover:to-cosmic-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-starlight-500/25">
              Join Circle
            </button>
            <button
              @click="showJoinModal = false"
              class="flex-1 bg-dusty-700/50 hover:bg-dusty-600/50 text-dusty-300 font-semibold py-3 px-6 rounded-xl border border-dusty-600/50 hover:border-dusty-500/50 transition-all duration-300">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { useRouter } from "vue-router";
import { Chart, registerables } from "chart.js";
import api from "../services/api";

Chart.register(...registerables);

const { user } = useAuth0();
const router = useRouter();
const loading = ref(false);
const showJoinModal = ref(false);
const inviteCode = ref("");
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
  if (score >= 750) return "#10b981"; // green-500
  if (score >= 650) return "#3b82f6"; // blue-500
  if (score >= 500) return "#f59e0b"; // amber-500
  return "#ef4444"; // red-500
};

const getCreditRating = (score) => {
  if (score >= 750) return "Excellent";
  if (score >= 650) return "Good";
  if (score >= 500) return "Fair";
  return "Building";
};

const joinCircle = () => {
  showJoinModal.value = true;
};

const handleJoinCircle = async () => {
  if (!inviteCode.value) return;

  try {
    await api.circles.joinByInviteCode(inviteCode.value);
    alert("Successfully joined circle!");
    showJoinModal.value = false;
    inviteCode.value = "";
    router.push("/circles");
  } catch (error) {
    console.error("Error joining circle:", error);
    alert(error.response?.data?.error?.message || "Failed to join circle");
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
        (event) => new Date(event.created_at) >= thirtyDaysAgo
      );

      creditTrend.value = recentEvents.reduce(
        (sum, event) => sum + (event.impact || 0),
        0
      );

      // Count event types
      creditEvents.value = {
        payments_made: creditHistory.value.filter(
          (e) => e.event_type === "payment_made"
        ).length,
        vouches_given: creditHistory.value.filter(
          (e) => e.event_type === "vouch_given"
        ).length,
        missed_payments: creditHistory.value.filter(
          (e) => e.event_type === "payment_missed"
        ).length,
      };

      // Render credit chart
      await nextTick();
      renderCreditChart();
    }
  } catch (error) {
    console.error("Error loading credit data:", error);
  }
};

const renderCreditChart = () => {
  if (!creditChart.value) return;

  const ctx = creditChart.value.getContext("2d");

  // Prepare data
  const sortedHistory = [...creditHistory.value].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  let runningScore = 500; // Starting score
  const scores = sortedHistory.map((event) => {
    runningScore += event.impact || 0;
    return runningScore;
  });

  const labels = sortedHistory.map((event) =>
    new Date(event.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  );

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Credit Score",
        data: scores,
          borderColor: "#d97706",
          backgroundColor: "rgba(217, 119, 6, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            afterLabel: function (context) {
              const event = sortedHistory[context.dataIndex];
              return event.description || event.event_type;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 300,
          max: 850,
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
          ticks: {
            color: "#9ca3af",
          },
        },
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
          ticks: {
            color: "#9ca3af",
          },
        },
      },
    },
  });
};

const loadUserData = async () => {
  try {
    const currentUserResponse = await api.auth.getCurrentUser();
    currentUserId.value = currentUserResponse.data.data.id;

    // Load user's circles
    const circlesResponse = await api.users.getCircles(currentUserId.value);
    const circles = circlesResponse.data.data || [];
    userStats.value.activeCircles = circles.filter(
      (c) => c.status === "active"
    ).length;

    // Load payment stats
    const paymentsResponse = await api.payments.getByUser(currentUserId.value);
    const payments = paymentsResponse.data.data || [];
    userStats.value.paymentsMade = payments.length;
    userStats.value.totalContributed = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );

    // Convert recent payments to activities
    activities.value = payments.slice(0, 5).map((payment) => ({
      id: payment.id,
      icon: "✅",
      title: "Payment Made",
      description: `Contributed to "${payment.circle_name}"`,
      time: new Date(payment.created_at).toLocaleDateString(),
    }));

    // Load credit data
    await loadCreditData();
  } catch (error) {
    console.error("Error loading user data:", error);
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await loadUserData();
  } catch (error) {
    console.error("Error loading dashboard:", error);
  } finally {
    loading.value = false;
  }
});
</script>
