<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="spinner mx-auto"></div>
      <p class="text-dusty-300 mt-4">Loading circle details...</p>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="flex justify-between items-start mb-8">
        <div>
          <h1 class="text-3xl font-bold text-frontier-400 mb-2">
            {{ circle.name }}
          </h1>
          <p class="text-dusty-300">{{ circle.description }}</p>
        </div>
        <span
          :class="`badge-${
            circle.status === 'active' ? 'success' : 'warning'
          }`">
          {{ circle.status }}
        </span>
      </div>

      <!-- Circle Stats -->
      <div class="grid md:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="text-dusty-400 text-sm mb-1">Monthly Amount</div>
          <div class="text-3xl font-bold text-frontier-400">
            ${{ circle.monthly_amount }}
          </div>
        </div>
        <div class="card">
          <div class="text-dusty-400 text-sm mb-1">Members</div>
          <div class="text-3xl font-bold text-starlight-400">
            {{ circle.current_members }}/{{ circle.max_members }}
          </div>
        </div>
        <div class="card">
          <div class="text-dusty-400 text-sm mb-1">Current Cycle</div>
          <div class="text-3xl font-bold text-cosmic-400">
            {{ circle.current_cycle }}
          </div>
        </div>
        <div class="card">
          <div class="text-dusty-400 text-sm mb-1">Next Payout</div>
          <div class="text-lg font-bold text-green-400">
            {{ formatDate(circle.next_payout_date) }}
          </div>
        </div>
      </div>

      <!-- Invite Code -->
      <div class="card mb-8 bg-starlight-900/20 border-starlight-700">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-starlight-400 mb-1">Invite Code</h3>
            <p class="text-2xl font-mono font-bold">{{ circle.invite_code }}</p>
          </div>
          <button class="btn-starlight" @click="copyInviteCode">
            Copy Code
          </button>
        </div>
      </div>

      <!-- Monthly Payment Section -->
      <div class="card mb-8 bg-frontier-900/20 border-frontier-700">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-frontier-400 mb-1">
              Monthly Payment - Cycle {{ circle.current_cycle }}
            </h3>
            <p class="text-3xl font-mono font-bold text-frontier-400">
              ${{ circle.monthly_amount }}
            </p>
            <p class="text-sm text-dusty-400 mt-1">Due this month</p>
          </div>
          <div v-if="hasPaidThisCycle" class="text-center">
            <span
              class="inline-flex items-center px-6 py-3 rounded-lg bg-green-500/20 text-green-400 border border-green-500">
              <span class="text-2xl mr-2">✓</span>
              <span class="font-semibold">Paid</span>
            </span>
          </div>
          <button v-else @click="showPaymentModal = true" class="btn-frontier">
            Pay Now
          </button>
        </div>
      </div>

      <!-- Pool Progress Section -->
      <div class="card mb-8 bg-green-900/20 border-green-700">
        <h3 class="font-semibold text-green-400 mb-4">
          💰 Current Pool Progress - Cycle {{ circle.current_cycle }}
        </h3>

        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-dusty-300">Pooled Funds</span>
            <span class="text-2xl font-bold text-green-400">
              ${{ poolStatus.current_pool_amount || 0 }} / ${{
                poolStatus.expected_pool_amount || 0
              }}
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-dusty-700 rounded-full h-4 overflow-hidden">
            <div
              class="bg-gradient-to-r from-green-500 to-green-400 h-4 rounded-full transition-all duration-500"
              :style="{ width: `${poolStatus.pool_progress || 0}%` }"></div>
          </div>

          <div class="flex justify-between text-sm text-dusty-400 mt-2">
            <span
              >{{ poolStatus.members_paid || 0 }} /
              {{ poolStatus.total_active_members || 0 }} members paid</span
            >
            <span>{{ Math.round(poolStatus.pool_progress || 0) }}%</span>
          </div>

          <!-- Payment Summary -->
          <div class="mt-3 p-3 bg-dusty-800 rounded-lg">
            <div class="flex justify-between items-center text-sm">
              <span class="text-dusty-300">
                <span class="text-green-400 font-semibold">{{
                  poolStatus.members_paid || 0
                }}</span>
                paid •
                <span class="text-yellow-400 font-semibold">{{
                  (poolStatus.total_active_members || 0) -
                  (poolStatus.members_paid || 0)
                }}</span>
                remaining
              </span>
              <span class="text-dusty-400">
                Need ${{
                  ((poolStatus.total_active_members || 0) -
                    (poolStatus.members_paid || 0)) *
                  (circle.monthly_amount || 0)
                }}
                more
              </span>
            </div>
          </div>

          <!-- Members Payment Status -->
          <div class="mt-4 p-4 bg-dusty-800 rounded-lg">
            <h4 class="text-sm font-semibold text-dusty-300 mb-3">
              Member Payment Status
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div
                v-for="member in members"
                :key="member.id"
                class="flex items-center justify-between p-2 rounded"
                :class="
                  getMemberPaymentStatus(member).paid
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-dusty-700'
                ">
                <div class="flex items-center space-x-2">
                  <div
                    class="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    :class="
                      getMemberPaymentStatus(member).paid
                        ? 'bg-green-500 text-white'
                        : 'bg-dusty-600 text-dusty-300'
                    ">
                    {{ getMemberPaymentStatus(member).paid ? "✓" : "⏳" }}
                  </div>
                  <span
                    class="text-sm"
                    :class="
                      getMemberPaymentStatus(member).paid
                        ? 'text-green-400'
                        : 'text-dusty-300'
                    ">
                    {{ member.name }}
                  </span>
                </div>
                <div
                  class="text-xs"
                  :class="
                    getMemberPaymentStatus(member).paid
                      ? 'text-green-400'
                      : 'text-dusty-400'
                  ">
                  {{ getMemberPaymentStatus(member).paid ? "Paid" : "Pending" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payout Recipient Info -->
        <div
          v-if="poolStatus.next_recipient_name"
          class="flex justify-between items-center p-4 bg-dusty-700 rounded-lg">
          <div>
            <p class="text-xs text-dusty-400">Next Payout Recipient</p>
            <p class="text-lg font-bold text-green-400">
              {{ poolStatus.next_recipient_name }}
            </p>
            <p class="text-xs text-dusty-500">
              Cycle {{ circle.current_cycle }}
            </p>
          </div>
          <div v-if="poolStatus.is_ready_for_payout" class="text-center">
            <span
              class="inline-flex items-center px-4 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500 text-sm">
              <span class="text-xl mr-2">✓</span>
              <span class="font-semibold">Ready for Payout</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Payout Notifications Section -->
      <div
        v-if="payoutNotifications.length > 0"
        class="card mb-8 bg-blue-900/20 border-blue-700">
        <h3 class="font-semibold text-blue-400 mb-4">🎉 Recent Payouts</h3>

        <div class="space-y-3">
          <div
            v-for="notification in payoutNotifications"
            :key="notification.id"
            class="flex items-center justify-between p-4 bg-dusty-800 rounded-lg border border-blue-500/30">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span class="text-white text-lg">💰</span>
              </div>
              <div>
                <p class="text-blue-400 font-semibold">
                  {{ notification.title }}
                </p>
                <p class="text-dusty-300 text-sm">{{ notification.message }}</p>
                <p class="text-dusty-500 text-xs">
                  {{ formatDate(notification.created_at) }} •
                  {{
                    notification.payout_type === "automatic"
                      ? "Auto-payout"
                      : "Manual payout"
                  }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-green-400">
                ${{ notification.amount }}
              </p>
              <p class="text-xs text-dusty-500">
                Cycle {{ notification.cycle_number }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Method Modal -->
      <div
        v-if="showPaymentModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
        <div class="bg-dusty-800 rounded-lg p-6 max-w-md w-full mx-4 my-auto">
          <h2 class="text-2xl font-bold text-frontier-400 mb-4">
            Make Payment
          </h2>
          <p class="text-dusty-300 mb-6">Choose your payment method</p>

          <div class="mb-6">
            <p class="text-sm text-dusty-400 mb-4">
              Amount Due:
              <span class="text-2xl font-bold text-frontier-400"
                >${{ circle.monthly_amount }}</span
              >
            </p>

            <label class="block text-sm font-medium mb-3">Payment Method</label>
            <div class="space-y-3">
              <label
                v-for="method in paymentMethods"
                :key="method.value"
                class="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
                :class="
                  selectedPaymentMethod === method.value
                    ? 'border-frontier-500 bg-frontier-500/10'
                    : 'border-dusty-600 hover:border-dusty-500'
                ">
                <input
                  type="radio"
                  :value="method.value"
                  v-model="selectedPaymentMethod"
                  class="mr-3" />
                <div class="flex items-center flex-1">
                  <span class="text-2xl mr-3">{{ method.icon }}</span>
                  <div>
                    <p class="font-medium">{{ method.label }}</p>
                    <p class="text-xs text-dusty-400">
                      {{ method.description }}
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Credit/Debit Card Form -->
          <div
            v-if="
              selectedPaymentMethod === 'credit_card' ||
              selectedPaymentMethod === 'debit_card'
            "
            class="mb-6 p-4 bg-dusty-700 rounded-lg border border-frontier-500/30">
            <h3 class="text-lg font-semibold text-frontier-400 mb-4">
              Card Details
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2"
                  >Card Number</label
                >
                <input
                  v-model="cardDetails.number"
                  @input="formatCardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                  class="w-full px-4 py-2 bg-dusty-800 border border-dusty-600 rounded-lg focus:border-frontier-500 focus:ring-1 focus:ring-frontier-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2"
                  >Cardholder Name</label
                >
                <input
                  v-model="cardDetails.name"
                  type="text"
                  placeholder="John Doe"
                  class="w-full px-4 py-2 bg-dusty-800 border border-dusty-600 rounded-lg focus:border-frontier-500 focus:ring-1 focus:ring-frontier-500 outline-none" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2"
                    >Expiry Date</label
                  >
                  <input
                    v-model="cardDetails.expiry"
                    @input="formatExpiry"
                    type="text"
                    placeholder="MM/YY"
                    maxlength="5"
                    class="w-full px-4 py-2 bg-dusty-800 border border-dusty-600 rounded-lg focus:border-frontier-500 focus:ring-1 focus:ring-frontier-500 outline-none" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">CVV</label>
                  <input
                    v-model="cardDetails.cvv"
                    @input="formatCVV"
                    type="text"
                    placeholder="123"
                    maxlength="4"
                    class="w-full px-4 py-2 bg-dusty-800 border border-dusty-600 rounded-lg focus:border-frontier-500 focus:ring-1 focus:ring-frontier-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex space-x-3">
            <button
              type="button"
              @click="closePaymentModal"
              class="btn-frontier-outline flex-1"
              :disabled="makingPayment">
              Cancel
            </button>
            <button
              @click="confirmPayment"
              class="btn-frontier flex-1"
              :disabled="makingPayment || !selectedPaymentMethod">
              <span
                v-if="makingPayment"
                class="spinner inline-block mr-2"></span>
              {{ makingPayment ? "Processing..." : "Confirm Payment" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-dusty-700">
        <div class="flex space-x-6">
          <button
            :class="
              activeTab === 'members'
                ? 'border-frontier-500 text-frontier-400'
                : 'border-transparent text-dusty-400'
            "
            class="pb-3 border-b-2 font-medium transition-colors"
            @click="activeTab = 'members'">
            Members
          </button>
          <button
            :class="
              activeTab === 'schedule'
                ? 'border-frontier-500 text-frontier-400'
                : 'border-transparent text-dusty-400'
            "
            class="pb-3 border-b-2 font-medium transition-colors"
            @click="activeTab = 'schedule'">
            Payout Schedule
          </button>
          <button
            :class="
              activeTab === 'payments'
                ? 'border-frontier-500 text-frontier-400'
                : 'border-transparent text-dusty-400'
            "
            class="pb-3 border-b-2 font-medium transition-colors"
            @click="activeTab = 'payments'">
            Payments
          </button>
          <button
            :class="
              activeTab === 'payouts'
                ? 'border-frontier-500 text-frontier-400'
                : 'border-transparent text-dusty-400'
            "
            class="pb-3 border-b-2 font-medium transition-colors"
            @click="activeTab = 'payouts'">
            Payout History
          </button>
        </div>
      </div>

      <!-- Members Tab -->
      <div v-if="activeTab === 'members'" class="card">
        <h3 class="text-xl font-semibold mb-4 text-frontier-400">
          Circle Members
        </h3>
        <div class="space-y-3">
          <div
            v-for="member in members"
            :key="member.id"
            class="flex items-center justify-between p-3 bg-dusty-700 rounded-lg">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-frontier-500 rounded-full flex items-center justify-center text-white font-bold">
                {{ member.name.charAt(0) }}
              </div>
              <div>
                <p class="font-medium">{{ member.name }}</p>
                <p class="text-sm text-dusty-400">
                  Credit Score: {{ member.credit_score }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <span
                :class="`badge-${
                  member.status === 'active' ? 'success' : 'warning'
                }`">
                {{ member.status }}
              </span>
              <!-- Vouch button for all active members (including admin) who haven't vouched yet -->
              <button
                v-if="
                  member.status === 'pending' &&
                  member.user_id !== currentUserId &&
                  !userVouches.has(member.user_id)
                "
                @click="vouchMember(member)"
                class="btn-frontier text-sm"
                :disabled="vouching">
                {{ vouching ? "Vouching..." : "Vouch" }}
              </button>
              <!-- Show "Vouched" badge if user already vouched -->
              <span
                v-if="
                  member.status === 'pending' && userVouches.has(member.user_id)
                "
                class="text-xs px-3 py-1 rounded bg-frontier-500/20 text-frontier-400 border border-frontier-500">
                ✓ Vouched
              </span>
              <!-- Approve button for admin only -->
              <button
                v-if="member.status === 'pending' && isAdmin"
                @click="approveMember(member)"
                class="btn-starlight text-sm ml-2"
                :disabled="approving">
                {{ approving ? "Approving..." : "Approve" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Tab -->
      <div v-if="activeTab === 'schedule'" class="card">
        <h3 class="text-xl font-semibold mb-4 text-frontier-400">
          Payout Schedule
        </h3>
        <div class="space-y-2">
          <div
            v-for="(slot, index) in payoutSchedule"
            :key="index"
            class="flex items-center justify-between p-3 bg-dusty-700 rounded-lg">
            <div class="flex items-center space-x-3">
              <span class="text-2xl">{{
                slot.has_received_payout
                  ? "✅"
                  : slot.position_in_cycle === circle.current_cycle
                  ? "➡️"
                  : "⏳"
              }}</span>
              <div>
                <p class="font-medium">{{ slot.user_name }}</p>
                <p class="text-sm text-dusty-400">
                  Position {{ slot.position_in_cycle }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-bold text-frontier-400">
                ${{ slot.monthly_amount * circle.current_members }}
              </p>
              <p class="text-xs text-dusty-400">
                {{ slot.has_received_payout ? "Received" : "Pending" }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Payments Tab -->
      <div v-if="activeTab === 'payments'" class="card">
        <h3 class="text-xl font-semibold mb-4 text-frontier-400">
          Payment History
        </h3>

        <div
          v-if="payments.length === 0"
          class="text-center py-8 text-dusty-400">
          No payments recorded yet. Be the first to contribute!
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="payment in payments"
            :key="payment.id"
            class="flex items-center justify-between p-4 bg-dusty-700 rounded-lg">
            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 bg-frontier-500 rounded-full flex items-center justify-center">
                <span class="text-2xl">{{
                  getPaymentMethodIcon(payment.payment_method)
                }}</span>
              </div>
              <div>
                <p class="font-medium">{{ payment.user_name }}</p>
                <p class="text-sm text-dusty-400">
                  Cycle {{ payment.cycle_number }} •
                  {{ formatDateTime(payment.created_at) }}
                </p>
                <p class="text-xs text-dusty-500">
                  {{ getPaymentMethodLabel(payment.payment_method) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-frontier-400">
                ${{ payment.amount }}
              </p>
              <span
                class="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500">
                {{ payment.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payouts Tab -->
      <div v-if="activeTab === 'payouts'" class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-frontier-400">
            Payout History
          </h3>

          <!-- Manual Payout Button (Demo) -->
          <button
            v-if="isCircleAdmin"
            @click="triggerManualPayout"
            :disabled="isProcessingPayout || !poolStatus.next_recipient_id"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2">
            <span v-if="isProcessingPayout">Processing...</span>
            <span v-else-if="!poolStatus.next_recipient_id"
              >🎯 Release Payout (No Recipient)</span
            >
            <span v-else-if="!poolStatus.is_ready_for_payout"
              >🎯 Release Payout (Pool Not Full)</span
            >
            <span v-else>🎯 Release Payout (Demo)</span>
          </button>

          <!-- Debug info (remove in production) -->
          <div v-if="!isCircleAdmin" class="text-xs text-gray-500 mt-2">
            Debug: Admin: {{ isAdmin }}, User ID: {{ currentUserId }}, Circle
            Admin: {{ circle.admin_id }}
          </div>
        </div>

        <!-- Payout Summary -->
        <div v-if="payouts.length > 0" class="mb-6 p-4 bg-dusty-800 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-green-400">
                {{ payouts.length }}
              </p>
              <p class="text-sm text-dusty-400">Total Payouts</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-green-400">
                ${{
                  payouts.reduce(
                    (sum, payout) => sum + parseFloat(payout.amount),
                    0
                  )
                }}
              </p>
              <p class="text-sm text-dusty-400">Total Distributed</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-blue-400">
                {{
                  payouts.filter((p) => p.payout_type === "automatic").length
                }}
              </p>
              <p class="text-sm text-dusty-400">Auto Payouts</p>
            </div>
          </div>
        </div>

        <div
          v-if="payouts.length === 0"
          class="text-center py-8 text-dusty-400">
          No payouts have been distributed yet.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="payout in payouts"
            :key="payout.id"
            class="p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div
                  class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span class="text-2xl">💰</span>
                </div>
                <div>
                  <p class="font-semibold text-green-400 text-lg">
                    {{ payout.recipient_name }}
                  </p>
                  <p class="text-sm text-dusty-300">
                    Received payout for Cycle {{ payout.cycle_number }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-3xl font-bold text-green-400">
                  ${{ payout.amount }}
                </p>
                <div class="flex items-center space-x-2 mt-1">
                  <span
                    class="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500">
                    {{ payout.status }}
                  </span>
                  <span
                    class="text-xs px-2 py-1 rounded"
                    :class="
                      payout.payout_type === 'automatic'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                    ">
                    {{ payout.payout_type === "automatic" ? "Auto" : "Manual" }}
                  </span>
                </div>
              </div>
            </div>

            <div
              class="flex items-center justify-between text-sm text-dusty-400 pt-3 border-t border-dusty-700">
              <div class="flex items-center space-x-4">
                <span class="flex items-center space-x-1">
                  <span>📅</span>
                  <span>{{ formatDateTime(payout.created_at) }}</span>
                </span>
                <span class="flex items-center space-x-1">
                  <span>🆔</span>
                  <span class="font-mono text-xs"
                    >{{ payout.id.slice(0, 8) }}...</span
                  >
                </span>
              </div>
              <div class="text-xs text-dusty-500">
                {{
                  payout.payout_type === "automatic"
                    ? "Automatically processed"
                    : "Manually processed"
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuth0 } from "@auth0/auth0-vue";
import api from "../services/api";

const route = useRoute();
const { user } = useAuth0();
const activeTab = ref("members");
const loading = ref(false);
const vouching = ref(false);
const approving = ref(false);
const makingPayment = ref(false);
const showPaymentModal = ref(false);
const selectedPaymentMethod = ref("");
const isProcessingPayout = ref(false);
const currentUserId = ref(null);
const isAdmin = ref(false);
const hasPaidThisCycle = ref(false);

// Card details
const cardDetails = ref({
  number: "",
  name: "",
  expiry: "",
  cvv: "",
});

const paymentMethods = [
  {
    value: "credit_card",
    label: "Credit Card",
    icon: "💳",
    description: "Pay with your credit card",
  },
  {
    value: "debit_card",
    label: "Debit Card",
    icon: "💳",
    description: "Pay with your debit card",
  },
  {
    value: "bank_account",
    label: "Bank Account",
    icon: "🏦",
    description: "Direct bank transfer",
  },
  {
    value: "digital_wallet",
    label: "Digital Wallet",
    icon: "📱",
    description: "Apple Pay, Google Pay, etc.",
  },
];

const circle = ref({
  name: "",
  description: "",
  status: "pending",
  monthly_amount: 0,
  current_members: 0,
  max_members: 0,
  current_cycle: 1,
  next_payout_date: null,
  invite_code: "",
});

const members = ref([]);
const payoutSchedule = ref([]);
const userVouches = ref(new Map()); // Track which members current user has vouched for
const payments = ref([]);
const payouts = ref([]);
const poolStatus = ref({
  current_pool_amount: 0,
  expected_pool_amount: 0,
  pool_progress: 0,
  members_paid: 0,
  total_active_members: 0,
  is_ready_for_payout: false,
  next_recipient_name: "",
  next_recipient_id: null,
});
const payoutNotifications = ref([]);

// Computed properties
const isCircleAdmin = computed(() => {
  return isAdmin.value;
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getPaymentMethodIcon = (method) => {
  const methodMap = {
    credit_card: "💳",
    debit_card: "💳",
    bank_account: "🏦",
    digital_wallet: "📱",
    mock: "💰",
  };
  return methodMap[method] || "💰";
};

const getPaymentMethodLabel = (method) => {
  const methodMap = {
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    bank_account: "Bank Account",
    digital_wallet: "Digital Wallet",
    mock: "Demo Payment",
  };
  return methodMap[method] || "Payment";
};

const getMemberPaymentStatus = (member) => {
  // Use the member_payments data from poolStatus if available
  if (poolStatus.value.member_payments) {
    const memberPayment = poolStatus.value.member_payments.find(
      (mp) => mp.user_id === member.user_id
    );

    return {
      paid: memberPayment?.has_paid || false,
      paymentDate: memberPayment?.payment_date,
    };
  }

  // Fallback to checking payments array
  const memberPayment = payments.value.find(
    (p) =>
      p.user_id === member.user_id &&
      p.cycle_number === circle.value.current_cycle &&
      p.status === "completed"
  );

  return {
    paid: !!memberPayment,
    paymentDate: memberPayment?.created_at,
  };
};

const copyInviteCode = () => {
  navigator.clipboard.writeText(circle.value.invite_code);
  alert("Invite code copied to clipboard!");
};

const vouchMember = async (member) => {
  if (
    !confirm(
      `Vouch for ${member.name}? This will help them get approved to join the circle.`
    )
  ) {
    return;
  }

  vouching.value = true;
  try {
    await api.vouches.create({
      circle_id: route.params.id,
      vouchee_id: member.user_id,
      trust_level: 5,
      notes: `Vouched for ${member.name}`,
    });

    // Mark that current user has vouched for this member
    userVouches.value.set(member.user_id, true);

    alert(`Successfully vouched for ${member.name}!`);

    // Reload members to show updated status
    const membersResponse = await api.circles.getMembers(route.params.id);
    members.value = membersResponse.data.data;
  } catch (error) {
    console.error("Error vouching for member:", error);

    // If duplicate vouch, mark it as vouched
    if (
      error.response?.status === 409 ||
      error.response?.data?.error?.message?.includes("already")
    ) {
      userVouches.value.set(member.user_id, true);
      alert(`You have already vouched for ${member.name}!`);
    } else {
      const errorMessage =
        error.response?.data?.error?.message ||
        "Failed to vouch for member. Please try again.";
      alert(errorMessage);
    }
  } finally {
    vouching.value = false;
  }
};

const approveMember = async (member) => {
  if (!confirm(`Approve ${member.name} to join the circle?`)) {
    return;
  }

  approving.value = true;
  try {
    await api.circles.approveMember(route.params.id, member.user_id);

    alert(`${member.name} has been approved and is now an active member!`);

    // Reload circle data and members
    const circleResponse = await api.circles.getById(route.params.id);
    circle.value = circleResponse.data.data;

    const membersResponse = await api.circles.getMembers(route.params.id);
    members.value = membersResponse.data.data;

    const scheduleResponse = await api.circles.getSchedule(route.params.id);
    payoutSchedule.value = scheduleResponse.data.data;
  } catch (error) {
    console.error("Error approving member:", error);
    const errorMessage =
      error.response?.data?.error?.message ||
      "Failed to approve member. Please try again.";
    alert(errorMessage);
  } finally {
    approving.value = false;
  }
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  selectedPaymentMethod.value = "";
  makingPayment.value = false;
  // Reset card details
  cardDetails.value = {
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  };
};

// Card formatting functions
const formatCardNumber = (e) => {
  let value = e.target.value.replace(/\s/g, "");
  let formattedValue = value.replace(/(\d{4})/g, "$1 ").trim();
  cardDetails.value.number = formattedValue;
};

const formatExpiry = (e) => {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length >= 2) {
    value = value.slice(0, 2) + "/" + value.slice(2, 4);
  }
  cardDetails.value.expiry = value;
};

const formatCVV = (e) => {
  let value = e.target.value.replace(/\D/g, "");
  cardDetails.value.cvv = value;
};

const validateCardDetails = () => {
  if (
    !cardDetails.value.number ||
    cardDetails.value.number.replace(/\s/g, "").length < 13
  ) {
    return "Please enter a valid card number";
  }
  if (!cardDetails.value.name || cardDetails.value.name.trim().length < 3) {
    return "Please enter the cardholder name";
  }
  if (
    !cardDetails.value.expiry ||
    !/^\d{2}\/\d{2}$/.test(cardDetails.value.expiry)
  ) {
    return "Please enter a valid expiry date (MM/YY)";
  }
  if (!cardDetails.value.cvv || cardDetails.value.cvv.length < 3) {
    return "Please enter a valid CVV";
  }

  // Validate expiry date is not in the past
  const [month, year] = cardDetails.value.expiry.split("/");
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const today = new Date();
  if (expiryDate < today) {
    return "Card has expired";
  }

  return null;
};

const confirmPayment = async () => {
  if (!selectedPaymentMethod.value) {
    alert("Please select a payment method");
    return;
  }

  // Validate card details for card payments
  if (
    selectedPaymentMethod.value === "credit_card" ||
    selectedPaymentMethod.value === "debit_card"
  ) {
    const validationError = validateCardDetails();
    if (validationError) {
      alert(validationError);
      return;
    }
  }

  makingPayment.value = true;
  try {
    const paymentData = {
      circle_id: route.params.id,
      amount: circle.value.monthly_amount,
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

    await api.payments.make(paymentData);

    alert(`Payment of $${circle.value.monthly_amount} successful! 🎉`);

    // Close modal and reset
    closePaymentModal();

    // Mark as paid
    hasPaidThisCycle.value = true;

    // Reload payment history and pool status
    await loadPayments();

    // Reload pool status
    try {
      const poolResponse = await api.circles.getPoolStatus(route.params.id);
      poolStatus.value = poolResponse.data.data;
    } catch (error) {
      console.error("Error reloading pool status:", error);
    }
  } catch (error) {
    console.error("Error making payment:", error);
    const errorMessage =
      error.response?.data?.error?.message ||
      "Failed to process payment. Please try again.";
    alert(errorMessage);
    makingPayment.value = false;
  }
};

const loadPayments = async () => {
  try {
    const circleId = route.params.id;
    const paymentsResponse = await api.payments.getByCircle(circleId);
    // Sort payments by created_at descending (most recent first)
    payments.value = paymentsResponse.data.data.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  } catch (error) {
    console.error("Error loading payments:", error);
  }
};

const checkPaymentStatus = async () => {
  try {
    const circleId = route.params.id;
    const paymentsResponse = await api.payments.getByCircle(circleId);
    const payments = paymentsResponse.data.data;

    // Check if current user has paid in the current cycle
    const currentCyclePayment = payments.find(
      (p) =>
        p.user_id === currentUserId.value &&
        p.cycle_number === circle.value.current_cycle &&
        p.status === "completed"
    );

    hasPaidThisCycle.value = !!currentCyclePayment;
  } catch (error) {
    console.error("Error checking payment status:", error);
  }
};

// Load payouts for the circle
const loadPayouts = async () => {
  try {
    const circleId = route.params.id;
    const payoutsResponse = await api.payouts.getByCircle(circleId);
    payouts.value = payoutsResponse.data.data;
  } catch (error) {
    console.error("Error loading payouts:", error);
  }
};

// Load pool status
const loadPoolStatus = async () => {
  try {
    const circleId = route.params.id;
    const poolResponse = await api.circles.getPoolStatus(circleId);
    poolStatus.value = poolResponse.data.data;
  } catch (error) {
    console.error("Error loading pool status:", error);
  }
};

// Manual payout function for demo purposes
const triggerManualPayout = async () => {
  if (!poolStatus.value.next_recipient_id) {
    alert(
      "No recipient set for the next payout. Please set the next payout recipient first."
    );
    return;
  }

  const confirmMessage = poolStatus.value.is_ready_for_payout
    ? "Release payout to the next recipient? This will process the payout immediately."
    : "Pool is not full yet, but release payout anyway for demo purposes?";

  if (!confirm(confirmMessage)) {
    return;
  }

  isProcessingPayout.value = true;

  try {
    const circleId = route.params.id;

    // Call the manual payout API
    const response = await api.payouts.process({
      circle_id: circleId,
      payout_type: "manual",
    });

    if (response.data.success) {
      // Show success message
      alert(
        `Payout released successfully! ${response.data.data.recipient_name} received $${response.data.data.amount}`
      );

      // Refresh the data
      await loadCircleData();
      await loadPayouts();
      await loadPoolStatus();
    } else {
      alert(
        "Failed to release payout: " +
          (response.data.error?.message || "Unknown error")
      );
    }
  } catch (error) {
    console.error("Error releasing payout:", error);
    alert(
      "Error releasing payout: " +
        (error.response?.data?.error?.message || error.message)
    );
  } finally {
    isProcessingPayout.value = false;
  }
};

onMounted(async () => {
  const circleId = route.params.id;
  loading.value = true;

  try {
    // Get current user's database ID
    const currentUserResponse = await api.auth.getCurrentUser();
    currentUserId.value = currentUserResponse.data.data.id;

    // Load circle data
    const circleResponse = await api.circles.getById(circleId);
    circle.value = circleResponse.data.data;

    // Check if current user is the admin
    isAdmin.value = circle.value.admin_id === currentUserId.value;

    // Load pool status
    await loadPoolStatus();

    // Debug logging
    console.log("Circle Admin ID:", circle.value.admin_id);
    console.log("Current User ID:", currentUserId.value);
    console.log("Is Admin:", isAdmin.value);
    console.log("Pool Status:", poolStatus.value);

    // Load members (non-critical, continue if it fails)
    try {
      const membersResponse = await api.circles.getMembers(circleId);
      members.value = membersResponse.data.data;
    } catch (error) {
      console.error("Error loading members:", error);
    }

    // Load payout schedule (non-critical, continue if it fails)
    try {
      const scheduleResponse = await api.circles.getSchedule(circleId);
      payoutSchedule.value = scheduleResponse.data.data;
    } catch (error) {
      console.error("Error loading schedule:", error);
    }

    // Load current user's vouches in this circle (non-critical, continue if it fails)
    try {
      const vouchesResponse = await api.vouches.getMyVouches(circleId);
      // Populate the userVouches Map with vouchee_ids
      vouchesResponse.data.data.forEach((vouch) => {
        userVouches.value.set(vouch.vouchee_id, true);
      });
    } catch (error) {
      console.error("Error loading vouches:", error);
    }

    // Load payment history (non-critical, continue if it fails)
    try {
      await loadPayments();
    } catch (error) {
      console.error("Error loading payments:", error);
    }

    // Load pool status (non-critical, continue if it fails)
    try {
      const poolResponse = await api.circles.getPoolStatus(circleId);
      poolStatus.value = poolResponse.data.data;
    } catch (error) {
      console.error("Error loading pool status:", error);
    }

    // Load payout notifications (non-critical, continue if it fails)
    try {
      const notificationsResponse = await api.circles.getPayoutNotifications();
      payoutNotifications.value = notificationsResponse.data.data;
    } catch (error) {
      console.error("Error loading payout notifications:", error);
    }

    // Load payout history (non-critical, continue if it fails)
    try {
      const payoutsResponse = await api.payouts.getByCircle(circleId);
      payouts.value = payoutsResponse.data.data;
    } catch (error) {
      console.error("Error loading payouts:", error);
    }

    // Check payment status for this cycle (non-critical, continue if it fails)
    try {
      await checkPaymentStatus();
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  } catch (error) {
    console.error("Error loading circle:", error);
    alert("Failed to load circle details. Please try again.");
  } finally {
    loading.value = false;
  }
});
</script>
