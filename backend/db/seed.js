import { query } from '../src/utils/db.js';
import crypto from 'crypto';

const generateInviteCode = () => {
  return crypto.randomBytes(5).toString('hex').toUpperCase().substring(0, 10);
};

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Create demo users
    console.log('Creating demo users...');
    const users = await createUsers();
    console.log(`✅ Created ${users.length} users\n`);

    // Create demo circles
    console.log('Creating demo circles...');
    const circles = await createCircles(users);
    console.log(`✅ Created ${circles.length} circles\n`);

    // Add members to circles
    console.log('Adding members to circles...');
    await addCircleMembers(circles, users);
    console.log(`✅ Added members to circles\n`);

    // Create vouches
    console.log('Creating vouches...');
    await createVouches(circles, users);
    console.log(`✅ Created vouches\n`);

    // Create payments
    console.log('Creating payment history...');
    await createPayments(circles, users);
    console.log(`✅ Created payment history\n`);

    // Create credit history
    console.log('Creating credit history...');
    await createCreditHistory(users, circles);
    console.log(`✅ Created credit history\n`);

    console.log('🎉 Database seeded successfully!\n');
    console.log('═══════════════════════════════════════════════');
    console.log('Demo Accounts:');
    console.log('═══════════════════════════════════════════════');
    console.log('1. John Doe (Admin) - auth0|demo-john-doe');
    console.log('2. Maria Garcia - auth0|demo-maria-garcia');
    console.log('3. Ahmed Khan - auth0|demo-ahmed-khan');
    console.log('4. Sarah Johnson - auth0|demo-sarah-johnson');
    console.log('5. Carlos Rodriguez - auth0|demo-carlos-rodriguez');
    console.log('\nDemo Circles:');
    console.log('1. Pioneer Circle - Invite: ' + circles[0].invite_code);
    console.log('2. Frontier Fund - Invite: ' + circles[1].invite_code);
    console.log('3. Starship Savings - Invite: ' + circles[2].invite_code);
    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

async function createUsers() {
  const demoUsers = [
    {
      auth0_id: 'auth0|demo-john-doe',
      name: 'John Doe',
      phone_number: '+1234567890',
      credit_score: 680,
      language_preference: 'en',
    },
    {
      auth0_id: 'auth0|demo-maria-garcia',
      name: 'Maria Garcia',
      phone_number: '+1234567891',
      credit_score: 720,
      language_preference: 'es',
    },
    {
      auth0_id: 'auth0|demo-ahmed-khan',
      name: 'Ahmed Khan',
      phone_number: '+1234567892',
      credit_score: 590,
      language_preference: 'en',
    },
    {
      auth0_id: 'auth0|demo-sarah-johnson',
      name: 'Sarah Johnson',
      phone_number: '+1234567893',
      credit_score: 750,
      language_preference: 'en',
    },
    {
      auth0_id: 'auth0|demo-carlos-rodriguez',
      name: 'Carlos Rodriguez',
      phone_number: '+1234567894',
      credit_score: 640,
      language_preference: 'es',
    },
    {
      auth0_id: 'auth0|demo-linda-chen',
      name: 'Linda Chen',
      phone_number: '+1234567895',
      credit_score: 700,
      language_preference: 'en',
    },
  ];

  const createdUsers = [];

  for (const user of demoUsers) {
    const result = await query(
      `INSERT INTO users (auth0_id, name, phone_number, credit_score, language_preference)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (auth0_id) DO NOTHING
       RETURNING *`,
      [user.auth0_id, user.name, user.phone_number, user.credit_score, user.language_preference]
    );

    if (result.rows.length > 0) {
      createdUsers.push(result.rows[0]);
    } else {
      // User already exists, fetch it
      const existing = await query('SELECT * FROM users WHERE auth0_id = $1', [user.auth0_id]);
      createdUsers.push(existing.rows[0]);
    }
  }

  return createdUsers;
}

