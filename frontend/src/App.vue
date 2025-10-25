<template>
  <div id="app" class="min-h-screen">
    <!-- Navigation -->
    <nav v-if="isAuthenticated" class="bg-dusty-800 border-b border-dusty-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center space-x-3">
            <span class="text-2xl">🤠</span>
            <span class="font-western text-xl text-frontier-400">PayItForward</span>
          </router-link>

          <!-- Nav Links -->
          <div class="hidden md:flex items-center space-x-6">
            <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
            <router-link to="/circles" class="nav-link">My Circles</router-link>
            <router-link to="/payments" class="nav-link">Payments</router-link>
            <router-link to="/credit" class="nav-link">Credit Score</router-link>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <span class="text-dusty-300">{{ user?.name || 'Cowboy' }}</span>
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
    <footer class="mt-16 py-8 border-t border-dusty-700 text-center text-dusty-400">
      <p class="text-sm">
        🤠 PayItForward - Pioneer Credit Union on the Financial Frontier
      </p>
      <p class="text-xs mt-2">Built for RowdyHacks 2025</p>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRouter } from 'vue-router';

const { isAuthenticated, user, logout: auth0Logout } = useAuth0();
const router = useRouter();

const logout = () => {
  auth0Logout({ logoutParams: { returnTo: window.location.origin } });
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
