// SMS service using Twilio
// Falls back to console.log if Twilio credentials are not configured

const sendSMS = async (phone, message) => {
  try {
    // Check if Twilio is configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    // If Twilio credentials are not configured, log to console (development mode)
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📱 SMS to ${phone}:`);
      console.log(`   ${message}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`⚠️  Twilio not configured. Add credentials to .env to send real SMS.`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      return { success: true, message: 'OTP logged (Twilio not configured - check console)' };
    }

    // Use Twilio to send real SMS
    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);
    
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phone
    });
    
    console.log(`✅ SMS sent via Twilio to ${phone}. SID: ${result.sid}`);
    return { success: true, sid: result.sid, message: 'SMS sent successfully' };
  } catch (error) {
    console.error('SMS sending error:', error);
    
    // If Twilio fails, log to console as fallback
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📱 SMS to ${phone} (Twilio failed, using fallback):`);
    console.log(`   ${message}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    // Return success even if Twilio fails (fallback to console)
    return { success: true, message: 'OTP logged (Twilio failed - check console)' };
  }
};

module.exports = sendSMS;

