# Scalability & Performance Analysis: Large CSV Uploads (10k-50k Records)

## 🚨 Executive Summary

**Current Status:** The system will **NOT** work properly with 10,000 - 50,000 records in its current state.
**Result:** The upload will likely fail immediately, or the sending process will be extremely slow and unreliable (prone to data loss if the server restarts).

---

## 🛑 Critical Issues preventing 50k uploads

### 1. Payload Size Limit (Immediate Failure)

- **The Problem:** Your server (`server/index.js`) uses `app.use(express.json())` without options. The default limit is **100kb**.
- **The Math:** A list of 50,000 contacts (Name + Phone) will be approximately **3MB - 5MB**.
- **The Result:** The moment you click "Launch Campaign", the server will reject the request with a `413 Payload Too Large` error. It won't even start processing.
- **Fix Required:** Increase the limit in `index.js` (e.g., `express.json({ limit: '50mb' })`).

### 2. Database Insertion Bottlenecks

- **The Problem:** The code attempts to insert all 50,000 valid contacts into the database in a **single query** (`ContactModel.upsertMany`).
- **The Result:**
  - This generates a massive SQL/Mongo query.
  - It may exceed the database's "max packet size" or "max query size".
  - The request from the browser will hang while the DB processes this. If it takes longer than ~2 minutes, the browser (or Nginx/Cloudflare) will likely time out and show a "Network Error", even if the server is still working.

### 3. Lack of a Persistent Queue (Reliability Risk)

- **The Problem:** The sending logic (`server/controllers/campaignController.js`) runs in an in-memory loop effectively.
  ```javascript
  (async () => {
      for (const contact of validContacts) {
           await sendWhatsappMessage(...)
      }
  })();
  ```
- **The Risk:**
  - Sending 50k messages sequentially takes time (see below).
  - **If the server restarts, crashes, or is redeployed during this time, ALL unsent messages are lost.**
  - There is no record in the database of which ones are "pending" vs "queued". You just have a loop running in RAM.

### 4. Sending Speed (Slow Performance)

- **The Problem:** The code sends messages **sequentially** (one by one).
- **The Math:**
  - Meta API call latency: ~0.3 seconds per message.
  - 50,000 messages \* 0.3s = 15,000 seconds.
  - **Total Time:** ~4 hours to finish a campaign.
- **The Fix:** You need concurrency (sending 5-10 messages in parallel) to reduce this to ~30-45 minutes.

### 5. Browser/Client Performance

- **The Problem:** The React code loads the entire Excel file into the browser's memory and stores it in a state variable (`contacts`).
- **The Result:**
  - For 50,000 rows, the browser might become sluggish or freeze for a few seconds during parsing.
  - Sending a 5MB JSON payload from the browser is generally okay, but poor network connections might fail.

---

## ✅ What WILL Work

- **Small Batches:** Uploading CSVs with **100 - 1,000 records** should work fine (once the 100kb limit is fixed).
- **Parsing:** The XLSX library is robust enough to parse 50k rows in the browser (might lag briefly).

---

## 🛠 Recommended Implementation Roadmap

To support 50k users reliably, we need to make the following changes:

### Phase 1: Quick Fixes (Enables ~5k uploads)

1.  **Increase Server Body Limit:**
    ```javascript
    // server/index.js
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    ```
2.  **Batch Database Inserts:**
    Modify `campaignController.js` to insert contacts in chunks of 1,000 instead of all at once.

### Phase 2: Robustness (Enables 50k+ uploads)

1.  **Use a Job Queue (files/Redis):**
    Instead of a `for` loop, push 50k jobs into a queue (e.g., BullMQ). This ensures that if the server restarts, the queue resumes where it left off.
2.  **Throttling/Concurrency:**
    Process 5-10 jobs at a time to speed up delivery while respecting Meta's rate limits.
3.  **Background Processing:**
    The API should return "Campaign Queued" immediately. The client should poll for progress.

---

### Conclusion

**Do not upload 50k files yet.** Start detailed testing with 500 records. Once we apply the "Quick Fixes", you can try 2,000-5,000. For 50k, we need the "Phase 2" architecture.
