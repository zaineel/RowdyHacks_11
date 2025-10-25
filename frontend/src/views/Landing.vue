<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-4xl mx-auto text-center px-4">
      <!-- Hero Section -->
      <div class="mb-12">
        <h1 class="western-title mb-4">
          PayItForward
        </h1>
        <p class="text-2xl text-frontier-300 mb-4">
          Pioneer Credit Union on the Financial Frontier
        </p>
        <p class="text-lg text-dusty-300 mb-8 max-w-2xl mx-auto">
          Join a digital lending circle. Build credit. Support your community.
          Together, we thrive on the financial frontier.
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-12">
        <div class="card-hover">
          <div class="text-4xl mb-3">🤝</div>
          <h3 class="text-xl font-semibold mb-2 text-frontier-400">Collaborative</h3>
          <p class="text-dusty-300">
            Members vouch for each other, building trust and community bonds
          </p>
        </div>

        <div class="card-hover">
          <div class="text-4xl mb-3">📈</div>
          <h3 class="text-xl font-semibold mb-2 text-frontier-400">Build Credit</h3>
          <p class="text-dusty-300">
            Every on-time payment builds your credit score and financial future
          </p>
        </div>

        <div class="card-hover">
          <div class="text-4xl mb-3">🔒</div>
          <h3 class="text-xl font-semibold mb-2 text-frontier-400">AI-Powered Security</h3>
          <p class="text-dusty-300">
            Advanced fraud detection keeps your lending circle safe
          </p>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button @click="login" class="btn-frontier text-lg">
          🚀 Get Started
        </button>
        <button @click="demoMode" class="btn-starlight text-lg">
          🎮 Demo Mode
        </button>
        <button @click="scrollToLearnMore" class="btn-frontier-outline text-lg">
          Learn More
        </button>
      </div>

      <!-- Demo Mode Info -->
      <div class="mt-6 text-sm text-dusty-400">
        <p>💡 Click "Demo Mode" to explore without Auth0 setup</p>
      </div>

      <!-- Tech Stack Badges -->
      <div class="mt-16 pt-8 border-t border-dusty-700">
        <p class="text-sm text-dusty-400 mb-4">Powered by</p>
        <div class="flex flex-wrap justify-center gap-4 text-sm text-dusty-300">
          <span class="badge-info">Auth0</span>
          <span class="badge-info">Cloudflare</span>
          <span class="badge-info">Vultr</span>
          <span class="badge-info">Gemini AI</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth0 } from '@auth0/auth0-vue';
import { useRouter } from 'vue-router';

const { loginWithRedirect } = useAuth0();
const router = useRouter();

const login = () => {
  loginWithRedirect();
};

const demoMode = () => {
  // Skip Auth0 and go directly to dashboard
  router.push('/dashboard');
};

const scrollToLearnMore = () => {
  // Placeholder for scroll functionality
  alert('Learn more section coming soon!');
};
</script>
