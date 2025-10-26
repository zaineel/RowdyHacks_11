<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-frontier-400 mb-2">
          My Marketplace
        </h1>
        <p class="text-dusty-300">Manage your listings and borrows</p>
      </div>
      <button @click="$router.push('/marketplace/list')" class="btn-frontier">
        + List an Item
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <button
        @click="activeTab = 'listings'"
        :class="
          activeTab === 'listings' ? 'btn-frontier' : 'btn-frontier-outline'
        ">
        My Listings
        <span
          v-if="listings.length > 0"
          class="ml-2 px-2 py-0.5 bg-frontier-400 text-white rounded-full text-xs">
          {{ listings.length }}
        </span>
      </button>
      <button
        @click="activeTab = 'borrows'"
        :class="
          activeTab === 'borrows' ? 'btn-frontier' : 'btn-frontier-outline'
        ">
        My Borrows
        <span
          v-if="borrows.length > 0"
          class="ml-2 px-2 py-0.5 bg-frontier-400 text-white rounded-full text-xs">
          {{ borrows.length }}
        </span>
      </button>
      <button
        @click="activeTab = 'requests'"
        :class="
          activeTab === 'requests' ? 'btn-frontier' : 'btn-frontier-outline'
        ">
        Borrow Requests
        <span
          v-if="pendingRequests.length > 0"
          class="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
          {{ pendingRequests.length }}
        </span>
      </button>
      <button
        @click="activeTab = 'payments'"
        :class="
          activeTab === 'payments' ? 'btn-frontier' : 'btn-frontier-outline'
        ">
        Payments
        <span
          v-if="pendingPayments.length > 0"
          class="ml-2 px-2 py-0.5 bg-yellow-500 text-white rounded-full text-xs">
          {{ pendingPayments.length }}
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="spinner mx-auto"></div>
    </div>

    <!-- My Listings Tab -->
    <div v-else-if="activeTab === 'listings'">
      <div v-if="listings.length === 0" class="card text-center py-12">
        <span class="text-6xl mb-4 block">📦</span>
        <p class="text-dusty-300 mb-2">No items listed yet</p>
        <p class="text-sm text-dusty-400 mb-6">
          Start lending to earn credit points!
        </p>
        <button @click="$router.push('/marketplace/list')" class="btn-frontier">
          List Your First Item
        </button>
      </div>

      <div v-else class="grid md:grid-cols-2 gap-6">
        <div v-for="item in listings" :key="item.id" class="card">
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-xl font-semibold text-frontier-400">
              {{ item.title }}
            </h3>
            <span :class="getStatusBadge(item.status)">{{ item.status }}</span>
          </div>

          <div class="grid grid-cols-3 gap-3 mb-4 text-sm">
            <div>
              <div class="text-dusty-400">Deposit</div>
              <div class="font-semibold">${{ item.deposit_amount }}</div>
            </div>
            <div>
              <div class="text-dusty-400">Daily Rate</div>
              <div class="font-semibold">
                {{ item.daily_rate > 0 ? `$${item.daily_rate}` : "Free" }}
              </div>
            </div>
            <div>
              <div class="text-dusty-400">Borrows</div>
              <div class="font-semibold">{{ item.total_borrows || 0 }}</div>
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

    <!-- My Borrows Tab -->
    <div v-else-if="activeTab === 'borrows'">
      <div v-if="borrows.length === 0" class="card text-center py-12">
        <span class="text-6xl mb-4 block">🤝</span>
        <p class="text-dusty-300 mb-2">No borrow history yet</p>
        <p class="text-sm text-dusty-400 mb-6">
          Browse the marketplace to borrow items!
        </p>
        <button @click="$router.push('/marketplace')" class="btn-frontier">
          Browse Marketplace
        </button>
      </div>

      <div v-else class="space-y-4">
        <div v-for="borrow in borrows" :key="borrow.id" class="card">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-xl font-semibold text-frontier-400">
                {{ borrow.item_title }}
              </h3>
              <p class="text-sm text-dusty-400">
                Owner: {{ borrow.owner_name }}
              </p>
            </div>
            <span :class="getBorrowStatusBadge(borrow.status)">{{
              borrow.status
            }}</span>
          </div>

          <div class="grid grid-cols-3 gap-3 mb-3 text-sm">
            <div>
              <div class="text-dusty-400">Start Date</div>
              <div class="font-semibold">
                {{ formatDate(borrow.borrow_start_date) }}
              </div>
            </div>
            <div>
              <div class="text-dusty-400">End Date</div>
              <div class="font-semibold">
                {{ formatDate(borrow.borrow_end_date) }}
              </div>
            </div>
            <div>
              <div class="text-dusty-400">Deposit</div>
              <div class="font-semibold">${{ borrow.deposit_paid }}</div>
            </div>
          </div>

          <button
            v-if="borrow.status === 'approved'"
            @click="markAsReturned(borrow.id)"
            class="btn-frontier w-full">
            Mark as Returned
          </button>
        </div>
      </div>
    </div>

    <!-- Borrow Requests Tab -->
    <div v-else-if="activeTab === 'requests'">
      <div v-if="pendingRequests.length === 0" class="card text-center py-12">
        <span class="text-6xl mb-4 block">✉️</span>
        <p class="text-dusty-300 mb-2">No pending requests</p>
        <p class="text-sm text-dusty-400">Borrow requests will appear here</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="request in pendingRequests"
          :key="request.id"
          class="card border-l-4 border-yellow-500">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-frontier-400">
                {{ request.item_title }}
              </h3>
              <div class="flex items-center space-x-4 mt-2">
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-dusty-400">Requested by:</span>
                  <span class="font-semibold text-starlight-400">{{
                    request.borrower_name
                  }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-dusty-400">Credit Score:</span>
                  <span
                    class="font-semibold"
                    :class="getCreditScoreClass(request.borrower_credit_score)">
                    {{ request.borrower_credit_score }}
                  </span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <span class="badge-warning">pending approval</span>
              <p class="text-xs text-dusty-400 mt-1">
                {{ formatDate(request.created_at) }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-3 text-sm">
            <div>
              <div class="text-dusty-400">From</div>
              <div class="font-semibold">
                {{ formatDate(request.borrow_start_date) }}
              </div>
            </div>
            <div>
              <div class="text-dusty-400">To</div>
              <div class="font-semibold">
                {{ formatDate(request.borrow_end_date) }}
              </div>
            </div>
          </div>

          <div v-if="request.notes" class="bg-dusty-700 rounded-lg p-3 mb-3">
            <p class="text-sm text-dusty-300">{{ request.notes }}</p>
          </div>

          <div class="flex gap-3">
            <button
              @click="approveBorrow(request.id)"
              class="btn-frontier flex-1 flex items-center justify-center">
              <span class="mr-2">✅</span>
              Approve Request
            </button>
            <button
              @click="rejectBorrow(request.id)"
              class="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-200 flex-1 flex items-center justify-center">
              <span class="mr-2">❌</span>
              Reject Request
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payments Tab -->
    <div v-else-if="activeTab === 'payments'">
      <div
        v-if="pendingPayments.length === 0 && paymentHistory.length === 0"
        class="card text-center py-12">
        <span class="text-6xl mb-4 block">💳</span>
        <p class="text-dusty-300 mb-2">No payment activity</p>
        <p class="text-sm text-dusty-400">
          Deposit payments and refunds will appear here
        </p>
      </div>

      <div v-else class="space-y-6">
        <!-- Pending Payments -->
        <div v-if="pendingPayments.length > 0">
          <h3 class="text-xl font-semibold text-frontier-400 mb-4">
            Pending Payments
          </h3>
          <div class="space-y-4">
            <div
              v-for="payment in pendingPayments"
              :key="payment.id"
              class="card border-l-4 border-yellow-500">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h4 class="text-lg font-semibold text-frontier-400">
                    {{ payment.title }}
                  </h4>
                  <div class="flex items-center space-x-4 mt-2">
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-dusty-400"
                        >Deposit Amount:</span
                      >
                      <span class="font-semibold text-starlight-400"
                        >${{ payment.deposit_amount }}</span
                      >
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-dusty-400">Owner:</span>
                      <span class="font-semibold text-starlight-400">{{
                        payment.owner_name
                      }}</span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <span class="badge-warning">Payment Required</span>
                  <p class="text-xs text-dusty-400 mt-1">
                    {{ formatDate(payment.created_at) }}
                  </p>
                </div>
              </div>

              <div class="flex gap-3">
                <button
                  @click="openPaymentModal(payment)"
                  class="btn-frontier flex-1 flex items-center justify-center">
                  <span class="mr-2">💳</span>
                  Pay Deposit
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment History -->
        <div v-if="paymentHistory.length > 0">
          <h3 class="text-xl font-semibold text-frontier-400 mb-4">
            Payment History
          </h3>
          <div class="space-y-3">
            <div
              v-for="payment in paymentHistory"
              :key="payment.id"
              class="card">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold text-frontier-400">
                    {{ payment.item_title }}
                  </h4>
                  <p class="text-sm text-dusty-400">
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
                    class="font-semibold"
                    :class="
                      payment.payment_type === 'deposit'
                        ? 'text-red-400'
                        : 'text-green-400'
                    ">
                    {{ payment.payment_type === "deposit" ? "-" : "+" }}${{
                      payment.amount
                    }}
                  </div>
                  <div class="text-xs text-dusty-400">
                    {{ formatDate(payment.created_at) }}
                  </div>
                  <div
                    class="text-xs"
                    :class="getPaymentStatusClass(payment.status)">
                    {{ payment.status }}
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
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div class="bg-dusty-800 rounded-lg p-6 max-w-md w-full mx-4 my-auto">
        <h2 class="text-2xl font-bold text-frontier-400 mb-4">Pay Deposit</h2>
        <p class="text-dusty-300 mb-6">
          Complete your deposit payment to start borrowing
        </p>

        <div class="mb-6">
          <div class="bg-dusty-700 rounded-lg p-4 mb-4">
            <h3 class="font-semibold text-frontier-400 mb-2">
              {{ selectedPayment?.title }}
            </h3>
            <div class="flex justify-between items-center">
              <span class="text-dusty-300">Deposit Amount:</span>
              <span class="text-xl font-bold text-starlight-400"
                >${{ selectedPayment?.deposit_amount }}</span
              >
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-dusty-300 mb-2"
              >Payment Method</label
            >
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="method in paymentMethods"
                :key="method.value"
                @click="selectedPaymentMethod = method.value"
                :class="[
                  'p-3 rounded-lg border-2 text-center transition-all duration-200',
                  selectedPaymentMethod === method.value
                    ? 'border-frontier-400 bg-frontier-400 bg-opacity-10 text-frontier-400'
                    : 'border-dusty-600 text-dusty-300 hover:border-dusty-500',
                ]">
                <div class="text-2xl mb-1">{{ method.icon }}</div>
                <div class="text-sm font-medium">{{ method.label }}</div>
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