async function createCircles(users) {
  const demoCircles = [
    {
      name: 'Pioneer Circle',
      description: 'Our first community circle for student emergency funds',
      admin_id: users[0].id,
      monthly_amount: 100,
      max_members: 10,
      current_cycle: 3,
      next_payout_date: new Date('2025-11-15'),
    },
    {
      name: 'Frontier Fund',
      description: 'Helping immigrant families save together',
      admin_id: users[1].id,
      monthly_amount: 50,
      max_members: 20,
      current_cycle: 2,
      next_payout_date: new Date('2025-11-20'),
    },
    {
      name: 'Starship Savings',
      description: 'Tech workers pooling for major expenses',
      admin_id: users[3].id,
      monthly_amount: 200,
      max_members: 15,
      current_cycle: 1,
      next_payout_date: new Date('2025-12-01'),
    },
  ];

  const createdCircles = [];

  for (const circle of demoCircles) {
    const invite_code = generateInviteCode();

    const result = await query(
      `INSERT INTO circles (name, description, admin_id, monthly_amount, max_members, current_cycle, next_payout_date, invite_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        circle.name,
        circle.description,
        circle.admin_id,
        circle.monthly_amount,
        circle.max_members,
        circle.current_cycle,
        circle.next_payout_date,
        invite_code,
      ]
    );

    createdCircles.push(result.rows[0]);
  }

  return createdCircles;
}

async function addCircleMembers(circles, users) {
  // Pioneer Circle members
  const pioneerMembers = [
    { user: users[0], position: 1, status: 'active', has_received_payout: true },
    { user: users[1], position: 2, status: 'active', has_received_payout: true },
    { user: users[2], position: 3, status: 'active', has_received_payout: false },
    { user: users[3], position: 4, status: 'active', has_received_payout: false },
    { user: users[4], position: 5, status: 'active', has_received_payout: false },
  ];

  for (const member of pioneerMembers) {
    await query(
      `INSERT INTO circle_members (circle_id, user_id, position_in_cycle, status, role, has_received_payout)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (circle_id, user_id) DO NOTHING`,
      [
        circles[0].id,
        member.user.id,
        member.position,
        member.status,
        member.user.id === users[0].id ? 'admin' : 'member',
        member.has_received_payout,
      ]
    );
  }

  // Update circle member count
  await query('UPDATE circles SET current_members = $1 WHERE id = $2', [pioneerMembers.length, circles[0].id]);

  // Frontier Fund members
  const frontierMembers = [
    { user: users[1], position: 1, status: 'active', has_received_payout: true },
    { user: users[2], position: 2, status: 'active', has_received_payout: false },
    { user: users[5], position: 3, status: 'active', has_received_payout: false },
  ];

  for (const member of frontierMembers) {
    await query(
      `INSERT INTO circle_members (circle_id, user_id, position_in_cycle, status, role, has_received_payout)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (circle_id, user_id) DO NOTHING`,
      [
        circles[1].id,
        member.user.id,
        member.position,
        member.status,
        member.user.id === users[1].id ? 'admin' : 'member',
        member.has_received_payout,
      ]
    );
  }

  await query('UPDATE circles SET current_members = $1 WHERE id = $2', [frontierMembers.length, circles[1].id]);

  // Starship Savings members
  const starshipMembers = [
    { user: users[3], position: 1, status: 'active', has_received_payout: false },
    { user: users[4], position: 2, status: 'active', has_received_payout: false },
    { user: users[5], position: 3, status: 'active', has_received_payout: false },
  ];

  for (const member of starshipMembers) {
    await query(
      `INSERT INTO circle_members (circle_id, user_id, position_in_cycle, status, role, has_received_payout)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (circle_id, user_id) DO NOTHING`,
      [
        circles[2].id,
        member.user.id,
        member.position,
        member.status,
        member.user.id === users[3].id ? 'admin' : 'member',
        member.has_received_payout,
      ]
    );
  }

  await query('UPDATE circles SET current_members = $1 WHERE id = $2', [starshipMembers.length, circles[2].id]);
}

async function createVouches(circles, users) {
  const vouches = [
    { circle: circles[0], voucher: users[0], vouchee: users[2], trust_level: 8 },
    { circle: circles[0], voucher: users[1], vouchee: users[2], trust_level: 7 },
    { circle: circles[0], voucher: users[0], vouchee: users[3], trust_level: 9 },
    { circle: circles[1], voucher: users[1], vouchee: users[2], trust_level: 8 },
    { circle: circles[2], voucher: users[3], vouchee: users[4], trust_level: 7 },
  ];

  for (const vouch of vouches) {
    await query(
      `INSERT INTO vouches (circle_id, voucher_id, vouchee_id, trust_level, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (circle_id, voucher_id, vouchee_id) DO NOTHING`,
      [vouch.circle.id, vouch.voucher.id, vouch.vouchee.id, vouch.trust_level, 'Demo vouch']
    );
  }
}

async function createPayments(circles, users) {
  // Create some historical payments
  const paymentsData = [
    // Pioneer Circle - Cycle 1
    { circle: circles[0], user: users[0], cycle: 1, status: 'completed', days_ago: 60 },
    { circle: circles[0], user: users[1], cycle: 1, status: 'completed', days_ago: 60 },
    { circle: circles[0], user: users[2], cycle: 1, status: 'completed', days_ago: 60 },

    // Pioneer Circle - Cycle 2
    { circle: circles[0], user: users[0], cycle: 2, status: 'completed', days_ago: 30 },
    { circle: circles[0], user: users[1], cycle: 2, status: 'completed', days_ago: 30 },
    { circle: circles[0], user: users[2], cycle: 2, status: 'completed', days_ago: 30 },

    // Pioneer Circle - Current Cycle
    { circle: circles[0], user: users[0], cycle: 3, status: 'completed', days_ago: 5 },
    { circle: circles[0], user: users[1], cycle: 3, status: 'completed', days_ago: 3 },

    // Frontier Fund
    { circle: circles[1], user: users[1], cycle: 1, status: 'completed', days_ago: 30 },
    { circle: circles[1], user: users[2], cycle: 1, status: 'completed', days_ago: 30 },
  ];

  for (const payment of paymentsData) {
    const paymentDate = new Date();
    paymentDate.setDate(paymentDate.getDate() - payment.days_ago);

    await query(
      `INSERT INTO payments (circle_id, user_id, amount, cycle_number, payment_date, due_date, status, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        payment.circle.id,
        payment.user.id,
        payment.circle.monthly_amount,
        payment.cycle,
        paymentDate,
        paymentDate,
        payment.status,
        'mock',
      ]
    );
  }

  // Update contribution totals
  await query(`
    UPDATE circle_members
    SET total_contributions = (
      SELECT COALESCE(SUM(amount), 0)
      FROM payments
      WHERE payments.circle_id = circle_members.circle_id
        AND payments.user_id = circle_members.user_id
        AND payments.status = 'completed'
    )
  `);
}

async function createCreditHistory(users, circles) {
  const events = [
    { user: users[0], type: 'payment_made', impact: 10, circle: circles[0] },
    { user: users[0], type: 'payment_made', impact: 10, circle: circles[0] },
    { user: users[0], type: 'vouch_given', impact: 5, circle: circles[0] },
    { user: users[1], type: 'payment_made', impact: 10, circle: circles[0] },
    { user: users[1], type: 'payment_made', impact: 10, circle: circles[1] },
    { user: users[2], type: 'vouch_received', impact: 15, circle: circles[0] },
    { user: users[2], type: 'payment_made', impact: 10, circle: circles[0] },
  ];

  for (const event of events) {
    const currentUser = await query('SELECT credit_score FROM users WHERE id = $1', [event.user.id]);
    const previousScore = currentUser.rows[0].credit_score;
    const newScore = previousScore + event.impact;

    await query(
      `INSERT INTO credit_history (user_id, event_type, impact, previous_score, new_score, circle_id, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        event.user.id,
        event.type,
        event.impact,
        previousScore,
        newScore,
        event.circle.id,
        `Demo ${event.type.replace('_', ' ')}`,
      ]
    );

    // Update user's credit score
    await query('UPDATE users SET credit_score = $1 WHERE id = $2', [newScore, event.user.id]);
  }
}

// Run seed
seed();
