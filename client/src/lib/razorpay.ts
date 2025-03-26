import { apiRequest } from "./queryClient";

// Function to load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface RazorpayOptions {
  amount: number; // in paise (Indian currency)
  currency: string;
  name: string;
  description: string;
  orderId?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

interface PaymentResponse {
  paymentId: string;
  status: string;
}

export const initiateRazorpayPayment = async (
  options: RazorpayOptions,
  userId: number,
  printJobId?: number
): Promise<PaymentResponse> => {
  // Check if Razorpay is loaded
  if (typeof window.Razorpay === 'undefined') {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error("Failed to load Razorpay SDK");
    }
  }

  // Create a payment record in our system first
  const paymentResponse = await apiRequest('POST', '/api/payments', {
    userId,
    printJobId,
    amount: options.amount / 100, // Convert from paise to rupees
    currency: options.currency,
    status: 'pending'
  });
  
  const paymentData = await paymentResponse.json();
  if (!paymentData.success) {
    throw new Error(paymentData.error || 'Failed to create payment record');
  }
  
  const paymentId = paymentData.data.id;

  return new Promise((resolve, reject) => {
    // Configure Razorpay
    const razorpay = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || '', // API key to be provided later
      ...options,
      theme: {
        color: '#000000', // Black theme color
        ...options.theme
      },
      handler: async function(response: any) {
        try {
          // Update payment status in our system
          const updateResponse = await apiRequest('PUT', `/api/payments/${paymentId}`, {
            razorpayId: response.razorpay_payment_id,
            status: 'completed'
          });
          
          const updateData = await updateResponse.json();
          if (!updateData.success) {
            throw new Error(updateData.error || 'Failed to update payment status');
          }
          
          resolve({
            paymentId: response.razorpay_payment_id,
            status: 'success'
          });
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: async function() {
          try {
            // Update payment status as cancelled in our system
            await apiRequest('PUT', `/api/payments/${paymentId}`, {
              status: 'cancelled'
            });
            
            resolve({
              paymentId: '',
              status: 'cancelled'
            });
          } catch (error) {
            reject(error);
          }
        }
      }
    });

    razorpay.open();
  });
};

declare global {
  interface Window {
    Razorpay: any;
  }
}
