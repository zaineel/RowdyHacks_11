<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-frontier-400 mb-2">My Circles</h1>
        <p class="text-dusty-300">Manage your lending circles</p>
      </div>
      <button @click="$router.push('/circles/create')" class="btn-frontier">
        + Create New Circle
      </button>
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
const circles = ref([
  {
    id: '1',
    name: 'Pioneer Circle',
    description: 'Our first community circle',
    status: 'active',
    monthly_amount: 100,
    current_members: 8,
    max_members: 10,
    next_payout_date: '2025-11-15',
  },
  {
    id: '2',
    name: 'Frontier Fund',
    description: 'Student emergency fund',
    status: 'active',
    monthly_amount: 50,
    current_members: 15,
    max_members: 20,
    next_payout_date: '2025-11-20',
  },
]);

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

onMounted(async () => {
  loading.value = true;
  try {
    // Load user circles
    // const response = await api.users.getCircles(user.value.sub);
    // circles.value = response.data.data;
  } catch (error) {
    console.error('Error loading circles:', error);
  } finally {
    loading.value = false;
  }
});
</script>
