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

    <div class="relative max-w-7xl mx-auto px-4 py-12">
      <!-- Header Section -->
      <div class="mb-12">
        <div
          class="flex flex-col lg:flex-row items-center justify-between mb-8">
          <div class="flex-1 mb-6 lg:mb-0">
            <div class="flex items-center space-x-4 mb-4">
              <div
                class="w-16 h-16 bg-gradient-to-br from-frontier-400 to-starlight-400 rounded-2xl flex items-center justify-center text-2xl animate-pulse">
                🏕️
              </div>
              <div>
                <h1
                  class="text-5xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
                  My Circles
                </h1>
                <p class="text-xl text-dusty-300">
                  Manage your lending circles and community
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="showJoinModal = true"
              class="group relative bg-dusty-700/50 hover:bg-dusty-600/50 text-dusty-300 font-semibold py-3 px-6 rounded-2xl border border-dusty-600/50 hover:border-dusty-500/50 transition-all duration-300 hover:scale-105">
              <div class="flex items-center space-x-3">
                <span class="text-xl">🤝</span>
                <span>Join Circle</span>
              </div>
            </button>
            <button
              @click="$router.push('/circles/create')"
              class="group relative bg-gradient-to-r from-frontier-500 to-starlight-500 hover:from-frontier-600 hover:to-starlight-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-frontier-500/25">
              <div class="flex items-center space-x-3">
                <span class="text-xl">🚀</span>
                <span>Create New Circle</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Join Circle Modal -->
      <div
        v-if="showJoinModal"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
        @click.self="closeJoinModal">
        <div
          class="bg-gradient-to-br from-dusty-800/90 via-frontier-800/80 to-dusty-700/90 backdrop-blur-sm rounded-3xl p-8 border border-frontier-600/40 shadow-2xl max-w-md w-full mx-4">
          <div class="text-center mb-8">
            <div
              class="w-16 h-16 bg-gradient-to-br from-starlight-400 to-cosmic-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              🤝
            </div>
            <h2
              class="text-2xl font-bold bg-gradient-to-r from-starlight-300 to-cosmic-300 bg-clip-text text-transparent mb-2">
              Join a Circle
            </h2>
            <p class="text-dusty-300">
              Enter the invite code provided by the circle admin
            </p>
          </div>

          <form @submit.prevent="joinCircle" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-dusty-300 mb-2"
                >Invite Code</label
              >
              <input
                v-model="inviteCode"
                type="text"
                required
                placeholder="Enter invite code"
                class="w-full px-4 py-3 bg-dusty-900/50 border border-dusty-600/50 rounded-xl text-dusty-100 placeholder-dusty-400 focus:outline-none focus:ring-2 focus:ring-starlight-500/50 focus:border-starlight-500/50 transition-all duration-300 uppercase"
                :disabled="joiningCircle" />
            </div>

            <div class="flex space-x-4">
              <button
                type="button"
                @click="closeJoinModal"
                class="flex-1 bg-dusty-700/50 hover:bg-dusty-600/50 text-dusty-300 font-semibold py-3 px-6 rounded-xl border border-dusty-600/50 hover:border-dusty-500/50 transition-all duration-300"
                :disabled="joiningCircle">
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 bg-gradient-to-r from-starlight-500 to-cosmic-500 hover:from-starlight-600 hover:to-cosmic-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-starlight-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                :disabled="joiningCircle">
                <div class="flex items-center justify-center space-x-2">
                  <div
                    v-if="joiningCircle"
                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{{
                    joiningCircle ? "Joining..." : "Join Circle"
                  }}</span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Circle Modal -->
      <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
        @click.self="closeEditModal">
        <div
          class="bg-gradient-to-br from-dusty-800/90 via-frontier-800/80 to-dusty-700/90 backdrop-blur-sm rounded-3xl p-8 border border-frontier-600/40 shadow-2xl max-w-md w-full mx-4">
          <div class="text-center mb-8">
            <div
              class="w-16 h-16 bg-gradient-to-br from-frontier-400 to-starlight-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              ✏️
            </div>
            <h2
              class="text-2xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
              Edit Circle
            </h2>
            <p class="text-dusty-300">Update circle details and settings</p>
          </div>

          <form @submit.prevent="updateCircle" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-dusty-300 mb-2"
                >Circle Name</label
              >
              <input
                v-model="editForm.name"
                type="text"
                required
                placeholder="Enter circle name"
                class="w-full px-4 py-3 bg-dusty-900/50 border border-dusty-600/50 rounded-xl text-dusty-100 placeholder-dusty-400 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300"
                :disabled="isUpdating" />
            </div>

            <div>
              <label class="block text-sm font-medium text-dusty-300 mb-2"
                >Description</label
              >
              <textarea
                v-model="editForm.description"
                placeholder="Enter description (optional)"
                rows="3"
                class="w-full px-4 py-3 bg-dusty-900/50 border border-dusty-600/50 rounded-xl text-dusty-100 placeholder-dusty-400 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300 resize-none"
                :disabled="isUpdating"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-dusty-300 mb-2"
                >Status</label
              >
              <select
                v-model="editForm.status"
                class="w-full px-4 py-3 bg-dusty-900/50 border border-dusty-600/50 rounded-xl text-dusty-100 focus:outline-none focus:ring-2 focus:ring-frontier-500/50 focus:border-frontier-500/50 transition-all duration-300"
                :disabled="isUpdating">
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="disbanded">Disbanded</option>
              </select>
            </div>

            <div class="flex space-x-4">
              <button
                type="button"
                @click="closeEditModal"
                class="flex-1 bg-dusty-700/50 hover:bg-dusty-600/50 text-dusty-300 font-semibold py-3 px-6 rounded-xl border border-dusty-600/50 hover:border-dusty-500/50 transition-all duration-300"
                :disabled="isUpdating">
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 bg-gradient-to-r from-frontier-500 to-starlight-500 hover:from-frontier-600 hover:to-starlight-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-frontier-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                :disabled="isUpdating">
                <div class="flex items-center justify-center space-x-2">
                  <div
                    v-if="isUpdating"
                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{{
                    isUpdating ? "Updating..." : "Update Circle"
                  }}</span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
        @click.self="closeDeleteModal">
        <div
          class="bg-gradient-to-br from-red-900/20 via-dusty-800/90 to-red-800/20 backdrop-blur-sm rounded-3xl p-8 border border-red-600/40 shadow-2xl max-w-md w-full mx-4">
          <div class="text-center mb-8">
            <div
              class="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              ⚠️
            </div>
            <h2
              class="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent mb-2">
              Disband Circle
            </h2>
            <p class="text-dusty-300 mb-2">
              Are you sure you want to disband this circle?
            </p>
            <p class="text-sm text-dusty-400">
              This action cannot be undone. All members will be notified.
            </p>
          </div>

          <div class="flex space-x-4">
            <button
              @click="closeDeleteModal"
              class="flex-1 bg-dusty-700/50 hover:bg-dusty-600/50 text-dusty-300 font-semibold py-3 px-6 rounded-xl border border-dusty-600/50 hover:border-dusty-500/50 transition-all duration-300"
              :disabled="isDeleting">
              Cancel
            </button>
            <button
              @click="deleteCircle"
              class="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              :disabled="isDeleting">
              <div class="flex items-center justify-center space-x-2">
                <div
                  v-if="isDeleting"
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{{ isDeleting ? "Disbanding..." : "Yes, Disband" }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-flex flex-col items-center space-y-4">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-frontier-400"></div>
          <p class="text-dusty-300 text-lg">Loading your circles...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="circles.length === 0" class="relative">
        <div
          class="bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-12 border border-dusty-600/40 shadow-2xl text-center">
          <div
            class="w-24 h-24 bg-gradient-to-br from-frontier-500/20 to-starlight-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-4xl">🏕️</span>
          </div>
          <h3 class="text-2xl font-bold text-dusty-300 mb-4">No Circles Yet</h3>
          <p class="text-dusty-400 mb-8 text-lg">
            You're not part of any lending circles yet. Start your financial
            journey by creating or joining a circle!
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              @click="$router.push('/circles/create')"
              class="bg-gradient-to-r from-frontier-500 to-starlight-500 hover:from-frontier-600 hover:to-starlight-600 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-frontier-500/25">
              <div class="flex items-center space-x-3">
                <span class="text-xl">🚀</span>
                <span>Create Your First Circle</span>
              </div>
            </button>
            <button
              @click="showJoinModal = true"
              class="bg-dusty-700/50 hover:bg-dusty-600/50 text-dusty-300 font-semibold py-3 px-8 rounded-2xl border border-dusty-600/50 hover:border-dusty-500/50 transition-all duration-300 hover:scale-105">
              <div class="flex items-center space-x-3">
                <span class="text-xl">🤝</span>
                <span>Join a Circle</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Circles Grid -->
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="circle in circles"
          :key="circle.id"
          class="group relative bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-6 border border-dusty-600/40 shadow-2xl cursor-pointer hover:shadow-frontier-500/20 transition-all duration-300 hover:scale-105"
          @click="$router.push(`/circles/${circle.id}`)">
          <!-- Animated background -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-frontier-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div class="relative z-10">
            <!-- Header -->
            <div class="flex justify-between items-start mb-6">
              <div class="flex-1">
                <h3
                  class="text-2xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
                  {{ circle.name }}
                </h3>
                <p class="text-dusty-300 text-sm leading-relaxed">
                  {{ circle.description || "No description provided" }}
                </p>
              </div>

              <div class="flex items-center space-x-3">
                <!-- Status Badge -->
                <span
                  :class="statusClass(circle.status)"
                  class="px-3 py-1 rounded-full text-xs font-semibold">
                  {{ circle.status }}
                </span>

                <!-- 3-dot menu (only for admins) -->
                <div v-if="circle.role === 'admin'" class="relative">
                  <button
                    @click="toggleMenu(circle.id, $event)"
                    class="p-2 hover:bg-dusty-700/50 rounded-xl transition-colors"
                    :class="{ 'bg-dusty-700/50': openMenuId === circle.id }">
                    <svg
                      class="w-5 h-5 text-dusty-300"
                      fill="currentColor"
                      viewBox="0 0 16 16">
                      <circle cx="8" cy="2" r="1.5" />
                      <circle cx="8" cy="8" r="1.5" />
                      <circle cx="8" cy="14" r="1.5" />
                    </svg>
                  </button>

                  <!-- Dropdown menu -->
                  <div
                    v-if="openMenuId === circle.id"
                    @click.stop
                    class="absolute right-0 mt-2 w-48 bg-dusty-800/90 backdrop-blur-sm border border-dusty-700/50 rounded-2xl shadow-2xl z-10">
                    <button
                      @click="openEditModal(circle, $event)"
                      class="w-full px-4 py-3 text-left text-dusty-100 hover:bg-dusty-700/50 rounded-t-2xl transition-colors flex items-center space-x-3">
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Circle</span>
                    </button>
                    <button
                      @click="openDeleteModal(circle.id, $event)"
                      class="w-full px-4 py-3 text-left text-red-400 hover:bg-dusty-700/50 rounded-b-2xl transition-colors flex items-center space-x-3">
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete Circle</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-dusty-800/40 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-frontier-400 mb-1">
                  ${{ circle.monthly_amount }}
                </div>
                <div class="text-xs text-dusty-400">Monthly Amount</div>
              </div>
              <div class="bg-dusty-800/40 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-starlight-400 mb-1">
                  {{ circle.current_members }}/{{ circle.max_members }}
                </div>
                <div class="text-xs text-dusty-400">Members</div>
              </div>
            </div>

            <!-- Next Payout -->
            <div
              class="bg-gradient-to-r from-starlight-800/20 to-cosmic-800/20 rounded-xl p-4 border border-starlight-600/30">
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 bg-gradient-to-br from-starlight-400 to-cosmic-400 rounded-lg flex items-center justify-center text-sm">
                  📅
                </div>
                <div>
                  <div class="text-xs text-dusty-400 mb-1">Next Payout</div>
                  <div class="text-sm font-semibold text-dusty-100">
                    {{ formatDate(circle.next_payout_date) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Hover indicator -->
            <div
              class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div
                class="w-2 h-2 bg-frontier-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import api from "../services/api";

const { user } = useAuth0();
const loading = ref(false);
const circles = ref([]);
const showJoinModal = ref(false);
const inviteCode = ref("");
const joiningCircle = ref(false);

// Menu and modal state
const openMenuId = ref(null);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingCircle = ref(null);
const deletingCircleId = ref(null);
const editForm = ref({
  name: "",
  description: "",
  status: "active",
});
const isUpdating = ref(false);
const isDeleting = ref(false);

const statusClass = (status) => {
  const classes = {
    active: "badge-success",
    pending: "badge-warning",
    completed: "badge-info",
  };
  return classes[status] || "badge";
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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
    console.error("Error loading circles:", error);
  } finally {
    loading.value = false;
  }
};

const joinCircle = async () => {
  if (!inviteCode.value.trim()) {
    alert("Please enter an invite code");
    return;
  }

  joiningCircle.value = true;
  try {
    const response = await api.circles.joinByInviteCode(
      inviteCode.value.trim()
    );
    alert(response.data.message || "Successfully joined the circle!");

    // Close modal and reset form
    closeJoinModal();

    // Reload circles to show the newly joined circle
    await loadCircles();
  } catch (error) {
    console.error("Error joining circle:", error);
    const errorMessage =
      error.response?.data?.error?.message ||
      "Failed to join circle. Please check the invite code and try again.";
    alert(errorMessage);
  } finally {
    joiningCircle.value = false;
  }
};

const closeJoinModal = () => {
  showJoinModal.value = false;
  inviteCode.value = "";
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
    description: circle.description || "",
    status: circle.status,
  };
  showEditModal.value = true;
  closeMenu();
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingCircle.value = null;
  editForm.value = {
    name: "",
    description: "",
    status: "active",
  };
  isUpdating.value = false;
};

const updateCircle = async () => {
  if (!editForm.value.name.trim()) {
    alert("Please enter a circle name");
    return;
  }

  isUpdating.value = true;
  try {
    await api.circles.update(editingCircle.value.id, {
      name: editForm.value.name.trim(),
      description: editForm.value.description.trim(),
      status: editForm.value.status,
    });

    alert("Circle updated successfully!");
    closeEditModal();
    await loadCircles();
  } catch (error) {
    console.error("Error updating circle:", error);
    alert(error.response?.data?.error?.message || "Failed to update circle");
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
    alert("Circle disbanded successfully!");
    closeDeleteModal();
    await loadCircles();
  } catch (error) {
    console.error("Error deleting circle:", error);
    alert(error.response?.data?.error?.message || "Failed to disband circle");
  } finally {
    isDeleting.value = false;
  }
};

onMounted(async () => {
  await loadCircles();

  // Close menu when clicking outside
  document.addEventListener("click", closeMenu);
});
</script>
