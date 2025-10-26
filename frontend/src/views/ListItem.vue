<template>
  <div class="max-w-2xl mx-auto">
    <button @click="$router.push('/marketplace')" class="text-frontier-400 hover:text-frontier-300 mb-6">
      ← Back to Marketplace
    </button>

    <div class="card">
      <h1 class="text-3xl font-bold text-frontier-400 mb-2">List an Item</h1>
      <p class="text-dusty-300 mb-8">Share your items with the community and build credit!</p>

      <form @submit.prevent="submitItem">
        <!-- Title -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Item Title *</label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="e.g., Power Drill, Gaming Console, Textbook"
            class="input-field"
            :disabled="isSubmitting"
          />
        </div>

        <!-- Description -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Description</label>
          <textarea
            v-model="form.description"
            rows="4"
            placeholder="Describe the item, its features, and any special instructions..."
            class="input-field resize-none"
            :disabled="isSubmitting"
          ></textarea>
        </div>

        <!-- Category & Condition -->
        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-medium mb-2">Category *</label>
            <select v-model="form.category" required class="input-field" :disabled="isSubmitting">
              <option value="" disabled>Select category</option>
              <option value="tools">🔧 Tools</option>
              <option value="electronics">💻 Electronics</option>
              <option value="books">📚 Books</option>
              <option value="sports">⚽ Sports Equipment</option>
              <option value="household">🏠 Household Items</option>
              <option value="other">📦 Other</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Condition *</label>
            <select v-model="form.condition" required class="input-field" :disabled="isSubmitting">
              <option value="" disabled>Select condition</option>
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>
        </div>

        <!-- Deposit & Daily Rate -->
        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-medium mb-2">
              Security Deposit *
              <span class="text-xs text-dusty-400">(Refundable)</span>
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-dusty-400">$</span>
              <input
                v-model.number="form.deposit_amount"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                class="input-field pl-8"
                :disabled="isSubmitting"
              />
            </div>
            <p class="text-xs text-dusty-400 mt-1">Protects your item if damaged or not returned</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">
              Daily Rental Fee
              <span class="text-xs text-dusty-400">(Optional)</span>
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-dusty-400">$</span>
              <input
                v-model.number="form.daily_rate"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="input-field pl-8"
                :disabled="isSubmitting"
              />
            </div>
            <p class="text-xs text-dusty-400 mt-1">Leave at 0 for free lending</p>
          </div>
        </div>

        <!-- Minimum Credit Score -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">
            Minimum Borrower Credit Score: {{ form.min_credit_score }}
          </label>
          <input
            v-model.number="form.min_credit_score"
            type="range"
            min="300"
            max="850"
            step="10"
            class="w-full"
            :disabled="isSubmitting"
          />
          <div class="flex justify-between text-xs text-dusty-400 mt-1">
            <span>300 (Anyone)</span>
            <span>500 (Default)</span>
            <span>850 (Highest)</span>
          </div>
          <p class="text-xs text-dusty-400 mt-2">
            Only users with this credit score or higher can borrow your item
          </p>
        </div>

        <!-- Benefits Info -->
        <div class="bg-frontier-500/10 border border-frontier-500/30 rounded-lg p-4 mb-6">
          <p class="text-sm text-dusty-100 font-medium mb-2">💡 Benefits of Lending</p>
          <ul class="text-xs text-dusty-300 space-y-1">
            <li>• Earn +10 credit points for each successful lending</li>
            <li>• Help your community members access items they need</li>
            <li>• Deposit protects your item from damage</li>
            <li>• Build your reputation in the marketplace</li>
          </ul>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            type="button"
            @click="$router.push('/marketplace')"
            class="btn-frontier-outline flex-1"
            :disabled="isSubmitting"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn-frontier flex-1"
            :disabled="isSubmitting || !isFormValid"
          >
            <span v-if="isSubmitting" class="spinner inline-block mr-2"></span>
            {{ isSubmitting ? 'Listing...' : 'List Item' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const isSubmitting = ref(false);

const form = ref({
  title: '',
  description: '',
  category: '',
  condition: '',
  deposit_amount: null,
  daily_rate: 0,
  min_credit_score: 500
});

const isFormValid = computed(() => {
  return form.value.title &&
         form.value.category &&
         form.value.condition &&
         form.value.deposit_amount !== null &&
         form.value.deposit_amount >= 0;
});

const submitItem = async () => {
  if (!isFormValid.value) {
    alert('Please fill in all required fields');
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await api.marketplace.create({
      title: form.value.title,
      description: form.value.description,
      category: form.value.category,
      condition: form.value.condition,
      deposit_amount: form.value.deposit_amount,
      daily_rate: form.value.daily_rate || 0,
      min_credit_score: form.value.min_credit_score
    });

    alert('Item listed successfully! 🎉');
    router.push(`/marketplace/${response.data.data.id}`);
  } catch (error) {
    console.error('Error creating item:', error);
    alert(error.response?.data?.error?.message || 'Failed to list item. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>
