// utils/sendSMS.ts
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Sends an SMS using SMSGatewayHub
 * @param phone - Recipient phone number (format: 91XXXXXXXXXX)
 * @param message - Message text to send
 * @returns Promise resolving with SMS API response
 */
// export const sendSMS = async (phone: string, message: string) => {
//   try {
//     const response = await axios.get(
//       "https://www.smsgatewayhub.com/api/mt/SendSMS",
//       {
//         params: {
//           APIKey: process.env.SMS_API_KEY, // Your SMS Gateway Hub API key
//           senderid: process.env.SMS_SENDER_ID, // Approved sender ID (like TESTIN)
//           channel: 2, // 2 = transactional SMS
//           DCS: 0,
//           flashsms: 0,
//           number: phone,
//           text: message,
//           route: 1,
//         },
//       }
//     );

//     return response.data;
//   } catch (error: any) {
//     console.error("SMS sending error:", error.response?.data || error.message);
//     throw new Error("Failed to send SMS");
//   }
// };




export const sendSMS = async (
  phone: string,
  message: string
): Promise<boolean> => {
  try {
    const encodedMessage = encodeURIComponent(message);

    const url =
      `https://www.smsgatewayhub.com/api/mt/SendSMS?` +
      `APIKey=${process.env.SMS_API_KEY}` +
      `&senderid=${process.env.SMS_SENDER_ID}` +
      `&channel=2&DCS=0&flashsms=0` +
      `&number=91${phone}` +
      `&text=${encodedMessage}` +
      `&route=1` +
      `&EntityId=${process.env.SMS_ENTITY_ID}` +
      `&dlttemplateid=${process.env.SMS_TEMPLATE_ID}`;

    const response = await axios.post(url, null, {
      headers: { "Content-Type": "application/json" },
    });

    const { ErrorCode, ErrorMessage } = response.data;

    if (ErrorCode === "000") {
      console.log("✅ SMS sent successfully:", response.data);
      return true;
    } else {
      console.error("❌ SMS sending failed:", response.data);
      return false;
    }
  } catch (error: any) {
    console.error("❗ SMS sending exception:", error.message);
    return false;
  }
};