<template>
  <div id="app" class="min-h-screen">
    <!-- Navigation -->
    <nav v-if="isAuthenticated" class="bg-dusty-800 border-b border-dusty-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center space-x-3">
            <span class="text-2xl">🤠</span>
            <span class="font-western text-xl text-frontier-400"
              >PayItForward</span
            >
          </router-link>

          <!-- Nav Links -->
          <div class="hidden md:flex items-center space-x-6">
            <router-link to="/dashboard" class="nav-link"
              >Dashboard</router-link
            >
            <router-link to="/circles" class="nav-link">My Circles</router-link>
            <router-link to="/marketplace" class="nav-link relative">
              Marketplace
              <span
                v-if="pendingRequestsCount > 0"
                class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {{ pendingRequestsCount }}
              </span>
            </router-link>
            <router-link to="/payments" class="nav-link">Payments</router-link>
            <router-link to="/credit" class="nav-link"
              >Credit Score</router-link
            >
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <span class="text-dusty-300">{{ user?.name || "Cowboy" }}</span>
            <button @click="logout" class="btn-frontier-outline text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>

    <!-- Footer -->
    <footer
      class="mt-16 py-8 border-t border-dusty-700 text-center text-dusty-400">
      <p class="text-sm">
        🤠 PayItForward - Pioneer Credit Union on the Financial Frontier
      </p>
      <p class="text-xs mt-2">Built for RowdyHacks 2025</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { useRouter } from "vue-router";
import { setAuth0TokenGetter } from "./services/api";
import api from "./services/api";

const router = useRouter();

// Check if in demo mode
const isDemoMode =
  import.meta.env.VITE_DEMO_MODE === "true" ||
  import.meta.env.VITE_AUTH0_DOMAIN === "demo-mode";

// Demo user for testing
const demoUser = ref({
  name: "Demo Cowboy",
  email: "demo@payitforward.com",
});

// Use Auth0 or demo mode
let isAuthenticated, user, auth0Logout, getAccessTokenSilently;

if (!isDemoMode) {
  const auth0 = useAuth0();
  isAuthenticated = auth0.isAuthenticated;
  user = auth0.user;
  auth0Logout = auth0.logout;
  getAccessTokenSilently = auth0.getAccessTokenSilently;

  // Set up Auth0 token getter for API calls
  onMounted(() => {
    setAuth0TokenGetter(getAccessTokenSilently);
  });

  // Register user in database after Auth0 login
  watch(
    isAuthenticated,
    async (authenticated) => {
      if (authenticated && user.value) {
        try {
          // Try to get user from our database
          const response = await api.auth.getCurrentUser();
          console.log("User already registered:", response.data);
        } catch (error) {
          if (error.response?.status === 404) {
            // User not in database, register them
            console.log("Registering new user in database...");
            try {
              await api.auth.register({
                name: user.value.name || user.value.email,
                phone_number: user.value.phone_number || "",
                language_preference: "en",
              });
              console.log("User registered successfully!");
            } catch (registerError) {
              console.error("Error registering user:", registerError);
            }
          }
        }
      }
    },
    { immediate: true }
  );
} else {
  // Demo mode - always authenticated
  isAuthenticated = ref(true);
  user = demoUser;
  auth0Logout = () => {};
}

// Notification state
const pendingRequestsCount = ref(0);

// Load pending requests count
const loadPendingRequestsCount = async () => {
  if (!isAuthenticated.value) return;

  try {
    const response = await api.marketplace.pendingRequests();
    pendingRequestsCount.value = response.data.data.length;
  } catch (error) {
    console.error("Error loading pending requests count:", error);
  }
};

// Load notifications on mount and when authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    loadPendingRequestsCount();
  }

  // Listen for notification refresh events
  window.addEventListener("refreshNotifications", loadPendingRequestsCount);
});

// Watch for authentication changes
watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    loadPendingRequestsCount();
  } else {
    pendingRequestsCount.value = 0;
  }
});

const logout = () => {
  if (isDemoMode) {
    router.push("/");
  } else {
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  }
};
</script>

<style scoped>
.nav-link {
  @apply text-dusty-300 hover:text-frontier-400 transition-colors duration-200 font-medium;
}

.router-link-active {
  @apply text-frontier-400;
}
</style>
