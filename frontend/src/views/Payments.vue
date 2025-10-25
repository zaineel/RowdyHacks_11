<template>
  <div>
    <h1 class="text-3xl font-bold text-frontier-400 mb-2">Payments</h1>
    <p class="text-dusty-300 mb-8">Track your contributions and payouts</p>

    <!-- Upcoming Payments -->
    <div class="card mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-frontier-400">Upcoming Payments</h2>
      <div v-if="upcomingPayments.length === 0" class="text-center py-8 text-dusty-400">
        No upcoming payments
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="payment in upcomingPayments"
          :key="payment.id"
          class="flex items-center justify-between p-4 bg-dusty-700 rounded-lg"
        >
          <div>
            <p class="text-dusty-100 font-medium">{{ payment.circle_name }}</p>
            <p class="text-sm text-dusty-400">Due: {{ payment.due_date }}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-frontier-400">${{ payment.amount }}</p>
            <button class="btn-frontier mt-2 text-sm">Pay Now</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment History -->
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold text-frontier-400">Payment History</h2>
        <select class="input-field w-auto">
          <option>All Circles</option>
          <option>Pioneer Circle</option>
          <option>Frontier Fund</option>
        </select>
      </div>

      <div class="space-y-2">
        <div
          v-for="payment in paymentHistory"
          :key="payment.id"
          class="flex items-center justify-between p-3 bg-dusty-700 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <span class="text-2xl">
              {{ payment.type === 'payout' ? '💰' : '💳' }}
            </span>
            <div>
              <p class="text-dusty-100">
                {{ payment.type === 'payout' ? 'Received Payout' : 'Made Payment' }}
              </p>
              <p class="text-sm text-dusty-400">{{ payment.circle_name }}</p>
            </div>
          </div>
          <div class="text-right">
            <p :class="payment.type === 'payout' ? 'text-green-400' : 'text-frontier-400'" class="font-bold">
              {{ payment.type === 'payout' ? '+' : '-' }}${{ payment.amount }}
            </p>
            <p class="text-xs text-dusty-400">{{ payment.date }}</p>
            <span :class="`badge-${payment.status === 'completed' ? 'success' : 'warning'} text-xs`">
              {{ payment.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const upcomingPayments = ref([
  {
    id: 1,
    circle_name: 'Pioneer Circle',
    amount: 100,
    due_date: 'Nov 15, 2025',
  },
  {
    id: 2,
    circle_name: 'Frontier Fund',
    amount: 50,
    due_date: 'Nov 20, 2025',
  },
]);

const paymentHistory = ref([
  {
    id: 1,
    type: 'payout',
    circle_name: 'Pioneer Circle',
    amount: 800,
    date: 'Oct 15, 2025',
    status: 'completed',
  },
  {
    id: 2,
    type: 'payment',
    circle_name: 'Pioneer Circle',
    amount: 100,
    date: 'Oct 10, 2025',
    status: 'completed',
  },
  {
    id: 3,
    type: 'payment',
    circle_name: 'Frontier Fund',
    amount: 50,
    date: 'Oct 8, 2025',
    status: 'completed',
  },
]);
</script>
