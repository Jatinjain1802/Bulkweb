import { TemplateModel } from '../models/templateModel.js';
import { uploadToMeta } from '../utils/metaUpload.js';

export const createTemplate = async (req, res) => {
  try {
    let { name, category, language, components, content, buttonType, buttons } = req.body;
    
    // Parse JSON strings if they were sent as form-data strings (common with file uploads)
    if (typeof components === 'string') {
        try { components = JSON.parse(components); } catch (e) {}
    }
    if (typeof buttons === 'string') {
        try { buttons = JSON.parse(buttons); } catch (e) {}
    }
    // category might be an object stringified
    if (typeof category === 'string' && category.startsWith('{')) {
         try { category = JSON.parse(category); } catch (e) {}
    }

    // Transform Frontend Data to Meta Format if 'components' is missing
    let metaComponents = components;
    let metaCategory = category;

    if (!metaComponents && content) {
      metaComponents = [];
      
      // 1. Body
      if (content) {
        metaComponents.push({
          type: "BODY",
          text: content
        });
      }

      // 2. Buttons
      if (buttonType && buttonType !== 'none' && buttons && buttons.length > 0) {
        const metaButtons = buttons.map(btn => {
          if (buttonType === 'quick_reply') {
            return {
              type: "QUICK_REPLY",
              text: btn.text
            };
          } else {
            // Call to Action
            if (btn.type === 'url') {
              return {
                type: "URL",
                text: btn.text,
                url: btn.value
              };
            } else if (btn.type === 'phone') {
              return {
                type: "PHONE_NUMBER",
                text: btn.text,
                phone_number: btn.value
              };
            }
          }
          return null;
        }).filter(Boolean);

        if (metaButtons.length > 0) {
          metaComponents.push({
            type: "BUTTONS",
            buttons: metaButtons
          });
        }
      }
    }

    // Handle File Upload for Header
    if (req.file) {
        try {
            const handle = await uploadToMeta(req.file);
            let headerType = 'IMAGE';
            if (req.file.mimetype.startsWith('video')) headerType = 'VIDEO';
            else if (req.file.mimetype === 'application/pdf') headerType = 'DOCUMENT';
            
            // Add Header Component
            // Check if header already exists
            const existingHeaderIndex = metaComponents.findIndex(c => c.type === 'HEADER');
            const headerComponent = {
                type: "HEADER",
                format: headerType,
                example: {
                    header_handle: [handle]
                }
            };

            if (existingHeaderIndex !== -1) {
                metaComponents[existingHeaderIndex] = headerComponent;
            } else {
                metaComponents.unshift(headerComponent);
            }
        } catch (uploadError) {
            console.error("Media upload failed:", uploadError);
            return res.status(500).json({ error: "Failed to upload media to Meta", details: uploadError.message });
        }
    }
    
    // specific category formatting (Meta requires UPPERCASE)
    if (typeof category === 'object' && category?.value) {
        metaCategory = category.value;
    }
    // handle edge case where category is just the string label from frontend
    if (typeof category === 'string') {
       metaCategory = category; 
    }
    
    if (metaCategory) {
        metaCategory = metaCategory.toUpperCase();
    }

    // Validation
    if (!name || !metaCategory || !language || !metaComponents) {
      return res.status(400).json({ error: "Missing required fields: name, category, language, components (or content)" });
    }

    // 1. Save to local DB first (status: local_pending)
    const templateId = await TemplateModel.create({
      name,
      language,
      category: metaCategory,
      structure: metaComponents,
      status: 'local_pending'
    });

    // 2. Call Meta API
    const { META_ACCESS_TOKEN, META_WABA_ID, META_VERSION = 'v18.0' } = process.env;
    
    // If credentials missing, treat as local-only (or dev mode)
    if (!META_ACCESS_TOKEN || !META_WABA_ID) {
       console.warn("Meta credentials (META_ACCESS_TOKEN or META_WABA_ID) missing. Template created locally only.");
       // Update status to 'local_only' to indicate it wasn't sent
       await TemplateModel.updateStatus(templateId, 'local_only');
       return res.status(201).json({ message: "Template created locally (Meta credentials missing)", id: templateId, local: true });
    }

    const metaUrl = `https://graph.facebook.com/${META_VERSION}/${META_WABA_ID}/message_templates`;
    
    // Helper to generate examples for variables (Required by Meta)
    const generateBodyDetails = (text) => {
        const variableRegex = /{{(\d+)}}/g;
        const matches = [...text.matchAll(variableRegex)];
        
        let bodyComponent = {
            type: "BODY",
            text: text
        };

        if (matches.length > 0) {
            // Create dummy examples for each variable found
            // Meta requires an array of arrays: [["Example 1", "Example 2"]]
            const examples = matches.map((_, index) => `sample_${index + 1}`);
            bodyComponent.example = {
                body_text: [examples]
            };
        }
        return bodyComponent;
    };

    // Refine the manual construction if needed
    if (!components && content) {
        // We already pushed a simple BODY in the previous block, let's replace it with the smarter one
        // Find if we already added a BODY
        const bodyIndex = metaComponents.findIndex(c => c.type === 'BODY');
        if (bodyIndex !== -1) {
             metaComponents[bodyIndex] = generateBodyDetails(content);
        } else {
             // Should verify the previous logic didn't fail to add it
             metaComponents.unshift(generateBodyDetails(content));
        }
    } else if (metaComponents) {
        // If metaComponents were passed directly, we should still ensure 'example' exists if variables are present
        // This is a safety/convenience step for the user
        const bodyComp = metaComponents.find(c => c.type === 'BODY');
        if (bodyComp && bodyComp.text && !bodyComp.example) {
            const refined = generateBodyDetails(bodyComp.text);
            if (refined.example) {
                bodyComp.example = refined.example;
            }
        }
    }

    const metaPayload = {
      name,
      category: metaCategory,
      language: language || 'en_US', // Default to en_US if missing
      components: metaComponents
    };

    const response = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metaPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Meta API Error:", data);
      await TemplateModel.updateStatus(templateId, 'failed_meta');
      return res.status(response.status).json({ error: "Failed to create template on Meta", details: data });
    }

    // 3. Update local DB with Meta ID and status
    // The response from Meta creation usually contains 'id' (the template ID)
    await TemplateModel.updateStatus(templateId, 'submitted', data.id);

    res.status(201).json({ message: "Template created successfully on Meta", id: templateId, metaId: data.id });

  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const templates = await TemplateModel.findAll();
    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Server error" });
  }
};
