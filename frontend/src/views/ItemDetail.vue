<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="spinner mx-auto"></div>
    </div>

    <!-- Item Details -->
    <div v-else-if="item" class="max-w-4xl mx-auto">
      <!-- Back Button -->
      <button @click="$router.push('/marketplace')" class="text-frontier-400 hover:text-frontier-300 mb-6">
        ← Back to Marketplace
      </button>

      <div class="card">
        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div class="text-6xl">{{ getCategoryIcon(item.category) }}</div>
            <div>
              <h1 class="text-3xl font-bold text-frontier-400">{{ item.title }}</h1>
              <p class="text-dusty-400">{{ item.category }}</p>
            </div>
          </div>
          <span :class="getStatusBadge(item.status)" class="text-lg">
            {{ item.status }}
          </span>
        </div>

        <!-- Description -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-frontier-400 mb-2">Description</h2>
          <p class="text-dusty-300">{{ item.description || 'No description provided' }}</p>
        </div>

        <!-- Details Grid -->
        <div class="grid md:grid-cols-3 gap-6 mb-6">
          <div class="card bg-dusty-700">
            <div class="text-sm text-dusty-400 mb-1">Deposit Required</div>
            <div class="text-2xl font-bold text-frontier-400">${{ item.deposit_amount }}</div>
            <div class="text-xs text-dusty-400 mt-1">Refundable</div>
          </div>

          <div class="card bg-dusty-700">
            <div class="text-sm text-dusty-400 mb-1">Daily Rate</div>
            <div class="text-2xl font-bold text-starlight-400">
              {{ item.daily_rate > 0 ? `$${item.daily_rate}` : 'Free' }}
            </div>
            <div class="text-xs text-dusty-400 mt-1">Per day</div>
          </div>

          <div class="card bg-dusty-700">
            <div class="text-sm text-dusty-400 mb-1">Condition</div>
            <div class="text-2xl font-bold text-cosmic-400 capitalize">{{ item.condition }}</div>
            <div class="text-xs text-dusty-400 mt-1">{{ item.total_borrows || 0 }} times borrowed</div>
          </div>
        </div>

        <!-- Owner Info -->
        <div class="card bg-dusty-700 mb-6">
          <h3 class="text-lg font-semibold text-frontier-400 mb-3">Owner Information</h3>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-dusty-100 font-medium">{{ item.owner_name }}</p>
              <p class="text-sm text-dusty-400">Member since {{ formatDate(item.created_at) }}</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-dusty-400">Credit Score</div>
              <div class="text-xl font-bold text-frontier-400">{{ item.owner_credit_score }}</div>
            </div>
          </div>
        </div>

        <!-- Borrow Section (if not owner and item available) -->
        <div v-if="!isOwner && item.status === 'available'" class="card bg-dusty-700">
          <h3 class="text-lg font-semibold text-frontier-400 mb-4">Request to Borrow</h3>

          <!-- Credit Check -->
          <div v-if="userCreditScore < item.min_credit_score" class="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <p class="text-red-400 font-medium">⚠️ Credit Score Too Low</p>
            <p class="text-sm text-dusty-300 mt-1">
              Required: {{ item.min_credit_score }} | Your score: {{ userCreditScore }}
            </p>
          </div>

          <form v-else @submit.prevent="submitBorrowRequest">
            <div class="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium mb-2">Start Date</label>
                <input
                  v-model="borrowForm.start_date"
                  type="date"
                  required
                  :min="today"
                  class="input-field"
                  :disabled="isRequesting"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">End Date</label>
                <input
                  v-model="borrowForm.end_date"
                  type="date"
                  required
                  :min="borrowForm.start_date || today"
                  class="input-field"
                  :disabled="isRequesting"
                />
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Notes (Optional)</label>
              <textarea
                v-model="borrowForm.notes"
                rows="3"
                placeholder="Tell the owner why you need this item..."
                class="input-field resize-none"
                :disabled="isRequesting"
              ></textarea>
            </div>

            <!-- Cost Calculation -->
            <div v-if="totalCost" class="bg-frontier-500/10 border border-frontier-500/30 rounded-lg p-4 mb-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-dusty-300">Deposit:</span>
                <span class="font-bold text-dusty-100">${{ item.deposit_amount }}</span>
              </div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-dusty-300">Rental ({{ borrowDays }} days):</span>
                <span class="font-bold text-dusty-100">${{ rentalFee }}</span>
              </div>
              <div class="flex justify-between items-center pt-2 border-t border-frontier-500/30">
                <span class="text-frontier-400 font-bold">Total:</span>
                <span class="text-frontier-400 font-bold text-xl">${{ totalCost }}</span>
              </div>
              <p class="text-xs text-dusty-400 mt-2">Deposit will be refunded when item is returned in good condition</p>
            </div>

            <button
              type="submit"
              class="btn-frontier w-full"
              :disabled="isRequesting || !borrowForm.start_date || !borrowForm.end_date"
            >
              <span v-if="isRequesting" class="spinner inline-block mr-2"></span>
              {{ isRequesting ? 'Sending Request...' : 'Request to Borrow' }}
            </button>
          </form>
        </div>

        <!-- Owner Actions -->
        <div v-else-if="isOwner" class="flex gap-3">
          <button @click="editItem" class="btn-frontier-outline flex-1">
            Edit Item
          </button>
          <button @click="deleteItem" class="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-200">
            Delete Item
          </button>
        </div>

        <!-- Already Borrowed -->
        <div v-else-if="item.status === 'borrowed'" class="card bg-yellow-500/10 border border-yellow-500/30">
          <p class="text-yellow-400">This item is currently borrowed by someone else.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const isRequesting = ref(false);
