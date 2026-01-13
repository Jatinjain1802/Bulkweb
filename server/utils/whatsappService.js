

export const sendWhatsappMessage = async (to, templateName, languageCode, components) => {
  const { META_ACCESS_TOKEN, META_PHONE_NUMBER_ID, META_VERSION = 'v18.0' } = process.env;

  if (!META_ACCESS_TOKEN || !META_PHONE_NUMBER_ID) {
    console.warn("Meta credentials missing (Token or Phone Number ID). Mocking send.");
    return { id: `mock_${Date.now()}` }; 
  }

  const url = `https://graph.facebook.com/${META_VERSION}/${META_PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: "whatsapp",
    to: to,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: languageCode || "en_US"
      },
      components: components
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${META_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || "Unknown Meta API Error";
      throw new Error(errorMsg);
    }

    return data.messages?.[0]; // Returns { id: "..." }
  } catch (error) {
    throw error;
  }
};

export const sendMessage = async (to, textBody) => {
  const { META_ACCESS_TOKEN, META_PHONE_NUMBER_ID, META_VERSION = 'v18.0' } = process.env;

  if (!META_ACCESS_TOKEN || !META_PHONE_NUMBER_ID) {
    console.warn("Meta credentials missing. Mocking text message send.");
    return { messages: [{ id: `mock_text_${Date.now()}` }] };
  }

  const url = `https://graph.facebook.com/${META_VERSION}/${META_PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: "whatsapp",
    to: to,
    type: "text",
    text: {
      body: textBody
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${META_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Meta API sends error:", JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || "Meta API Error");
    }

    return data; 
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
};
