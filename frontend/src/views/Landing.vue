<template>
  <div class="min-h-screen">
    <!-- Minimal Navbar -->
    <nav
      class="bg-dusty-900/90 backdrop-blur-sm border-b border-dusty-700 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <div class="text-2xl">🏕️</div>
            <h1 class="text-2xl font-bold text-frontier-300">PayItForward</h1>
          </div>

          <!-- CTA Buttons -->
          <div class="flex items-center space-x-3">
            <button @click="login" class="btn-frontier text-sm px-4 py-2">
              🚀 Login
            </button>
            <button @click="demoMode" class="btn-starlight text-sm px-4 py-2">
              🎮 Demo
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div
      class="relative bg-gradient-to-br from-frontier-900 via-frontier-800 to-dusty-900 py-20">
      <div class="absolute inset-0 bg-black opacity-20"></div>
      <div class="relative max-w-6xl mx-auto text-center px-4">
        <h1 class="western-title mb-6 text-6xl md:text-7xl">PayItForward</h1>
        <p class="text-3xl md:text-4xl text-frontier-300 mb-6 font-light">
          Pioneer Credit Union on the Financial Frontier
        </p>
        <p
          class="text-xl text-dusty-200 mb-10 max-w-4xl mx-auto leading-relaxed">
          Join digital lending circles, build credit, and support your community
          through our
          <span class="text-frontier-300 font-semibold"
            >collaborative financial platform</span
          >. Together, we thrive on the financial frontier.
        </p>

        <!-- CTA Buttons -->
        <div
          class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button @click="login" class="btn-frontier text-xl px-8 py-4">
            🚀 Start Your Journey
          </button>
          <button @click="demoMode" class="btn-starlight text-xl px-8 py-4">
            🎮 Try Demo Mode
          </button>
        </div>

        <!-- Demo Mode Info -->
        <div class="text-sm text-dusty-300">
          <p>💡 Click "Try Demo Mode" to explore without Auth0 setup</p>
        </div>
      </div>
    </div>

    <!-- Main Features Section -->
    <div class="py-20 bg-dusty-900">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-frontier-400 mb-6">
            Your Financial Frontier Awaits
          </h2>
          <p class="text-xl text-dusty-300 max-w-3xl mx-auto">
            Discover the power of community-driven finance with our
            comprehensive platform
          </p>
        </div>

        <!-- Core Features Grid -->
        <div class="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          <!-- Digital Lending Circles -->
          <div class="card-hover bg-frontier-800/20 border-frontier-600/30">
            <div class="text-5xl mb-4">🏕️</div>
            <h3 class="text-2xl font-bold mb-3 text-frontier-300">
              Digital Lending Circles
            </h3>
            <p class="text-dusty-300 leading-relaxed">
              Join or create lending circles where members contribute monthly
              and take turns receiving the full pot.
              <span class="text-frontier-300 font-semibold"
                >Automated tracking</span
              >
              and transparent scheduling.
            </p>
          </div>

          <!-- Community Marketplace -->
          <div class="card-hover bg-frontier-800/20 border-frontier-600/30">
            <div class="text-5xl mb-4">🛒</div>
            <h3 class="text-2xl font-bold mb-3 text-frontier-300">
              Community Marketplace
            </h3>
            <p class="text-dusty-300 leading-relaxed">
              Borrow and lend items within your community with
              <span class="text-frontier-300 font-semibold"
                >secure deposits</span
              >
              and
              <span class="text-frontier-300 font-semibold"
                >automated payments</span
              >.
            </p>
          </div>

          <!-- Credit Building -->
          <div class="card-hover bg-frontier-800/20 border-frontier-600/30">
            <div class="text-5xl mb-4">📈</div>
            <h3 class="text-2xl font-bold mb-3 text-frontier-300">
              Build Credit History
            </h3>
            <p class="text-dusty-300 leading-relaxed">
              Every on-time payment builds your
              <span class="text-frontier-300 font-semibold">credit score</span>
              and
              <span class="text-frontier-300 font-semibold"
                >financial future</span
              >
              with detailed tracking.
            </p>
          </div>

          <!-- Collaborative Vouching -->
          <div class="card-hover bg-frontier-800/20 border-frontier-600/30">
            <div class="text-5xl mb-4">🤝</div>
            <h3 class="text-2xl font-bold mb-3 text-frontier-300">
              Collaborative Vouching
            </h3>
            <p class="text-dusty-300 leading-relaxed">
              Members vouch for each other, building
              <span class="text-frontier-300 font-semibold">trust</span> and
              <span class="text-frontier-300 font-semibold"
                >community bonds</span
              >
              through reputation systems.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- How It Works Section -->
    <div class="py-20 bg-dusty-800">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-frontier-400 mb-6">
            How It Works
          </h2>
          <p class="text-xl text-dusty-300 max-w-3xl mx-auto">
            Simple steps to join the financial frontier
          </p>
        </div>

        <div class="grid md:grid-cols-4 gap-8">
          <div class="text-center">
            <div
              class="w-16 h-16 bg-frontier-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-white">1</span>
            </div>
            <h3 class="text-xl font-semibold mb-3 text-frontier-300">
              Join or Create
            </h3>
            <p class="text-dusty-300">
              Create a lending circle or join an existing one with a unique code
            </p>
          </div>

          <div class="text-center">
            <div
              class="w-16 h-16 bg-frontier-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-white">2</span>
            </div>
            <h3 class="text-xl font-semibold mb-3 text-frontier-300">
              Get Vouched
            </h3>
            <p class="text-dusty-300">
              Existing members vouch for you, building trust in the community
            </p>
          </div>

          <div class="text-center">
            <div
              class="w-16 h-16 bg-frontier-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-white">3</span>
            </div>
            <h3 class="text-xl font-semibold mb-3 text-frontier-300">
              Contribute
            </h3>
            <p class="text-dusty-300">
              Make monthly contributions and build your credit history
            </p>
          </div>

          <div class="text-center">
            <div
              class="w-16 h-16 bg-frontier-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-white">4</span>
            </div>
            <h3 class="text-xl font-semibold mb-3 text-frontier-300">
              Receive & Grow
            </h3>
            <p class="text-dusty-300">
              Take your turn receiving the pot and watch your credit grow
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Stories Section -->
    <div class="py-20 bg-frontier-900">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-frontier-300 mb-6">
            Success Stories
          </h2>
          <p class="text-xl text-dusty-300 max-w-3xl mx-auto">
            Real people building their financial future together
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div
            class="bg-dusty-800/50 p-6 rounded-lg border border-frontier-600/30">
            <div class="text-4xl mb-4">🌟</div>
            <p class="text-dusty-300 mb-4 italic">
              "PayItForward helped me build credit when traditional banks
              wouldn't give me a chance. Now I have a 720 credit score!"
            </p>
            <p class="text-frontier-300 font-semibold">
              - Maria, Circle Member
            </p>
          </div>

          <div
            class="bg-dusty-800/50 p-6 rounded-lg border border-frontier-600/30">
            <div class="text-4xl mb-4">💪</div>
            <p class="text-dusty-300 mb-4 italic">
              "The community marketplace is amazing! I borrowed tools for my
              construction project and saved hundreds of dollars."
            </p>
            <p class="text-frontier-300 font-semibold">
              - Ahmed, Community Member
            </p>
          </div>

          <div
            class="bg-dusty-800/50 p-6 rounded-lg border border-frontier-600/30">
            <div class="text-4xl mb-4">🤝</div>
            <p class="text-dusty-300 mb-4 italic">
              "The vouching system creates real trust. I know I can rely on my
              circle members because we all vouch for each other."
            </p>
            <p class="text-frontier-300 font-semibold">- Sarah, Circle Admin</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Final CTA Section -->
    <div class="py-20 bg-gradient-to-r from-frontier-800 to-dusty-800">
      <div class="max-w-4xl mx-auto text-center px-4">
        <h2 class="text-4xl md:text-5xl font-bold text-frontier-300 mb-6">
          Ready to Join the Frontier?
        </h2>
        <p class="text-xl text-dusty-200 mb-10 max-w-2xl mx-auto">
          Start building your financial future today with PayItForward's
          collaborative lending platform.
        </p>

        <div
          class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button @click="login" class="btn-frontier text-xl px-10 py-4">
            🚀 Get Started Now
          </button>
          <button @click="demoMode" class="btn-starlight text-xl px-10 py-4">
            🎮 Try Demo First
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth0 } from "@auth0/auth0-vue";
import { useRouter } from "vue-router";

const { loginWithRedirect } = useAuth0();
const router = useRouter();

const login = () => {
  loginWithRedirect({
    authorizationParams: {
      audience:
        import.meta.env.VITE_AUTH0_AUDIENCE || "https://api.payitforward.com",
      scope: "openid profile email",
    },
    appState: {
      returnTo: "/dashboard",
    },
  });
};

const demoMode = () => {
  // Skip Auth0 and go directly to dashboard
  router.push("/dashboard");
};

const scrollToLearnMore = () => {
  // Placeholder for scroll functionality
  alert("Learn more section coming soon!");
};
</script>
