import api from '../api';

const sdkPromises = new Map();

const SANDBOX_FALLBACK_CONFIG = {
  clientId: 'sb',
  currency: 'USD',
  useServer: false
};

export async function getPayPalCheckoutConfig() {
  try {
    const { data } = await api.get('/payments/paypal/config', {
      skipAuth: true
    });

    if (data.enabled && data.clientId) {
      return {
        clientId: data.clientId,
        currency: data.currency || 'USD',
        useServer: true
      };
    }
  } catch (error) {
    if (error?.response?.status !== 404) {
      console.warn('PayPal server checkout is unavailable; using Sandbox SDK fallback.');
    }
  }

  return SANDBOX_FALLBACK_CONFIG;
}

export function loadPayPalSdk(clientId, currency) {
  const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons,card-fields`;

  if (window.paypal?.Buttons && window.paypal?.CardFields) {
    return Promise.resolve(window.paypal);
  }

  document.querySelectorAll('script[data-paypal-sdk="hirely-sandbox"]').forEach((script) => {
    script.remove();
  });
  delete window.paypal;

  if (!sdkPromises.has(sdkUrl)) {
    sdkPromises.set(sdkUrl, new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = sdkUrl;
      script.async = true;
      script.dataset.paypalSdk = 'hirely-sandbox';
      script.onload = () => resolve(window.paypal);
      script.onerror = () => reject(new Error('Unable to load PayPal Checkout.'));
      document.head.appendChild(script);
    }));
  }

  return sdkPromises.get(sdkUrl);
}

export async function createProfessionalOrder(config, actions) {
  if (!config.useServer) {
    return actions.order.create({
      purchase_units: [
        {
          reference_id: 'hirely-professional-monthly',
          description: 'Hirely Professional - 1 month',
          amount: {
            currency_code: 'USD',
            value: '49.00'
          }
        }
      ],
      application_context: {
        brand_name: 'Hirely',
        user_action: 'PAY_NOW'
      }
    });
  }

  const { data } = await api.post('/payments/paypal/orders', {}, {
    skipAuth: true
  });
  return data.orderId;
}

export async function captureProfessionalOrder(config, orderId, actions) {
  if (!config.useServer) {
    return actions.order.capture();
  }

  const { data } = await api.post(
    `/payments/paypal/orders/${encodeURIComponent(orderId)}/capture`,
    {},
    { skipAuth: true }
  );
  return data;
}
