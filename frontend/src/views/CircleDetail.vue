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
            <!-- Vouch button for all active members (including admin) who haven't vouched yet -->
            <button
              v-if="member.status === 'pending' && member.user_id !== currentUserId && !userVouches.has(member.user_id)"
              @click="vouchMember(member)"
              class="btn-frontier text-sm"
              :disabled="vouching"
            >
              {{ vouching ? 'Vouching...' : 'Vouch' }}
            </button>
            <!-- Show "Vouched" badge if user already vouched -->
            <span
              v-if="member.status === 'pending' && userVouches.has(member.user_id)"
              class="text-xs px-3 py-1 rounded bg-frontier-500/20 text-frontier-400 border border-frontier-500"
            >
              ✓ Vouched
            </span>
            <!-- Approve button for admin only -->
            <button
              v-if="member.status === 'pending' && isAdmin"
              @click="approveMember(member)"
              class="btn-starlight text-sm ml-2"
              :disabled="approving"
            >
              {{ approving ? 'Approving...' : 'Approve' }}
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
import { useAuth0 } from '@auth0/auth0-vue';
import api from '../services/api';

const route = useRoute();
const { user } = useAuth0();
const activeTab = ref('members');
const loading = ref(false);
const vouching = ref(false);
const approving = ref(false);
const currentUserId = ref(null);
const isAdmin = ref(false);

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
const userVouches = ref(new Map()); // Track which members current user has vouched for

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

const vouchMember = async (member) => {
  if (!confirm(`Vouch for ${member.name}? This will help them get approved to join the circle.`)) {
    return;
  }

  vouching.value = true;
  try {
    await api.vouches.create({
      circle_id: route.params.id,
      vouchee_id: member.user_id,
      trust_level: 5,
      notes: `Vouched for ${member.name}`
    });

    // Mark that current user has vouched for this member
    userVouches.value.set(member.user_id, true);

    alert(`Successfully vouched for ${member.name}!`);

    // Reload members to show updated status
    const membersResponse = await api.circles.getMembers(route.params.id);
    members.value = membersResponse.data.data;
  } catch (error) {
    console.error('Error vouching for member:', error);

    // If duplicate vouch, mark it as vouched
    if (error.response?.status === 409 || error.response?.data?.error?.message?.includes('already')) {
      userVouches.value.set(member.user_id, true);
      alert(`You have already vouched for ${member.name}!`);
    } else {
      const errorMessage = error.response?.data?.error?.message || 'Failed to vouch for member. Please try again.';
      alert(errorMessage);
    }
  } finally {
    vouching.value = false;
  }
};

const approveMember = async (member) => {
  if (!confirm(`Approve ${member.name} to join the circle?`)) {
    return;
  }

  approving.value = true;
  try {
    await api.circles.approveMember(route.params.id, member.user_id);

    alert(`${member.name} has been approved and is now an active member!`);

    // Reload circle data and members
    const circleResponse = await api.circles.getById(route.params.id);
    circle.value = circleResponse.data.data;

    const membersResponse = await api.circles.getMembers(route.params.id);
    members.value = membersResponse.data.data;

    const scheduleResponse = await api.circles.getSchedule(route.params.id);
    payoutSchedule.value = scheduleResponse.data.data;
  } catch (error) {
    console.error('Error approving member:', error);
    const errorMessage = error.response?.data?.error?.message || 'Failed to approve member. Please try again.';
    alert(errorMessage);
  } finally {
    approving.value = false;
  }
};

onMounted(async () => {
  const circleId = route.params.id;
  loading.value = true;

  try {
    // Get current user's database ID
    const currentUserResponse = await api.auth.getCurrentUser();
    currentUserId.value = currentUserResponse.data.data.id;

    // Load circle data
    const circleResponse = await api.circles.getById(circleId);
    circle.value = circleResponse.data.data;

    // Check if current user is the admin
    isAdmin.value = circle.value.admin_id === currentUserId.value;

    // Load members (non-critical, continue if it fails)
    try {
      const membersResponse = await api.circles.getMembers(circleId);
      members.value = membersResponse.data.data;
    } catch (error) {
      console.error('Error loading members:', error);
    }

    // Load payout schedule (non-critical, continue if it fails)
    try {
      const scheduleResponse = await api.circles.getSchedule(circleId);
      payoutSchedule.value = scheduleResponse.data.data;
    } catch (error) {
      console.error('Error loading schedule:', error);
    }

    // Load current user's vouches in this circle (non-critical, continue if it fails)
    try {
      const vouchesResponse = await api.vouches.getMyVouches(circleId);
      // Populate the userVouches Map with vouchee_ids
      vouchesResponse.data.data.forEach(vouch => {
        userVouches.value.set(vouch.vouchee_id, true);
      });
    } catch (error) {
      console.error('Error loading vouches:', error);
    }
  } catch (error) {
    console.error('Error loading circle:', error);
    alert('Failed to load circle details. Please try again.');
  } finally {
    loading.value = false;
  }
});
</script>
