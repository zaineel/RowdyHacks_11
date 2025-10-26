<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-frontier-400 mb-2">My Circles</h1>
        <p class="text-dusty-300">Manage your lending circles</p>
      </div>
      <div class="flex space-x-3">
        <button @click="showJoinModal = true" class="btn-frontier-outline">
          Join Circle
        </button>
        <button @click="$router.push('/circles/create')" class="btn-frontier">
          + Create New Circle
        </button>
      </div>
    </div>

    <!-- Join Circle Modal -->
    <div v-if="showJoinModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-dusty-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 class="text-2xl font-bold text-frontier-400 mb-4">Join a Circle</h2>
        <p class="text-dusty-300 mb-6">Enter the invite code provided by the circle admin</p>

        <form @submit.prevent="joinCircle">
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Invite Code</label>
            <input
              v-model="inviteCode"
              type="text"
              required
              placeholder="Enter invite code"
              class="input-field uppercase"
              :disabled="joiningCircle"
            />
          </div>

          <div class="flex space-x-3">
            <button
              type="button"
              @click="closeJoinModal"
              class="btn-frontier-outline flex-1"
              :disabled="joiningCircle"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-frontier flex-1"
              :disabled="joiningCircle"
            >
              <span v-if="joiningCircle" class="spinner inline-block mr-2"></span>
              {{ joiningCircle ? 'Joining...' : 'Join Circle' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="spinner mx-auto"></div>
    </div>

    <div v-else-if="circles.length === 0" class="card text-center py-12">
      <p class="text-dusty-300 mb-4">You're not part of any circles yet</p>
      <button @click="$router.push('/circles/create')" class="btn-frontier">
        Create Your First Circle
      </button>
    </div>

    <div v-else class="grid md:grid-cols-2 gap-6">
      <div
        v-for="circle in circles"
        :key="circle.id"
        class="card-hover cursor-pointer"
        @click="$router.push(`/circles/${circle.id}`)"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold text-frontier-400">{{ circle.name }}</h3>
            <p class="text-sm text-dusty-400">{{ circle.description }}</p>
          </div>
          <span :class="statusClass(circle.status)">
            {{ circle.status }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-dusty-700">
          <div>
            <div class="text-dusty-400 text-sm">Monthly Amount</div>
            <div class="text-lg font-semibold text-frontier-400">${{ circle.monthly_amount }}</div>
          </div>
          <div>
            <div class="text-dusty-400 text-sm">Members</div>
            <div class="text-lg font-semibold text-starlight-400">{{ circle.current_members }}/{{ circle.max_members }}</div>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-dusty-700">
          <div class="text-dusty-400 text-sm mb-1">Next Payout</div>
          <div class="text-dusty-100">{{ formatDate(circle.next_payout_date) }}</div>
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
const circles = ref([]);
const showJoinModal = ref(false);
const inviteCode = ref('');
const joiningCircle = ref(false);

const statusClass = (status) => {
  const classes = {
    active: 'badge-success',
    pending: 'badge-warning',
    completed: 'badge-info',
  };
  return classes[status] || 'badge';
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const loadCircles = async () => {
  loading.value = true;
  try {
    // First get current user from database to get the database user ID
    const currentUserResponse = await api.auth.getCurrentUser();
    const dbUserId = currentUserResponse.data.data.id;

    // Then load user circles using the database user ID
    const circlesResponse = await api.users.getCircles(dbUserId);
    circles.value = circlesResponse.data.data;
  } catch (error) {
    console.error('Error loading circles:', error);
  } finally {
    loading.value = false;
  }
};

const joinCircle = async () => {
  if (!inviteCode.value.trim()) {
    alert('Please enter an invite code');
    return;
  }

  joiningCircle.value = true;
  try {
    const response = await api.circles.joinByInviteCode(inviteCode.value.trim());
    alert(response.data.message || 'Successfully joined the circle!');

    // Close modal and reset form
    closeJoinModal();

    // Reload circles to show the newly joined circle
    await loadCircles();
  } catch (error) {
    console.error('Error joining circle:', error);
    const errorMessage = error.response?.data?.error?.message || 'Failed to join circle. Please check the invite code and try again.';
    alert(errorMessage);
  } finally {
    joiningCircle.value = false;
  }
};

const closeJoinModal = () => {
  showJoinModal.value = false;
  inviteCode.value = '';
  joiningCircle.value = false;
};

onMounted(async () => {
  await loadCircles();
});
</script>
