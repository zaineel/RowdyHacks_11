import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Assess risk for a new member joining a circle
 */
export const assessMemberRisk = async (memberData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a financial risk assessment AI for a digital lending circle (ROSCA/tanda) platform.

Analyze the following member data and provide a risk assessment:

User Information:
- Credit Score: ${memberData.creditScore}/850
- Total Circles Joined: ${memberData.totalCircles}
- Completed Payments: ${memberData.completedPayments}
- Failed/Missed Payments: ${memberData.failedPayments}
- Number of Vouches Received: ${memberData.vouchCount}

Based on this data, provide:
1. A risk score (0-100, where 0 is lowest risk and 100 is highest risk)
2. A risk level (low, medium, high, or critical)
3. A list of 2-4 key risk factors (both positive and negative)
4. A recommendation (approve, approve with conditions, or reject)

Respond in valid JSON format with this structure:
{
  "riskScore": number,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "factors": ["factor 1", "factor 2", ...],
  "recommendations": "detailed recommendation text"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const assessment = JSON.parse(jsonMatch[0]);

    return assessment;
  } catch (error) {
    console.error('Gemini API Error:', error);

    // Fallback to rule-based assessment
    return ruleBasedRiskAssessment(memberData);
  }
};

/**
 * Detect fraud patterns in payment history
 */
export const detectFraudPatterns = async (userData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a fraud detection AI for a digital lending circle platform.

Analyze the following user data for potential fraud patterns:

User ID: ${userData.userId}
Number of Circles: ${userData.circles.length}
Recent Payments: ${userData.payments.length}

Payment Pattern Summary:
${userData.payments.slice(0, 10).map(p => `- ${p.status} payment of $${p.amount} on ${p.payment_date}`).join('\n')}

Circle Membership Summary:
${userData.circles.map(c => `- ${c.name} (${c.member_status})`).join('\n')}

Look for:
1. Duplicate accounts across circles
2. Suspicious payment patterns
3. Rapid joining/leaving of circles
4. Unusual transaction amounts
5. Timing patterns that suggest fraud

Respond in valid JSON format:
{
  "isSuspicious": boolean,
  "confidenceLevel": number (0-100),
  "suspiciousPatterns": ["pattern 1", "pattern 2", ...],
  "recommendation": "detailed recommendation",
  "alertLevel": "none" | "low" | "medium" | "high"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const fraudAnalysis = JSON.parse(jsonMatch[0]);

    return fraudAnalysis;
  } catch (error) {
    console.error('Gemini API Error:', error);

    // Fallback to rule-based fraud detection
    return ruleBasedFraudDetection(userData);
  }
};

/**
 * Fallback rule-based risk assessment
 */
const ruleBasedRiskAssessment = (memberData) => {
  let riskScore = 50; // Start at neutral
  const factors = [];

  // Credit score factor
  if (memberData.creditScore >= 700) {
    riskScore -= 20;
    factors.push('✅ Good credit score');
  } else if (memberData.creditScore < 500) {
    riskScore += 20;
    factors.push('⚠️ Low credit score');
  }

  // Payment history factor
  if (memberData.completedPayments > 10) {
    riskScore -= 15;
    factors.push('✅ Strong payment history');
  }

  if (memberData.failedPayments > 3) {
    riskScore += 25;
    factors.push('❌ Multiple missed payments');
  }

  // Vouch factor
  if (memberData.vouchCount >= 3) {
    riskScore -= 10;
    factors.push('✅ Well-vouched by community');
  } else if (memberData.vouchCount === 0) {
    riskScore += 10;
    factors.push('⚠️ No community vouches');
  }

  // Circle participation
  if (memberData.totalCircles > 3) {
    riskScore += 5;
    factors.push('⚠️ Member of many circles');
  }

  // Determine risk level
  let riskLevel;
  if (riskScore < 30) riskLevel = 'low';
  else if (riskScore < 60) riskLevel = 'medium';
  else if (riskScore < 80) riskLevel = 'high';
  else riskLevel = 'critical';

  // Recommendation
  let recommendations;
  if (riskLevel === 'low') {
    recommendations = 'Approve - Member shows low risk indicators.';
  } else if (riskLevel === 'medium') {
    recommendations = 'Approve with monitoring - Member shows moderate risk. Require additional vouches.';
  } else {
    recommendations = 'Reject or require strong guarantees - Member shows high risk indicators.';
  }

  return {
    riskScore: Math.max(0, Math.min(100, riskScore)),
    riskLevel,
    factors,
    recommendations
  };
};

/**
 * Fallback rule-based fraud detection
 */
const ruleBasedFraudDetection = (userData) => {
  const suspiciousPatterns = [];
  let alertLevel = 'none';

  // Check for too many circles
  if (userData.circles.length > 5) {
    suspiciousPatterns.push('User is member of unusually high number of circles');
    alertLevel = 'medium';
  }

  // Check for payment patterns
  const recentFailures = userData.payments.filter(p => p.status === 'failed').length;
  if (recentFailures > userData.payments.length * 0.3) {
    suspiciousPatterns.push('High rate of failed payments');
    alertLevel = 'high';
  }

  return {
    isSuspicious: suspiciousPatterns.length > 0,
    confidenceLevel: suspiciousPatterns.length * 30,
    suspiciousPatterns: suspiciousPatterns.length > 0 ? suspiciousPatterns : ['No suspicious patterns detected'],
    recommendation: suspiciousPatterns.length > 0
      ? 'Monitor user activity closely'
      : 'No action required',
    alertLevel
  };
};
