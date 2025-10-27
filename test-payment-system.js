#!/usr/bin/env node

/**
 * Test script for the payment system
 * This script tests the payment API endpoints
 */

const axios = require("axios");

const API_BASE = "http://localhost:3000/api";

// Mock JWT token (you'll need to replace this with a real one)
const MOCK_JWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...";

const headers = {
  Authorization: `Bearer ${MOCK_JWT}`,
  "Content-Type": "application/json",
};

async function testPaymentEndpoints() {
  console.log("🧪 Testing Payment System Endpoints...\n");

  try {
    // Test 1: Get pending payments
    console.log("1️⃣ Testing GET /api/marketplace/payments/pending");
    try {
      const pendingResponse = await axios.get(
        `${API_BASE}/marketplace/payments/pending`,
        { headers }
      );
      console.log("✅ Pending payments endpoint working");
      console.log(
        `   Found ${pendingResponse.data.data.length} pending payments\n`
      );
    } catch (error) {
      console.log(
        "❌ Pending payments endpoint failed:",
        error.response?.status,
        error.response?.data?.error?.message || error.message
      );
    }

    // Test 2: Get payment history
    console.log("2️⃣ Testing GET /api/marketplace/payments/history");
    try {
      const historyResponse = await axios.get(
        `${API_BASE}/marketplace/payments/history`,
        { headers }
      );
      console.log("✅ Payment history endpoint working");
      console.log(
        `   Found ${historyResponse.data.data.length} payment records\n`
      );
    } catch (error) {
      console.log(
        "❌ Payment history endpoint failed:",
        error.response?.status,
        error.response?.data?.error?.message || error.message
      );
    }

    // Test 3: Test deposit payment (this will fail without valid borrow_id)
    console.log("3️⃣ Testing POST /api/marketplace/payments/deposit");
    try {
      const depositData = {
        borrow_id: "test-borrow-id",
        payment_method: "mock",
      };
      const depositResponse = await axios.post(
        `${API_BASE}/marketplace/payments/deposit`,
        depositData,
        { headers }
      );
      console.log("✅ Deposit payment endpoint working");
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(
          "✅ Deposit payment endpoint working (expected 404 for test borrow_id)"
        );
      } else {
        console.log(
          "❌ Deposit payment endpoint failed:",
          error.response?.status,
          error.response?.data?.error?.message || error.message
        );
      }
    }

    // Test 4: Test refund payment (this will fail without valid borrow_id)
    console.log("4️⃣ Testing POST /api/marketplace/payments/refund");
    try {
      const refundData = {
        borrow_id: "test-borrow-id",
      };
      const refundResponse = await axios.post(
        `${API_BASE}/marketplace/payments/refund`,
        refundData,
        { headers }
      );
      console.log("✅ Refund payment endpoint working");
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(
          "✅ Refund payment endpoint working (expected 404 for test borrow_id)"
        );
      } else {
        console.log(
          "❌ Refund payment endpoint failed:",
          error.response?.status,
          error.response?.data?.error?.message || error.message
        );
      }
    }

    console.log("\n🎉 Payment system test completed!");
    console.log("\n📋 Next steps:");
    console.log("1. Deploy backend files to production server");
    console.log("2. Deploy frontend to Cloudflare Pages");
    console.log("3. Test the full payment flow in the UI");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testPaymentEndpoints();
