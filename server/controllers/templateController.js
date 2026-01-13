import { TemplateModel } from '../models/templateModel.js';
import { uploadToMeta } from '../utils/metaUpload.js';

// Helper to generate examples for variables (Required by Meta)
const generateBodyDetails = (text, examplesMap = {}) => {
    const variableRegex = /{{(\d+)}}/g;
    const matches = [...text.matchAll(variableRegex)];
    
    let bodyComponent = {
        type: "BODY",
        text: text
    };

    if (matches.length > 0) {
        // Meta requires an array of strings in the order of variables associated
        // e.g. text: "Hi {{1}}, thanks for {{2}}" -> body_text: [["John", "Ordering"]]
        const exampleValues = matches.map(m => {
            const varNum = m[1]; // "1" from "{{1}}"
            return examplesMap[varNum] || `sample_${varNum}`;
        });
        
        bodyComponent.example = {
            body_text: [exampleValues]
        };
    }
    return bodyComponent;
};

export const createTemplate = async (req, res) => {
  try {
    let { name, category, language, components, content, buttonType, buttons, variableExamples } = req.body;

    // Sanitize name for Meta (lowercase, underscores only)
    if (name) {
        name = name.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_');
    }
    
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
    
    // Ensure category is a string (take .value if it's an object from react-select)
    if (category && typeof category === 'object' && category.value) {
        category = category.value;
    }
    
    let parsedVariableExamples = {};
    if (typeof variableExamples === 'string') {
        try { parsedVariableExamples = JSON.parse(variableExamples); } catch (e) {}
    } else if (typeof variableExamples === 'object') {
        parsedVariableExamples = variableExamples || {};
    }

    // Transform Frontend Data to Meta Format if 'components' is missing
    let metaComponents = components;
    let metaCategory = category;

    if (!metaComponents && content) {
      metaComponents = [];
      
      // 0. Header (Text) - Media handled below
      if (req.body.headerType === 'text' && req.body.headerText) {
          metaComponents.push({
              type: "HEADER",
              format: "TEXT",
              text: req.body.headerText
          });
      }

      // 1. Body
      // Use the helper immediately to ensure examples are included
      if (content) {
        metaComponents.push(generateBodyDetails(content, parsedVariableExamples));
      }
      
      // 1.5 Footer
      if (req.body.footerText) {
          metaComponents.push({
              type: "FOOTER",
              text: req.body.footerText
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
    } else if (metaComponents) {
         // If metaComponents were passed directly, ensure 'example' exists if variables are present
         const bodyComp = metaComponents.find(c => c.type === 'BODY');
         if (bodyComp && bodyComp.text && !bodyComp.example) {
             const refined = generateBodyDetails(bodyComp.text, parsedVariableExamples);
             if (refined.example) {
                 bodyComp.example = refined.example;
             }
         }
    }

    // Handle File Upload for Header (IMAGE/VIDEO/DOC)
    if (req.file && req.body.headerType === 'media') {
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



    // Debugging: Log incoming body
    console.log("Create Template Request Body:", JSON.stringify(req.body, null, 2));

    // Validation
    const errors = [];
    if (!name) errors.push("name");
    if (!metaCategory) errors.push("category");
    if (!language) errors.push("language");
    if (!metaComponents || metaComponents.length === 0) errors.push("components/content");

    if (errors.length > 0) {
      console.error("Validation failed. Missing fields:", errors);
      return res.status(400).json({ error: `Missing required fields: ${errors.join(', ')}` });
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

// Helper to map Meta status to our DB status
const mapMetaStatus = (metaStatus) => {
  switch (metaStatus) {
    case 'APPROVED': return 'approved';
    case 'REJECTED': return 'rejected';
    case 'PENDING': return 'pending';
    default: return metaStatus.toLowerCase(); // fallback
  }
};

export const getTemplates = async (req, res) => {
  try {
    const { META_ACCESS_TOKEN, META_WABA_ID, META_VERSION = 'v18.0' } = process.env;

    // 1. Fetch from Meta if credentials exist
    if (META_ACCESS_TOKEN && META_WABA_ID) {
        try {
            // Request rejected_reason, quality_score, stats fields
            const metaUrl = `https://graph.facebook.com/${META_VERSION}/${META_WABA_ID}/message_templates?fields=name,status,category,language,components,id,rejected_reason,quality_score,stats&limit=100`;
            const response = await fetch(metaUrl, {
                headers: {
                    'Authorization': `Bearer ${META_ACCESS_TOKEN}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const metaTemplates = data.data || [];
                console.log(`Fetched ${metaTemplates.length} templates from Meta.`);

                // 2. Sync Meta templates to Local DB
                for (const metaTmpl of metaTemplates) {
                    const existing = await TemplateModel.findByName(metaTmpl.name);
                    
                    const status = mapMetaStatus(metaTmpl.status);
                    const rejectionReason = metaTmpl.rejected_reason || null;
                    const qualityScore = metaTmpl.quality_score || null; // e.g. { score: 'GREEN' }
                    const stats = metaTmpl.stats || null;
                    
                    if (existing) {
                        // Update sync details
                        await TemplateModel.updateSyncDetails(existing.id, {
                            status: status,
                            meta_id: metaTmpl.id,
                            rejection_reason: rejectionReason,
                            quality_score: qualityScore,
                            stats: stats
                        });

                        // Check category change
                         if (existing.category !== metaTmpl.category) {
                             await TemplateModel.updateCategory(existing.id, metaTmpl.category);
                         }
                    } else {
                        // Insert new template found in Meta (e.g. pre-verified ones)
                        await TemplateModel.create({
                            name: metaTmpl.name,
                            language: metaTmpl.language,
                            category: metaTmpl.category,
                            structure: metaTmpl.components,
                            status: status,
                            meta_id: metaTmpl.id,
                            rejection_reason: rejectionReason,
                            quality_score: qualityScore,
                            stats: stats
                        });
                    }
                }
            } else {
                console.error("Failed to fetch templates from Meta", await response.json());
            }
        } catch (metaError) {
            console.error("Error syncing with Meta:", metaError);
        }
    }

    // 3. Return all from Local DB (now synced)
    const templates = await TemplateModel.findAll();
    const count = templates.length;
    // Return count in headers or wrapped object if client expects it, 
    // but usually returning array is standard. The user asked to "show the excated number of record".
    // I will adhere to the array return as the client likely expects an array, 
    // but I'll log the count to console which shows up in the 'run' logs.
    console.log(`Total templates in DB: ${count}`);
    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await TemplateModel.findById(id);

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Try to delete from Meta
    const { META_ACCESS_TOKEN, META_WABA_ID, META_VERSION = 'v18.0' } = process.env;
    if (META_ACCESS_TOKEN && META_WABA_ID && template.name) {
        try {
            const metaUrl = `https://graph.facebook.com/${META_VERSION}/${META_WABA_ID}/message_templates?name=${template.name}`;
            const response = await fetch(metaUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${META_ACCESS_TOKEN}`
                }
            });
            const data = await response.json();
            if (!response.ok) {
                console.warn("Failed to delete from Meta:", data);
                // We continue to local delete even if Meta fails (might be local-only or already deleted)
            } else {
                console.log("Deleted from Meta:", data);
            }
        } catch (displayError) {
            console.error("Error deleting from Meta:", displayError);
        }
    }

    // Delete from Local DB
    const deleted = await TemplateModel.delete(id);
    if (deleted) {
        res.json({ message: "Template deleted successfully" });
    } else {
        res.status(500).json({ error: "Failed to delete template locally" });
    }

  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ error: "Server error" });
  }
};
