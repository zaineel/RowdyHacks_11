# 🧪 Payment System Testing Guide

## 🎯 Testing Overview

This guide will help you test the complete payment system workflow from request to refund.

## 📋 Prerequisites

### Backend Setup

- [ ] Backend server running on localhost:3000
- [ ] Database schema updated with marketplace_payments table
- [ ] Payment controller and routes deployed

### Frontend Setup

- [ ] Frontend running on localhost:5173
- [ ] Latest build with payment UI deployed
- [ ] User authenticated and logged in

## 🔄 Complete Test Workflow

### Step 1: Create Test Data

1. **List an Item**:

   - Go to Marketplace → "+ List an Item"
   - Create a test item with deposit amount (e.g., $50)
   - Set category, condition, description
   - Submit the listing

2. **Request to Borrow**:
   - Switch to another user account (or use incognito)
   - Browse marketplace and find your test item
   - Click "Request to Borrow"
   - Fill in borrow details and submit

### Step 2: Test Approval Flow

1. **Switch back to owner account**
2. **Go to My Marketplace**:
   - Click "My Marketplace" button
   - You should see the "Borrow Requests" tab with a red notification badge
3. **Approve Request**:
   - Click on "Borrow Requests" tab
   - Find the pending request
   - Click "✅ Approve Request"
   - Verify notification shows success

### Step 3: Test Payment Flow

1. **Switch to borrower account**
2. **Go to My Marketplace**:
   - Click "My Marketplace" button
   - Click on "Payments" tab
   - You should see a yellow notification badge
3. **Pay Deposit**:
   - Find the pending payment
   - Click "💳 Pay Deposit"
   - Payment modal should open
4. **Test Payment Methods**:
   - Try "Demo Payment" method (easiest for testing)
   - Try "Credit Card" method with test data:
     - Card: 1234 5678 9012 3456
     - Expiry: 12/25
     - CVV: 123
     - Name: Test User
5. **Complete Payment**:
   - Click "Pay $X" button
   - Should see success notification
   - Payment should disappear from pending list

### Step 4: Test Return and Refund Flow

1. **Mark Item as Returned** (as borrower):

   - Go to "My Borrows" tab
   - Find the active borrow
   - Click "Mark as Returned"

2. **Process Refund** (as owner):
   - Go to "Borrow Requests" tab
   - Find the returned item
   - Click "Process Refund" or similar action
   - Verify refund is processed

### Step 5: Verify Payment History

1. **Check Payment History**:
   - Go to "Payments" tab
   - Should see both deposit payment and refund
   - Verify amounts and statuses are correct

## 🧪 Individual Component Tests

### API Endpoint Tests

```bash
# Test pending payments
curl -X GET http://localhost:3000/api/marketplace/payments/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test payment history
curl -X GET http://localhost:3000/api/marketplace/payments/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test deposit payment
curl -X POST http://localhost:3000/api/marketplace/payments/deposit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"borrow_id":"VALID_BORROW_ID","payment_method":"mock"}'
```

### UI Component Tests

1. **Payment Modal**:

   - [ ] Opens when clicking "Pay Deposit"
   - [ ] Shows correct item details
   - [ ] Payment method selection works
   - [ ] Card form appears for card methods
   - [ ] Form validation works
   - [ ] Closes on cancel
   - [ ] Processes payment successfully

2. **Payment History**:

   - [ ] Shows all transactions
   - [ ] Correct amounts and colors
   - [ ] Proper status indicators
   - [ ] Date formatting

3. **Notifications**:
   - [ ] Success notifications appear
   - [ ] Error notifications appear
   - [ ] Notifications auto-dismiss
   - [ ] Badge counts update correctly

## 🐛 Common Issues & Solutions

### Payment Modal Won't Open

- **Issue**: Clicking "Pay Deposit" does nothing
- **Solution**: Check browser console for JavaScript errors
- **Fix**: Verify `openPaymentModal` function is defined

### API 404 Errors

- **Issue**: Payment endpoints return 404
- **Solution**: Check if backend routes are properly imported
- **Fix**: Verify `marketplacePaymentController` is imported in routes

### Database Errors

- **Issue**: Payment data not saving
- **Solution**: Check if marketplace_payments table exists
- **Fix**: Run database schema update script

### UI Not Updating

- **Issue**: Payment status doesn't update after payment
- **Solution**: Check if `loadData()` is called after payment
- **Fix**: Verify reactive data binding

## 📊 Test Scenarios

### Happy Path

1. ✅ Request → Approve → Pay → Borrow → Return → Refund
2. ✅ All notifications work
3. ✅ Payment history updates
4. ✅ Credit scores update

### Error Scenarios

1. ✅ Invalid card details
2. ✅ Network errors during payment
3. ✅ Payment timeout
4. ✅ Invalid borrow ID

### Edge Cases

1. ✅ Multiple pending payments
2. ✅ Large deposit amounts
3. ✅ Special characters in item names
4. ✅ Very long descriptions

## 🎯 Success Criteria

The payment system is working correctly if:

- [ ] Users can pay deposits for approved borrows
- [ ] Payment modal works with all payment methods
- [ ] Payment history shows all transactions
- [ ] Refunds are processed correctly
- [ ] Notifications appear for all actions
- [ ] Badge counts update in real-time
- [ ] No JavaScript errors in console
- [ ] All API endpoints respond correctly

## 🚀 Production Testing

Once deployed to production:

1. **Test with real users** (if possible)
2. **Test with different browsers**
3. **Test on mobile devices**
4. **Test with slow network connections**
5. **Verify all notifications work**
6. **Check payment history accuracy**

---

## 🎉 Ready to Test!

Follow this guide step by step to ensure your payment system works perfectly. Take screenshots of any issues and document the results!

**Happy testing! 🧪✨**
