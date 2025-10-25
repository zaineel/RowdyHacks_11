<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-frontier-400 mb-2">
        Welcome back, {{ user?.name || 'Pioneer' }}! 🤠
      </h1>
      <p class="text-dusty-300">Your frontier at a glance</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid md:grid-cols-4 gap-6 mb-8">
      <div class="card">
        <div class="text-dusty-400 text-sm mb-1">Credit Score</div>
        <div class="text-3xl font-bold text-frontier-400">{{ userStats.creditScore }}</div>
        <div class="text-xs text-green-400 mt-1">+15 this month</div>
      </div>

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
import { ref, onMounted } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import api from '../services/api';

const { user } = useAuth0();
const loading = ref(false);
const showJoinModal = ref(false);
const inviteCode = ref('');

const userStats = ref({
  creditScore: 650,
  activeCircles: 2,
  totalContributed: 1250,
  paymentsMade: 12,
});

const activities = ref([
  {
    id: 1,
    icon: '💰',
    title: 'Payment Received',
    description: 'Received payout from "Pioneer Circle"',
    time: '2 hours ago',
  },
  {
    id: 2,
    icon: '✅',
    title: 'Payment Made',
    description: 'Made monthly contribution to "Frontier Fund"',
    time: '1 day ago',
  },
  {
    id: 3,
    icon: '🤝',
    title: 'New Vouch',
    description: 'Received vouch from Maria G.',
    time: '3 days ago',
  },
]);

const joinCircle = () => {
  showJoinModal.value = true;
};

const handleJoinCircle = async () => {
  if (!inviteCode.value) return;

  try {
    // API call would go here
    console.log('Joining circle with code:', inviteCode.value);
    showJoinModal.value = false;
    inviteCode.value = '';
  } catch (error) {
    console.error('Error joining circle:', error);
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    // Load user data
    // const response = await api.users.getById(user.value.sub);
    // userStats.value = response.data;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    loading.value = false;
  }
});
</script>
