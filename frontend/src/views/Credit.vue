<template>
  <div>
    <h1 class="text-3xl font-bold text-frontier-400 mb-2">Credit Score</h1>
    <p class="text-dusty-300 mb-8">Track your financial reputation</p>

    <!-- Credit Score Card -->
    <div class="card mb-8 text-center">
      <div class="text-dusty-400 text-sm mb-2">Your Credit Score</div>
      <div class="text-7xl font-bold text-frontier-400 mb-4">{{ creditScore }}</div>
      <div class="text-sm text-green-400">+15 points this month 📈</div>

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
    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <div class="card">
        <h3 class="text-sm text-dusty-400 mb-2">Payment History</h3>
        <div class="text-2xl font-bold text-green-400">98%</div>
        <p class="text-xs text-dusty-300 mt-2">On-time payments</p>
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
    <div class="card">
      <h2 class="text-2xl font-semibold mb-4 text-frontier-400">Recent Activity</h2>
      <div class="space-y-3">
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
              <p class="text-dusty-100">{{ event.description }}</p>
              <p class="text-sm text-dusty-400">{{ event.circle_name }}</p>
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
import { ref, onMounted } from 'vue';
import api from '../services/api';

const creditScore = ref(650);
const activeCircles = ref(2);
const vouchesReceived = ref(5);

const creditHistory = ref([
  {
    id: 1,
    description: 'Made on-time payment',
    circle_name: 'Pioneer Circle',
    impact: 10,
    date: '2 days ago',
  },
  {
    id: 2,
    description: 'Received vouch from member',
    circle_name: 'Frontier Fund',
    impact: 15,
    date: '5 days ago',
  },
  {
    id: 3,
    description: 'Joined new circle',
    circle_name: 'Starship Savings',
    impact: 5,
    date: '1 week ago',
  },
]);

onMounted(async () => {
  try {
    // Load credit data
    // const response = await api.credit.getHistory(userId);
  } catch (error) {
    console.error('Error loading credit data:', error);
  }
});
</script>
