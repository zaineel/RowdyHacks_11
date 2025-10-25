<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-frontier-400 mb-2">Create a New Circle</h1>
    <p class="text-dusty-300 mb-8">Start a new lending circle in your community</p>

    <div class="card">
      <form @submit.prevent="createCircle">
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium mb-2">Circle Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g., Pioneer Circle"
              class="input-field"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="What is this circle for?"
              class="input-field"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Monthly Contribution Amount</label>
            <div class="relative">
              <span class="absolute left-4 top-3 text-dusty-400">$</span>
              <input
                v-model.number="form.monthly_amount"
                type="number"
                required
                min="10"
                placeholder="100"
                class="input-field pl-8"
              />
            </div>
            <p class="text-sm text-dusty-400 mt-1">Each member contributes this amount monthly</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Maximum Members</label>
            <input
              v-model.number="form.max_members"
              type="number"
              required
              min="3"
              max="50"
              placeholder="20"
              class="input-field"
            />
            <p class="text-sm text-dusty-400 mt-1">Number of people in the circle (3-50)</p>
          </div>

          <div class="bg-starlight-900/20 border border-starlight-700 rounded-lg p-4">
            <h4 class="font-semibold text-starlight-400 mb-2">💡 How it works</h4>
            <ul class="text-sm text-dusty-300 space-y-1">
              <li>• Each member contributes monthly</li>
              <li>• One member receives the full pot each month</li>
              <li>• Rotation continues until everyone has received</li>
              <li>• Build credit with every on-time payment</li>
            </ul>
          </div>

          <div class="flex space-x-4">
            <button type="submit" :disabled="loading" class="btn-frontier flex-1">
              <span v-if="loading" class="spinner inline-block mr-2"></span>
              Create Circle
            </button>
            <button type="button" @click="$router.back()" class="btn-frontier-outline flex-1">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const loading = ref(false);

const form = ref({
  name: '',
  description: '',
  monthly_amount: 100,
  max_members: 20,
});

const createCircle = async () => {
  loading.value = true;
  try {
    const response = await api.circles.create(form.value);
    router.push(`/circles/${response.data.data.id}`);
  } catch (error) {
    console.error('Error creating circle:', error);
    alert('Failed to create circle. Please try again.');
  } finally {
    loading.value = false;
  }
};
</script>
