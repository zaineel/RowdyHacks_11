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
                📊
              </div>
              <div>
                <h1
                  class="text-5xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
                  My Marketplace
                </h1>
                <p class="text-xl text-dusty-300">
                  Manage your listings and borrows
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="$router.push('/marketplace/list')"
              class="group relative bg-gradient-to-r from-frontier-500 to-starlight-500 hover:from-frontier-600 hover:to-starlight-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-frontier-500/25">
              <div class="flex items-center space-x-3">
                <span class="text-xl">➕</span>
                <span>List an Item</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs Section -->
      <div class="mb-12">
        <div
          class="bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-6 border border-dusty-600/40 shadow-2xl">
          <div class="flex flex-wrap gap-3">
            <button
              @click="activeTab = 'listings'"
              :class="[
                'group relative flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105',
                activeTab === 'listings'
                  ? 'bg-gradient-to-r from-frontier-500 to-starlight-500 text-white shadow-lg shadow-frontier-500/25'
                  : 'bg-dusty-700/50 text-dusty-300 hover:bg-dusty-600/50 border border-dusty-600/50 hover:border-dusty-500/50',
              ]">
              <span class="text-xl">📦</span>
              <span>My Listings</span>
              <span
                v-if="listings.length > 0"
                class="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-bold">
                {{ listings.length }}
              </span>
            </button>

            <button
              @click="activeTab = 'borrows'"
              :class="[
                'group relative flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105',
                activeTab === 'borrows'
                  ? 'bg-gradient-to-r from-frontier-500 to-starlight-500 text-white shadow-lg shadow-frontier-500/25'
                  : 'bg-dusty-700/50 text-dusty-300 hover:bg-dusty-600/50 border border-dusty-600/50 hover:border-dusty-500/50',
              ]">
              <span class="text-xl">🤝</span>
              <span>My Borrows</span>
              <span
                v-if="borrows.length > 0"
                class="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-bold">
                {{ borrows.length }}
              </span>
            </button>

            <button
              @click="activeTab = 'requests'"
              :class="[
                'group relative flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105',
                activeTab === 'requests'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25'
                  : 'bg-dusty-700/50 text-dusty-300 hover:bg-dusty-600/50 border border-dusty-600/50 hover:border-dusty-500/50',
              ]">
              <span class="text-xl">✉️</span>
              <span>Borrow Requests</span>
              <span
                v-if="pendingRequests.length > 0"
                class="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-bold animate-pulse">
                {{ pendingRequests.length }}
              </span>
            </button>

            <button
              @click="activeTab = 'payments'"
              :class="[
                'group relative flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105',
                activeTab === 'payments'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25'
                  : 'bg-dusty-700/50 text-dusty-300 hover:bg-dusty-600/50 border border-dusty-600/50 hover:border-dusty-500/50',
              ]">
              <span class="text-xl">💳</span>
              <span>Payments</span>
              <span
                v-if="pendingPayments.length > 0"
                class="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-bold animate-pulse">
                {{ pendingPayments.length }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-flex flex-col items-center space-y-4">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-frontier-400"></div>
          <p class="text-dusty-300 text-lg">Loading marketplace data...</p>
        </div>
      </div>

      <!-- My Listings Tab -->
      <div v-else-if="activeTab === 'listings'">
        <div v-if="listings.length === 0" class="relative">
          <div
            class="bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-12 border border-dusty-600/40 shadow-2xl text-center">
            <div
              class="w-24 h-24 bg-gradient-to-br from-frontier-500/20 to-starlight-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-4xl">📦</span>
            </div>
            <h3 class="text-2xl font-bold text-dusty-300 mb-4">
              No Items Listed Yet
            </h3>
            <p class="text-dusty-400 mb-8 text-lg">
              Start lending to earn credit points and help your community!
            </p>
            <button
              @click="$router.push('/marketplace/list')"
              class="bg-gradient-to-r from-frontier-500 to-starlight-500 hover:from-frontier-600 hover:to-starlight-600 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-frontier-500/25">
              <div class="flex items-center space-x-3">
                <span class="text-xl">➕</span>
                <span>List Your First Item</span>
              </div>
            </button>
          </div>
        </div>

        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="item in listings"
            :key="item.id"
            class="group relative bg-gradient-to-br from-dusty-800/30 via-frontier-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-6 border border-dusty-600/40 shadow-2xl hover:shadow-frontier-500/20 transition-all duration-300 hover:scale-105">
            <!-- Animated background -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-frontier-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div class="relative z-10">
              <div class="flex items-start justify-between mb-4">
                <h3
                  class="text-xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent group-hover:from-starlight-300 group-hover:to-cosmic-300 transition-all duration-300">
                  {{ item.title }}
                </h3>
                <span
                  :class="getStatusBadge(item.status)"
                  class="px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm">
                  {{ item.status }}
                </span>
              </div>

              <div class="space-y-3 mb-6">
                <div
                  class="flex items-center justify-between p-3 bg-dusty-800/40 rounded-xl border border-dusty-700/30">
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span class="text-sm text-dusty-300">Deposit</span>
                  </div>
                  <span class="text-lg font-bold text-green-400"
                    >${{ item.deposit_amount }}</span
                  >
                </div>

                <div
                  class="flex items-center justify-between p-3 bg-dusty-800/40 rounded-xl border border-dusty-700/30">
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-starlight-400 rounded-full"></div>
                    <span class="text-sm text-dusty-300">Daily Rate</span>
                  </div>
                  <span class="text-lg font-bold text-starlight-400">
                    {{ item.daily_rate > 0 ? `$${item.daily_rate}` : "Free" }}
                  </span>
                </div>

                <div
                  class="flex items-center justify-between p-3 bg-dusty-800/40 rounded-xl border border-dusty-700/30">
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-cosmic-400 rounded-full"></div>
                    <span class="text-sm text-dusty-300">Total Borrows</span>
                  </div>
                  <span class="text-lg font-bold text-cosmic-400">{{
                    item.total_borrows || 0
                  }}</span>
                </div>
              </div>

              <div
                v-if="item.pending_requests > 0"
                class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
                <p class="text-yellow-400 text-sm">
                  ⚠️ {{ item.pending_requests }} pending request(s)
                </p>
              </div>

              <div class="flex gap-2">
                <button
                  @click="$router.push(`/marketplace/${item.id}`)"
                  class="btn-frontier-outline flex-1 text-sm">
                  View
                </button>
                <button
                  @click="deleteItem(item.id)"
                  class="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- My Borrows Tab -->
      <div v-else-if="activeTab === 'borrows'">
        <div v-if="borrows.length === 0" class="relative">
          <div
            class="bg-gradient-to-br from-dusty-800/30 via-starlight-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-12 border border-dusty-600/40 shadow-2xl text-center">
            <div
              class="w-24 h-24 bg-gradient-to-br from-starlight-500/20 to-cosmic-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-4xl">🤝</span>
            </div>
            <h3 class="text-2xl font-bold text-dusty-300 mb-4">
              No Borrow History Yet
            </h3>
            <p class="text-dusty-400 mb-8 text-lg">
              Browse the marketplace to borrow items!
            </p>
            <button
              @click="$router.push('/marketplace')"
              class="bg-gradient-to-r from-starlight-500 to-cosmic-500 hover:from-starlight-600 hover:to-cosmic-600 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-starlight-500/25">
              <div class="flex items-center space-x-3">
                <span class="text-xl">🔍</span>
                <span>Browse Marketplace</span>
              </div>
            </button>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="borrow in borrows"
            :key="borrow.id"
            class="group relative bg-gradient-to-br from-dusty-800/30 via-starlight-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-6 border border-dusty-600/40 shadow-2xl hover:shadow-starlight-500/20 transition-all duration-300 hover:scale-105">
            <!-- Animated background -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-starlight-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div class="relative z-10">
              <div class="flex items-start justify-between mb-6">
                <div class="flex-1">
                  <h3
                    class="text-xl font-bold bg-gradient-to-r from-starlight-300 to-cosmic-300 bg-clip-text text-transparent group-hover:from-cosmic-300 group-hover:to-starlight-300 transition-all duration-300 mb-2">
                    {{ borrow.item_title }}
                  </h3>
                  <p
                    class="text-dusty-400 group-hover:text-dusty-300 transition-colors duration-300">
                    Owner: {{ borrow.owner_name }}
                  </p>
                </div>
                <span
                  :class="getBorrowStatusBadge(borrow.status)"
                  class="px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm">
                  {{ borrow.status }}
                </span>
              </div>

              <div class="grid md:grid-cols-3 gap-4 mb-6">
                <div
                  class="p-4 bg-dusty-800/40 rounded-xl border border-dusty-700/30">
                  <div class="flex items-center space-x-2 mb-2">
                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span class="text-sm text-dusty-300">Start Date</span>
                  </div>
                  <div class="text-lg font-bold text-green-400">
                    {{ formatDate(borrow.borrow_start_date) }}
                  </div>
                </div>

                <div
                  class="p-4 bg-dusty-800/40 rounded-xl border border-dusty-700/30">
                  <div class="flex items-center space-x-2 mb-2">
                    <div class="w-2 h-2 bg-starlight-400 rounded-full"></div>
                    <span class="text-sm text-dusty-300">End Date</span>
                  </div>
                  <div class="text-lg font-bold text-starlight-400">
                    {{ formatDate(borrow.borrow_end_date) }}
                  </div>
                </div>

                <div
                  class="p-4 bg-dusty-800/40 rounded-xl border border-dusty-700/30">
                  <div class="flex items-center space-x-2 mb-2">
                    <div class="w-2 h-2 bg-cosmic-400 rounded-full"></div>
                    <span class="text-sm text-dusty-300">Deposit</span>
                  </div>
                  <div class="text-lg font-bold text-cosmic-400">
                    ${{ borrow.deposit_paid }}
                  </div>
                </div>
              </div>

              <div v-if="borrow.status === 'approved'" class="mt-6">
                <button
                  @click="markAsReturned(borrow.id)"
                  class="w-full bg-gradient-to-r from-frontier-500 to-starlight-500 hover:from-frontier-600 hover:to-starlight-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-frontier-500/25">
                  <div class="flex items-center justify-center space-x-3">
                    <span class="text-xl">✅</span>
                    <span>Mark as Returned</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Borrow Requests Tab -->
      <div v-else-if="activeTab === 'requests'">
        <div v-if="pendingRequests.length === 0" class="relative">
          <div
            class="bg-gradient-to-br from-dusty-800/30 via-cosmic-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-12 border border-dusty-600/40 shadow-2xl text-center">
            <div
              class="w-24 h-24 bg-gradient-to-br from-cosmic-500/20 to-starlight-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-4xl">✉️</span>
            </div>
            <h3 class="text-2xl font-bold text-dusty-300 mb-4">
              No Pending Requests
            </h3>
            <p class="text-dusty-400 text-lg">
              Borrow requests will appear here
            </p>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="request in pendingRequests"
            :key="request.id"
            class="group relative bg-gradient-to-br from-dusty-800/30 via-yellow-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-6 border border-yellow-600/40 shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 hover:scale-105">
            <!-- Animated background -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div class="relative z-10">
              <div class="flex items-start justify-between mb-6">
                <div class="flex-1">
                  <h3
                    class="text-xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent group-hover:from-orange-300 group-hover:to-yellow-300 transition-all duration-300 mb-4">
                    {{ request.item_title }}
                  </h3>
                  <div class="grid md:grid-cols-2 gap-4 mb-4">
                    <div class="flex items-center space-x-2">
                      <div class="w-2 h-2 bg-starlight-400 rounded-full"></div>
                      <span class="text-sm text-dusty-400">Requested by:</span>
                      <span class="font-semibold text-starlight-400">{{
                        request.borrower_name
                      }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="w-2 h-2 bg-cosmic-400 rounded-full"></div>
                      <span class="text-sm text-dusty-400">Credit Score:</span>
                      <span
                        class="font-semibold"
                        :class="
                          getCreditScoreClass(request.borrower_credit_score)
                        ">
                        {{ request.borrower_credit_score }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <span
                    class="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold border border-yellow-500/30 backdrop-blur-sm"
                    >pending approval</span
                  >
                  <p class="text-xs text-dusty-400 mt-2">
                    {{ formatDate(request.created_at) }}
                  </p>
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-4 mb-6">
                <div
                  class="p-4 bg-dusty-800/40 rounded-xl border border-dusty-700/30">
                  <div class="flex items-center space-x-2 mb-2">
                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span class="text-sm text-dusty-300">From</span>
                  </div>
                  <div class="text-lg font-bold text-green-400">
                    {{ formatDate(request.borrow_start_date) }}
                  </div>
                </div>

                <div
                  class="p-4 bg-dusty-800/40 rounded-xl border border-dusty-700/30">
                  <div class="flex items-center space-x-2 mb-2">
                    <div class="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span class="text-sm text-dusty-300">To</span>
                  </div>
                  <div class="text-lg font-bold text-orange-400">
                    {{ formatDate(request.borrow_end_date) }}
                  </div>
                </div>
              </div>

              <div
                v-if="request.notes"
                class="bg-dusty-800/40 rounded-xl p-4 mb-6 border border-dusty-700/30">
                <div class="flex items-center space-x-2 mb-2">
                  <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span class="text-sm text-dusty-300 font-semibold"
                    >Notes</span
                  >
                </div>
                <p class="text-dusty-300">{{ request.notes }}</p>
              </div>

              <div class="flex space-x-4">
                <button
                  @click="approveBorrow(request.id)"
                  class="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25">
                  <div class="flex items-center justify-center space-x-3">
                    <span class="text-xl">✅</span>
                    <span>Approve Request</span>
                  </div>
                </button>
                <button
                  @click="rejectBorrow(request.id)"
                  class="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25">
                  <div class="flex items-center justify-center space-x-3">
                    <span class="text-xl">❌</span>
                    <span>Reject Request</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payments Tab -->
      <div v-else-if="activeTab === 'payments'">
        <div
          v-if="pendingPayments.length === 0 && paymentHistory.length === 0"
          class="relative">
          <div
            class="bg-gradient-to-br from-dusty-800/30 via-green-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-12 border border-dusty-600/40 shadow-2xl text-center">
            <div
              class="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-4xl">💳</span>
            </div>
            <h3 class="text-2xl font-bold text-dusty-300 mb-4">
              No Payment Activity
            </h3>
            <p class="text-dusty-400 text-lg">
              Deposit payments and refunds will appear here
            </p>
          </div>
        </div>

        <div v-else class="space-y-6">
          <!-- Pending Payments -->
          <div v-if="pendingPayments.length > 0">
            <div class="flex items-center space-x-3 mb-6">
              <div
                class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center text-xl">
                ⏳
              </div>
              <h3
                class="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Pending Payments
              </h3>
            </div>
            <div class="space-y-4">
              <div
                v-for="payment in pendingPayments"
                :key="payment.id"
                class="group relative bg-gradient-to-br from-dusty-800/30 via-yellow-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-6 border border-yellow-600/40 shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 hover:scale-105">
                <!-- Animated background -->
                <div
                  class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div class="relative z-10">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <h4
                        class="text-xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent group-hover:from-orange-300 group-hover:to-yellow-300 transition-all duration-300 mb-3">
                        {{ payment.title }}
                      </h4>
                      <div class="grid md:grid-cols-2 gap-4">
                        <div class="flex items-center space-x-2">
                          <div
                            class="w-2 h-2 bg-starlight-400 rounded-full"></div>
                          <span class="text-sm text-dusty-400"
                            >Deposit Amount:</span
                          >
                          <span class="font-semibold text-starlight-400"
                            >${{ payment.deposit_amount }}</span
                          >
                        </div>
                        <div class="flex items-center space-x-2">
                          <div class="w-2 h-2 bg-cosmic-400 rounded-full"></div>
                          <span class="text-sm text-dusty-400">Owner:</span>
                          <span class="font-semibold text-cosmic-400">{{
                            payment.owner_name
                          }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <span
                        class="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold border border-yellow-500/30 backdrop-blur-sm"
                        >Payment Required</span
                      >
                      <p class="text-xs text-dusty-400 mt-2">
                        {{ formatDate(payment.created_at) }}
                      </p>
                    </div>
                  </div>

                  <div class="flex space-x-4 mt-6">
                    <button
                      @click="openPaymentModal(payment)"
                      class="w-full bg-gradient-to-r from-frontier-500 to-starlight-500 hover:from-frontier-600 hover:to-starlight-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-frontier-500/25">
                      <div class="flex items-center justify-center space-x-3">
                        <span class="text-xl">💳</span>
                        <span>Pay Deposit</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment History -->
          <div v-if="paymentHistory.length > 0">
            <div class="flex items-center space-x-3 mb-6">
              <div
                class="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center text-xl">
                📊
              </div>
              <h3
                class="text-2xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                Payment History
              </h3>
            </div>
            <div class="space-y-4">
              <div
                v-for="payment in paymentHistory"
                :key="payment.id"
                class="group relative bg-gradient-to-br from-dusty-800/30 via-green-800/20 to-dusty-700/30 backdrop-blur-sm rounded-3xl p-6 border border-green-600/40 shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
                <!-- Animated background -->
                <div
                  class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div class="relative z-10 flex items-center justify-between">
                  <div class="flex-1">
                    <h4
                      class="text-xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-green-300 transition-all duration-300 mb-2">
                      {{ payment.item_title }}
                    </h4>
                    <p
                      class="text-dusty-400 group-hover:text-dusty-300 transition-colors duration-300">
                      {{
                        payment.payment_type === "deposit"
                          ? "Deposit Payment"
                          : "Refund"
                      }}
                      -
                      {{
                        payment.borrower_name === payment.owner_name
                          ? "You"
                          : payment.borrower_name
                      }}
                    </p>
                  </div>
                  <div class="text-right">
                    <div
                      class="text-2xl font-bold mb-1"
                      :class="
                        payment.payment_type === 'deposit'
                          ? 'text-red-400'
                          : 'text-green-400'
                      ">
                      {{ payment.payment_type === "deposit" ? "-" : "+" }}${{
                        payment.amount
                      }}
                    </div>
                    <div class="text-xs text-dusty-400 mb-2">
                      {{ formatDate(payment.created_at) }}
                    </div>
                    <span
                      class="px-2 py-1 rounded-full text-xs font-semibold"
                      :class="getPaymentStatusClass(payment.status)">
                      {{ payment.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div
      v-if="showPaymentModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-8"
      @click.self="closePaymentModal">
      <div
        class="bg-gradient-to-br from-dusty-800/90 via-frontier-800/80 to-dusty-700/90 backdrop-blur-sm rounded-3xl p-8 border border-frontier-600/40 shadow-2xl max-w-md w-full mx-4 my-auto">
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 bg-gradient-to-br from-frontier-400 to-starlight-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
            💳
          </div>
          <h2
            class="text-3xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-2">
            Pay Deposit
          </h2>
          <p class="text-dusty-300 text-lg">
            Complete your deposit payment to start borrowing
          </p>
        </div>

        <div class="mb-8">
          <div
            class="bg-gradient-to-br from-dusty-800/40 via-frontier-800/20 to-dusty-700/40 backdrop-blur-sm rounded-2xl p-6 border border-dusty-700/30 shadow-xl">
            <h3
              class="text-xl font-bold bg-gradient-to-r from-frontier-300 to-starlight-300 bg-clip-text text-transparent mb-4">
              {{ selectedPayment?.title }}
            </h3>
            <div class="flex justify-between items-center">
              <span class="text-dusty-300 text-lg">Deposit Amount:</span>
              <span class="text-3xl font-bold text-starlight-400"
                >${{ selectedPayment?.deposit_amount }}</span
              >
            </div>
          </div>
        </div>

        <div class="mb-8">
          <label class="block text-lg font-semibold text-dusty-300 mb-4"
            >Payment Method</label
          >
          <div class="grid grid-cols-2 gap-4">
            <button
              v-for="method in paymentMethods"
              :key="method.value"
              @click="selectedPaymentMethod = method.value"
              :class="[
                'group relative p-4 rounded-2xl border-2 text-center transition-all duration-300 hover:scale-105',
                selectedPaymentMethod === method.value
                  ? 'border-frontier-400 bg-gradient-to-br from-frontier-500/20 to-starlight-500/20 text-frontier-300 shadow-lg shadow-frontier-500/25'
                  : 'border-dusty-600/50 text-dusty-300 hover:border-dusty-500/50 hover:bg-dusty-800/30',
              ]">
              <div
                class="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {{ method.icon }}
              </div>
              <div class="text-sm font-semibold">{{ method.label }}</div>
            </button>
          </div>
        </div>

        <!-- Card Details Form -->
        <div
          v-if="
            selectedPaymentMethod === 'credit_card' ||
            selectedPaymentMethod === 'debit_card'
          "
          class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-dusty-300 mb-2"
              >Card Number</label
            >
            <input
              v-model="cardDetails.number"
              type="text"
              placeholder="1234 5678 9012 3456"
              class="input-field"
              maxlength="19"
              @input="formatCardNumber" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-dusty-300 mb-2"
                >Expiry</label
              >
              <input
                v-model="cardDetails.expiry"
                type="text"
                placeholder="MM/YY"
                class="input-field"
                maxlength="5"
                @input="formatExpiry" />
            </div>
            <div>
              <label class="block text-sm font-medium text-dusty-300 mb-2"
                >CVV</label
              >
              <input
                v-model="cardDetails.cvv"
                type="text"
                placeholder="123"
                class="input-field"
                maxlength="4" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-dusty-300 mb-2"
              >Cardholder Name</label
            >
            <input
              v-model="cardDetails.name"
              type="text"
              placeholder="John Doe"
              class="input-field" />
          </div>
        </div>

        <div class="flex space-x-3">
          <button
            type="button"
            @click="closePaymentModal"
            class="btn-frontier-outline flex-1"
            :disabled="processingPayment">
            Cancel
          </button>
          <button
            @click="processPayment"
            class="btn-frontier flex-1"
            :disabled="!selectedPaymentMethod || processingPayment">
            <span v-if="processingPayment" class="mr-2">⏳</span>
            <span v-else class="mr-2">💳</span>
            {{
              processingPayment
                ? "Processing..."
                : "Pay $" + selectedPayment?.deposit_amount
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const router = useRouter();
const loading = ref(false);
const activeTab = ref("listings");
const listings = ref([]);
const borrows = ref([]);
const pendingRequests = ref([]);
const pendingPayments = ref([]);
const paymentHistory = ref([]);

// Payment modal state
const showPaymentModal = ref(false);
const selectedPayment = ref(null);
const selectedPaymentMethod = ref("");
const processingPayment = ref(false);
const cardDetails = ref({
  number: "",
  name: "",
  expiry: "",
  cvv: "",
});

const paymentMethods = [
  { value: "credit_card", label: "Credit Card", icon: "💳" },
  { value: "debit_card", label: "Debit Card", icon: "💳" },
  { value: "bank_account", label: "Bank Account", icon: "🏦" },
  { value: "digital_wallet", label: "Digital Wallet", icon: "📱" },
  { value: "mock", label: "Demo Payment", icon: "💰" },
];

const loadData = async () => {
  loading.value = true;
  try {
    const [listingsRes, borrowsRes, requestsRes, paymentsRes, historyRes] =
      await Promise.all([
        api.marketplace.myListings(),
        api.marketplace.myBorrows(),
        api.marketplace.pendingRequests(),
        api.marketplace.getPendingPayments(),
        api.marketplace.getPaymentHistory(),
      ]);

    listings.value = listingsRes.data.data;
    borrows.value = borrowsRes.data.data;
    pendingRequests.value = requestsRes.data.data;
    pendingPayments.value = paymentsRes.data.data;
    paymentHistory.value = historyRes.data.data;
  } catch (error) {
    console.error("Error loading marketplace data:", error);
  } finally {
    loading.value = false;
  }
};

const deleteItem = async (itemId) => {
  if (!confirm("Are you sure you want to delete this item?")) return;

  try {
    await api.marketplace.delete(itemId);
    alert("Item deleted successfully!");
    await loadData();
  } catch (error) {
    console.error("Error deleting item:", error);
    alert(error.response?.data?.error?.message || "Failed to delete item");
  }
};

const markAsReturned = async (borrowId) => {
  if (!confirm("Mark this item as returned?")) return;

  try {
    await api.marketplace.markReturned(borrowId);
    alert("Item marked as returned! Waiting for owner confirmation.");
    await loadData();
  } catch (error) {
    console.error("Error marking as returned:", error);
    alert(error.response?.data?.error?.message || "Failed to mark as returned");
  }
};

const approveBorrow = async (borrowId) => {
  try {
    await api.marketplace.approveBorrow(borrowId);
    showNotification(
      "success",
      "Request Approved",
      "Borrow request has been approved!"
    );
    await loadData();
    // Refresh notification count in parent component
    window.dispatchEvent(new CustomEvent("refreshNotifications"));
  } catch (error) {
    console.error("Error approving borrow:", error);
    showNotification(
      "error",
      "Approval Failed",
      error.response?.data?.error?.message || "Failed to approve request"
    );
  }
};

const rejectBorrow = async (borrowId) => {
  try {
    await api.marketplace.rejectBorrow(borrowId);
    showNotification(
      "warning",
      "Request Rejected",
      "Borrow request has been rejected."
    );
    await loadData();
    // Refresh notification count in parent component
    window.dispatchEvent(new CustomEvent("refreshNotifications"));
  } catch (error) {
    console.error("Error rejecting borrow:", error);
    showNotification(
      "error",
      "Rejection Failed",
      error.response?.data?.error?.message || "Failed to reject request"
    );
  }
};

const showNotification = (type, title, message) => {
  // Create and show notification
  const notification = document.createElement("div");
  notification.innerHTML = `
    <div class="fixed top-4 right-4 z-50 max-w-sm">
      <div class="bg-dusty-800 border border-dusty-600 rounded-lg shadow-lg p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <span class="text-2xl">${
              type === "success"
                ? "✅"
                : type === "error"
                ? "❌"
                : type === "warning"
                ? "⚠️"
                : "ℹ️"
            }</span>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-semibold text-frontier-400">${title}</h3>
            <p class="text-sm text-dusty-300 mt-1">${message}</p>
          </div>
          <div class="ml-4 flex-shrink-0">
            <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="text-dusty-400 hover:text-dusty-300">
              <span class="sr-only">Close</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
};

const getStatusBadge = (status) => {
  const badges = {
    available: "badge-success",
    borrowed: "badge-warning",
    unavailable: "badge-danger",
  };
  return badges[status] || "badge";
};

const getBorrowStatusBadge = (status) => {
  const badges = {
    requested: "badge-warning",
    approved: "badge-success",
    returned: "badge-info",
    completed: "badge-success",
    rejected: "badge-danger",
  };
  return badges[status] || "badge";
};

const getCreditScoreClass = (score) => {
  if (score >= 700) return "text-green-400";
  if (score >= 600) return "text-yellow-400";
  return "text-red-400";
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Payment functions
const openPaymentModal = (payment) => {
  selectedPayment.value = payment;
  showPaymentModal.value = true;
  selectedPaymentMethod.value = "";
  cardDetails.value = {
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  };
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  selectedPayment.value = null;
  selectedPaymentMethod.value = "";
  processingPayment.value = false;
  cardDetails.value = {
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  };
};

const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\s/g, "").replace(/[^0-9]/gi, "");
  let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value;
  if (formattedValue.length <= 19) {
    cardDetails.value.number = formattedValue;
  }
};

const formatExpiry = (event) => {
  let value = event.target.value.replace(/\D/g, "");
  if (value.length >= 2) {
    value = value.substring(0, 2) + "/" + value.substring(2, 4);
  }
  cardDetails.value.expiry = value;
};

const processPayment = async () => {
  if (!selectedPaymentMethod.value) {
    alert("Please select a payment method");
    return;
  }

  // Validate card details for card payments
  if (
    selectedPaymentMethod.value === "credit_card" ||
    selectedPaymentMethod.value === "debit_card"
  ) {
    if (
      !cardDetails.value.number ||
      !cardDetails.value.expiry ||
      !cardDetails.value.cvv ||
      !cardDetails.value.name
    ) {
      alert("Please fill in all card details");
      return;
    }
  }

  processingPayment.value = true;
  try {
    const paymentData = {
      borrow_id: selectedPayment.value.id,
      payment_method: selectedPaymentMethod.value,
    };

    // Include card details for card payments
    if (
      selectedPaymentMethod.value === "credit_card" ||
      selectedPaymentMethod.value === "debit_card"
    ) {
      paymentData.card_details = {
        number: cardDetails.value.number.replace(/\s/g, ""),
        name: cardDetails.value.name,
        expiry: cardDetails.value.expiry,
        cvv: cardDetails.value.cvv,
      };
    }

    await api.marketplace.processDeposit(paymentData);

    showNotification(
      "success",
      "Payment Successful",
      `Deposit of $${selectedPayment.value.deposit_amount} paid successfully! 🎉`
    );

    // Close modal and reload data
    closePaymentModal();
    await loadData();
  } catch (error) {
    console.error("Error processing payment:", error);
    const errorMessage =
      error.response?.data?.error?.message ||
      "Failed to process payment. Please try again.";
    showNotification("error", "Payment Failed", errorMessage);
  } finally {
    processingPayment.value = false;
  }
};

const getPaymentStatusClass = (status) => {
  const classes = {
    completed: "text-green-400",
    pending: "text-yellow-400",
    failed: "text-red-400",
    refunded: "text-blue-400",
  };
  return classes[status] || "text-dusty-400";
};

onMounted(async () => {
  await loadData();
});
</script>
