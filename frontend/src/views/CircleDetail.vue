<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="spinner mx-auto"></div>
      <p class="text-dusty-300 mt-4">Loading circle details...</p>
    </div>

    <div v-else>
    <!-- Header -->
    <div class="flex justify-between items-start mb-8">
      <div>
        <h1 class="text-3xl font-bold text-frontier-400 mb-2">{{ circle.name }}</h1>
        <p class="text-dusty-300">{{ circle.description }}</p>
      </div>
      <span :class="`badge-${circle.status === 'active' ? 'success' : 'warning'}`">
        {{ circle.status }}
      </span>
    </div>

    <!-- Circle Stats -->
    <div class="grid md:grid-cols-4 gap-6 mb-8">
      <div class="card">
        <div class="text-dusty-400 text-sm mb-1">Monthly Amount</div>
        <div class="text-3xl font-bold text-frontier-400">${{ circle.monthly_amount }}</div>
      </div>
      <div class="card">
        <div class="text-dusty-400 text-sm mb-1">Members</div>
        <div class="text-3xl font-bold text-starlight-400">{{ circle.current_members }}/{{ circle.max_members }}</div>
      </div>
      <div class="card">
        <div class="text-dusty-400 text-sm mb-1">Current Cycle</div>
        <div class="text-3xl font-bold text-cosmic-400">{{ circle.current_cycle }}</div>
      </div>
      <div class="card">
        <div class="text-dusty-400 text-sm mb-1">Next Payout</div>
        <div class="text-lg font-bold text-green-400">{{ formatDate(circle.next_payout_date) }}</div>
      </div>
    </div>

    <!-- Invite Code -->
    <div class="card mb-8 bg-starlight-900/20 border-starlight-700">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="font-semibold text-starlight-400 mb-1">Invite Code</h3>
          <p class="text-2xl font-mono font-bold">{{ circle.invite_code }}</p>
        </div>
        <button class="btn-starlight" @click="copyInviteCode">
          Copy Code
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-dusty-700">
      <div class="flex space-x-6">
        <button
          :class="activeTab === 'members' ? 'border-frontier-500 text-frontier-400' : 'border-transparent text-dusty-400'"
          class="pb-3 border-b-2 font-medium transition-colors"
          @click="activeTab = 'members'"
        >
          Members
        </button>
        <button
          :class="activeTab === 'schedule' ? 'border-frontier-500 text-frontier-400' : 'border-transparent text-dusty-400'"
          class="pb-3 border-b-2 font-medium transition-colors"
          @click="activeTab = 'schedule'"
        >
          Payout Schedule
        </button>
        <button
          :class="activeTab === 'payments' ? 'border-frontier-500 text-frontier-400' : 'border-transparent text-dusty-400'"
          class="pb-3 border-b-2 font-medium transition-colors"
          @click="activeTab = 'payments'"
        >
          Payments
        </button>
      </div>
    </div>

    <!-- Members Tab -->
    <div v-if="activeTab === 'members'" class="card">
      <h3 class="text-xl font-semibold mb-4 text-frontier-400">Circle Members</h3>
      <div class="space-y-3">
        <div
          v-for="member in members"
          :key="member.id"
          class="flex items-center justify-between p-3 bg-dusty-700 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-frontier-500 rounded-full flex items-center justify-center text-white font-bold">
              {{ member.name.charAt(0) }}
            </div>
            <div>
              <p class="font-medium">{{ member.name }}</p>
              <p class="text-sm text-dusty-400">Credit Score: {{ member.credit_score }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span :class="`badge-${member.status === 'active' ? 'success' : 'warning'}`">
              {{ member.status }}
            </span>
            <button v-if="member.status === 'pending'" class="btn-frontier text-sm">
              Vouch
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Tab -->
    <div v-if="activeTab === 'schedule'" class="card">
      <h3 class="text-xl font-semibold mb-4 text-frontier-400">Payout Schedule</h3>
      <div class="space-y-2">
        <div
          v-for="(slot, index) in payoutSchedule"
          :key="index"
          class="flex items-center justify-between p-3 bg-dusty-700 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <span class="text-2xl">{{ slot.has_received_payout ? '✅' : slot.position_in_cycle === circle.current_cycle ? '➡️' : '⏳' }}</span>
            <div>
              <p class="font-medium">{{ slot.user_name }}</p>
              <p class="text-sm text-dusty-400">Position {{ slot.position_in_cycle }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold text-frontier-400">${{ slot.monthly_amount * circle.current_members }}</p>
            <p class="text-xs text-dusty-400">{{ slot.has_received_payout ? 'Received' : 'Pending' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Payments Tab -->
    <div v-if="activeTab === 'payments'" class="card">
      <h3 class="text-xl font-semibold mb-4 text-frontier-400">Recent Payments</h3>
      <div class="text-center py-8 text-dusty-400">
        Payment history coming soon...
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const activeTab = ref('members');
const loading = ref(false);

const circle = ref({
  name: '',
  description: '',
  status: 'pending',
  monthly_amount: 0,
  current_members: 0,
  max_members: 0,
  current_cycle: 1,
  next_payout_date: null,
  invite_code: '',
});

const members = ref([]);
const payoutSchedule = ref([]);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const copyInviteCode = () => {
  navigator.clipboard.writeText(circle.value.invite_code);
  alert('Invite code copied to clipboard!');
};

onMounted(async () => {
  const circleId = route.params.id;
  loading.value = true;

  try {
    // Load circle data
    const circleResponse = await api.circles.getById(circleId);
    circle.value = circleResponse.data.data;

    // Load members
    const membersResponse = await api.circles.getMembers(circleId);
    members.value = membersResponse.data.data;

    // Load payout schedule
    const scheduleResponse = await api.circles.getSchedule(circleId);
    payoutSchedule.value = scheduleResponse.data.data;
  } catch (error) {
    console.error('Error loading circle:', error);
    alert('Failed to load circle details. Please try again.');
  } finally {
    loading.value = false;
  }
});
</script>