const item = ref(null);
const currentUserId = ref(null);
const userCreditScore = ref(500);

const borrowForm = ref({
  start_date: '',
  end_date: '',
  notes: ''
});

const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const isOwner = computed(() => {
  return item.value && currentUserId.value && item.value.owner_id === currentUserId.value;
});

const borrowDays = computed(() => {
  if (!borrowForm.value.start_date || !borrowForm.value.end_date) return 0;
  const start = new Date(borrowForm.value.start_date);
  const end = new Date(borrowForm.value.end_date);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

const rentalFee = computed(() => {
  return item.value ? borrowDays.value * item.value.daily_rate : 0;
});

const totalCost = computed(() => {
  if (!item.value) return 0;
  return parseFloat(item.value.deposit_amount) + rentalFee.value;
});

const loadItem = async () => {
  loading.value = true;
  try {
    // Get current user
    const userResponse = await api.auth.getCurrentUser();
    currentUserId.value = userResponse.data.data.id;
    userCreditScore.value = userResponse.data.data.credit_score || 500;

    // Get item details
    const response = await api.marketplace.getById(route.params.id);
    item.value = response.data.data;
  } catch (error) {
    console.error('Error loading item:', error);
    alert('Failed to load item details.');
    router.push('/marketplace');
  } finally {
    loading.value = false;
  }
};

const submitBorrowRequest = async () => {
  isRequesting.value = true;
  try {
    await api.marketplace.requestBorrow(route.params.id, {
      borrow_start_date: borrowForm.value.start_date,
      borrow_end_date: borrowForm.value.end_date,
      notes: borrowForm.value.notes
    });

    alert('Borrow request sent successfully! The owner will be notified.');
    router.push('/marketplace/my-dashboard');
  } catch (error) {
    console.error('Error requesting borrow:', error);
    alert(error.response?.data?.error?.message || 'Failed to send borrow request. Please try again.');
  } finally {
    isRequesting.value = false;
  }
};

const editItem = () => {
  router.push(`/marketplace/edit/${item.value.id}`);
};

const deleteItem = async () => {
  if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
    return;
  }

  try {
    await api.marketplace.delete(item.value.id);
    alert('Item deleted successfully!');
    router.push('/marketplace');
  } catch (error) {
    console.error('Error deleting item:', error);
    alert(error.response?.data?.error?.message || 'Failed to delete item.');
  }
};

const getCategoryIcon = (category) => {
  const icons = {
    tools: '🔧',
    electronics: '💻',
    books: '📚',
    sports: '⚽',
    household: '🏠',
    other: '📦'
  };
  return icons[category] || icons.other;
};

const getStatusBadge = (status) => {
  const badges = {
    available: 'badge-success',
    borrowed: 'badge-warning',
    unavailable: 'badge-danger'
  };
  return badges[status] || 'badge';
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
};

onMounted(async () => {
  await loadItem();
});
</script>
