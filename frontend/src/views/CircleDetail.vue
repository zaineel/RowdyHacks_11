<template>
  <div>
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
            <span class="text-2xl">{{ slot.has_received ? '✅' : index === circle.current_cycle - 1 ? '➡️' : '⏳' }}</span>
            <div>
              <p class="font-medium">{{ slot.user_name }}</p>
              <p class="text-sm text-dusty-400">Position {{ index + 1 }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold text-frontier-400">${{ circle.monthly_amount * circle.current_members }}</p>
            <p class="text-xs text-dusty-400">{{ slot.has_received ? 'Received' : 'Pending' }}</p>
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const activeTab = ref('members');

const circle = ref({
  name: 'Pioneer Circle',
  description: 'Our first community circle',
  status: 'active',
  monthly_amount: 100,
  current_members: 8,
  max_members: 10,
  current_cycle: 3,
  next_payout_date: '2025-11-15',
  invite_code: 'ABC123XYZ',
});

const members = ref([
  { id: 1, name: 'John Doe', credit_score: 680, status: 'active' },
  { id: 2, name: 'Jane Smith', credit_score: 720, status: 'active' },
  { id: 3, name: 'Maria Garcia', credit_score: 650, status: 'active' },
  { id: 4, name: 'Ahmed Khan', credit_score: 590, status: 'pending' },
]);

const payoutSchedule = ref([
  { user_name: 'John Doe', has_received: true },
  { user_name: 'Jane Smith', has_received: true },
  { user_name: 'Maria Garcia', has_received: false },
  { user_name: 'Ahmed Khan', has_received: false },
]);

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
  try {
    // Load circle data
    // const response = await api.circles.getById(circleId);
    // circle.value = response.data.data;
  } catch (error) {
    console.error('Error loading circle:', error);
  }
});
</script>
