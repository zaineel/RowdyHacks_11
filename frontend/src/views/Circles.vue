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

    <!-- Edit Circle Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-dusty-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 class="text-2xl font-bold text-frontier-400 mb-4">Edit Circle</h2>
        <p class="text-dusty-300 mb-6">Update circle details</p>

        <form @submit.prevent="updateCircle">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Circle Name</label>
            <input
              v-model="editForm.name"
              type="text"
              required
              placeholder="Enter circle name"
              class="input-field"
              :disabled="isUpdating"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
              v-model="editForm.description"
              placeholder="Enter description (optional)"
              rows="3"
              class="input-field resize-none"
              :disabled="isUpdating"
            ></textarea>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Status</label>
            <select
              v-model="editForm.status"
              class="input-field"
              :disabled="isUpdating"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="disbanded">Disbanded</option>
            </select>
          </div>

          <div class="flex space-x-3">
            <button
              type="button"
              @click="closeEditModal"
              class="btn-frontier-outline flex-1"
              :disabled="isUpdating"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-frontier flex-1"
              :disabled="isUpdating"
            >
              <span v-if="isUpdating" class="spinner inline-block mr-2"></span>
              {{ isUpdating ? 'Updating...' : 'Update Circle' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-dusty-800 rounded-lg p-6 max-w-md w-full mx-4 border-2 border-red-500/30">
        <h2 class="text-2xl font-bold text-red-400 mb-4">Disband Circle</h2>
        <p class="text-dusty-300 mb-2">Are you sure you want to disband this circle?</p>
        <p class="text-sm text-dusty-400 mb-6">This action cannot be undone. All members will be notified.</p>

        <div class="flex space-x-3">
          <button
            @click="closeDeleteModal"
            class="btn-frontier-outline flex-1"
            :disabled="isDeleting"
          >
            Cancel
          </button>
          <button
            @click="deleteCircle"
            class="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-200"
            :disabled="isDeleting"
          >
            <span v-if="isDeleting" class="spinner inline-block mr-2"></span>
            {{ isDeleting ? 'Disbanding...' : 'Yes, Disband' }}
          </button>
        </div>
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
        class="card-hover cursor-pointer relative"
        @click="$router.push(`/circles/${circle.id}`)"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-frontier-400">{{ circle.name }}</h3>
            <p class="text-sm text-dusty-400">{{ circle.description }}</p>
          </div>

          <div class="flex items-center space-x-2">
            <span :class="statusClass(circle.status)">
              {{ circle.status }}
            </span>

            <!-- 3-dot menu (only for admins) -->
            <div v-if="circle.role === 'admin'" class="relative">
              <button
                @click="toggleMenu(circle.id, $event)"
                class="p-2 hover:bg-dusty-700 rounded-lg transition-colors"
                :class="{ 'bg-dusty-700': openMenuId === circle.id }"
              >
                <svg class="w-5 h-5 text-dusty-300" fill="currentColor" viewBox="0 0 16 16">
                  <circle cx="8" cy="2" r="1.5"/>
                  <circle cx="8" cy="8" r="1.5"/>
                  <circle cx="8" cy="14" r="1.5"/>
                </svg>
              </button>

              <!-- Dropdown menu -->
              <div
                v-if="openMenuId === circle.id"
                @click.stop
                class="absolute right-0 mt-1 w-48 bg-dusty-800 border border-dusty-700 rounded-lg shadow-xl z-10"
              >
                <button
                  @click="openEditModal(circle, $event)"
                  class="w-full px-4 py-2 text-left text-dusty-100 hover:bg-dusty-700 rounded-t-lg transition-colors flex items-center space-x-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  <span>Edit Circle</span>
                </button>
                <button
                  @click="openDeleteModal(circle.id, $event)"
                  class="w-full px-4 py-2 text-left text-red-400 hover:bg-dusty-700 rounded-b-lg transition-colors flex items-center space-x-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  <span>Delete Circle</span>
                </button>
              </div>
            </div>
          </div>
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

// Menu and modal state
const openMenuId = ref(null);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingCircle = ref(null);
const deletingCircleId = ref(null);
const editForm = ref({
  name: '',
  description: '',
  status: 'active'
});
const isUpdating = ref(false);
const isDeleting = ref(false);

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

// Menu handlers
const toggleMenu = (circleId, event) => {
  event.stopPropagation();
  openMenuId.value = openMenuId.value === circleId ? null : circleId;
};

const closeMenu = () => {
  openMenuId.value = null;
};

// Edit circle handlers
const openEditModal = (circle, event) => {
  event.stopPropagation();
  editingCircle.value = circle;
  editForm.value = {
    name: circle.name,
    description: circle.description || '',
    status: circle.status
  };
  showEditModal.value = true;
  closeMenu();
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingCircle.value = null;
  editForm.value = {
    name: '',
    description: '',
    status: 'active'
  };
  isUpdating.value = false;
};

const updateCircle = async () => {
  if (!editForm.value.name.trim()) {
    alert('Please enter a circle name');
    return;
  }

  isUpdating.value = true;
  try {
    await api.circles.update(editingCircle.value.id, {
      name: editForm.value.name.trim(),
      description: editForm.value.description.trim(),
      status: editForm.value.status
    });

    alert('Circle updated successfully!');
    closeEditModal();
    await loadCircles();
  } catch (error) {
    console.error('Error updating circle:', error);
    alert(error.response?.data?.error?.message || 'Failed to update circle');
  } finally {
    isUpdating.value = false;
  }
};

// Delete circle handlers
const openDeleteModal = (circleId, event) => {
  event.stopPropagation();
  deletingCircleId.value = circleId;
  showDeleteModal.value = true;
  closeMenu();
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingCircleId.value = null;
  isDeleting.value = false;
};

const deleteCircle = async () => {
  isDeleting.value = true;
  try {
    await api.circles.delete(deletingCircleId.value);
    alert('Circle disbanded successfully!');
    closeDeleteModal();
    await loadCircles();
  } catch (error) {
    console.error('Error deleting circle:', error);
    alert(error.response?.data?.error?.message || 'Failed to disband circle');
  } finally {
    isDeleting.value = false;
  }
};

onMounted(async () => {
  await loadCircles();

  // Close menu when clicking outside
  document.addEventListener('click', closeMenu);
});
</script>
