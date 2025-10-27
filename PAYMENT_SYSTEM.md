# 💳 Marketplace Payment System

A comprehensive deposit payment and refund system for the community marketplace, built using the same patterns as the existing circle payment system.

## 🎯 Overview

The payment system handles:

- **Deposit Payments**: When borrowers pay security deposits for approved items
- **Refunds**: When items are returned and deposits are refunded
- **Payment History**: Track all payment transactions
- **Multiple Payment Methods**: Credit card, debit card, bank account, digital wallet, and demo payments

## 🏗️ Architecture

### Backend Components

#### Database Schema

- **`marketplace_payments`** table: Stores all payment transactions
- **`item_borrows`** table: Updated with payment status and amounts
- **`items`** table: Status updated when items are borrowed/returned

#### API Endpoints

```
POST /api/marketplace/payments/deposit
POST /api/marketplace/payments/refund
GET /api/marketplace/payments/history
GET /api/marketplace/payments/pending
```

#### Controllers

- **`marketplacePaymentController.js`**: Handles all payment logic
- **`marketplaceController.js`**: Updated with payment integration
- **`borrowController.js`**: Updated with payment flow

### Frontend Components

#### MyMarketplace.vue

- **Payments Tab**: New tab for payment management
- **Payment Modal**: Similar to circle payment modal
- **Payment History**: Shows all past transactions
- **Pending Payments**: Shows approved borrows needing payment

#### Payment Flow

1. User requests to borrow item
2. Owner approves request
3. Borrower pays deposit (via Payments tab)
4. Item status changes to "borrowed"
5. When returned, owner processes refund
6. Deposit is refunded to borrower

## 🔄 Payment Flow

### 1. Deposit Payment Process

```
Borrow Request → Owner Approval → Payment Required → Deposit Paid → Item Borrowed
```

### 2. Refund Process

```
Item Returned → Owner Confirms → Refund Processed → Deposit Returned
```

## 💰 Payment Methods

### Supported Methods

- **Credit Card** 💳: Full card details required
- **Debit Card** 💳: Full card details required
- **Bank Account** 🏦: ACH transfer simulation
- **Digital Wallet** 📱: Mobile payment simulation
- **Demo Payment** 💰: Mock payment for testing

### Card Validation

- Card number formatting (spaces every 4 digits)
- Expiry date formatting (MM/YY)
- CVV validation
- Cardholder name required

## 🎨 UI Features

### Payment Modal

- Clean, modern design matching existing UI
- Payment method selection with icons
- Card details form (when applicable)
- Real-time validation
- Loading states and error handling

### Payment History

- Transaction list with status indicators
- Color-coded amounts (red for payments, green for refunds)
- Status badges (completed, pending, failed, refunded)
- Date formatting and sorting

### Notifications

- Toast notifications for payment success/failure
- Real-time updates when payments are processed
- Error messages with helpful details

## 🔧 Technical Implementation

### Database Updates

```sql
-- New marketplace_payments table
CREATE TABLE marketplace_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  borrow_id UUID REFERENCES item_borrows(id),
  borrower_id UUID REFERENCES users(id),
  owner_id UUID REFERENCES users(id),
  item_id UUID REFERENCES items(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_type VARCHAR(20) NOT NULL, -- deposit, refund, rental_fee
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'mock',
  transaction_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Integration

```javascript
// Frontend API calls
api.marketplace.processDeposit(paymentData);
api.marketplace.processRefund(refundData);
api.marketplace.getPaymentHistory();
api.marketplace.getPendingPayments();
```

### Credit Score Integration

- **Deposit Paid**: +5 points
- **Item Returned**: +10 points
- **Failed Payment**: -5 points (if implemented)

## 🚀 Deployment

### Backend Deployment

```bash
# Run the deployment script
./deploy-payment-system.sh
```

### Frontend Deployment

```bash
# Build and deploy to Cloudflare Pages
cd frontend
npm run build
# Upload dist/ folder to Cloudflare Pages
```

## 🧪 Testing

### Test Scenarios

1. **Happy Path**: Request → Approve → Pay → Borrow → Return → Refund
2. **Payment Failure**: Invalid card details, network errors
3. **Multiple Payments**: Multiple items, different payment methods
4. **Refund Process**: Owner-initiated refunds

### Demo Data

- Use "Demo Payment" method for testing
- Mock transaction IDs generated automatically
- No real payment processing (hackathon demo)

## 🔒 Security Considerations

### For Production

- Integrate with real payment processor (Stripe, Square)
- Encrypt sensitive payment data
- Implement PCI compliance
- Add fraud detection
- Secure API endpoints with rate limiting

### Current Implementation

- Mock payment processing for demo
- Basic validation and error handling
- Secure API endpoints with JWT authentication

## 📊 Monitoring & Analytics

### Key Metrics

- Payment success rate
- Average payment processing time
- Refund processing time
- Payment method preferences
- Failed payment reasons

### Logging

- All payment attempts logged
- Error tracking and reporting
- Transaction audit trail
- User activity monitoring

## 🎯 Future Enhancements

### Planned Features

- **Rental Fees**: Daily/weekly rental charges
- **Partial Refunds**: Damage deductions
- **Payment Plans**: Installment payments
- **Dispute Resolution**: Payment disputes
- **Analytics Dashboard**: Payment insights

### Integration Opportunities

- **Stripe Integration**: Real payment processing
- **Email Notifications**: Payment confirmations
- **SMS Alerts**: Payment reminders
- **Mobile App**: Native payment experience

## 🐛 Troubleshooting

### Common Issues

1. **Payment Modal Not Opening**: Check function name conflicts
2. **API Errors**: Verify backend deployment
3. **Database Errors**: Check schema updates
4. **UI Not Updating**: Check reactive data binding

### Debug Steps

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check database connection and schema
4. Validate payment data format

## 📝 API Documentation

### Process Deposit Payment

```javascript
POST /api/marketplace/payments/deposit
{
  "borrow_id": "uuid",
  "payment_method": "credit_card",
  "card_details": {
    "number": "1234567890123456",
    "name": "John Doe",
    "expiry": "12/25",
    "cvv": "123"
  }
}
```

### Process Refund

```javascript
POST /api/marketplace/payments/refund
{
  "borrow_id": "uuid"
}
```

### Get Payment History

```javascript
GET / api / marketplace / payments / history;
// Returns array of payment transactions
```

### Get Pending Payments

```javascript
GET / api / marketplace / payments / pending;
// Returns approved borrows needing payment
```

---

## 🎉 Ready to Use!

The payment system is now fully integrated and ready for testing. Users can:

- ✅ Pay deposits for approved borrows
- ✅ View payment history
- ✅ Process refunds when items are returned
- ✅ Track payment status in real-time

**Happy borrowing! 🤠✨**
