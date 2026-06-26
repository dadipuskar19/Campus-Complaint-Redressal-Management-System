const { GoogleGenAI } = require('@google/generative-ai');

/**
 * Perform keyword-based local NLP fallback if no Gemini key is provided.
 */
function localAnalyze(title, description, existingComplaints = []) {
  const text = `${title} ${description}`.toLowerCase();
  
  // 1. Categorization
  let category = 'Others';
  const categoriesMap = {
    'WiFi': ['wifi', 'wi-fi', 'internet', 'network', 'router', 'connection', 'signal', 'ethernet'],
    'Cafeteria': ['food', 'cafeteria', 'canteen', 'lunch', 'mess', 'dinner', 'plate', 'snack'],
    'Hostel': ['hostel', 'room', 'warden', 'accommodation', 'dorm', 'hostel room', 'bed'],
    'Transport': ['bus', 'transport', 'route', 'driver', 'college bus', 'parking', 'pickup'],
    'Library': ['library', 'book', 'fine', 'issue', 'journal', 'reading room', 'librarian'],
    'Examination': ['exam', 'marks', 'grade', 'results', 'hall ticket', 'evaluation', 'revaluation'],
    'Fees': ['fee', 'payment', 'challan', 'scholarship', 'fine', 'receipt', 'tuition'],
    'Placement Cell': ['placement', 'job', 'interview', 'recruitment', 'career', 'resume', 'internship'],
    'Electrical': ['wire', 'light', 'electrical', 'fan', 'power', 'electricity', 'bulb', 'switch', 'ac', 'cooler'],
    'Water Supply': ['water', 'tap', 'drinking', 'leakage', 'leak', 'cooler water', 'tank'],
    'Cleaning': ['clean', 'sweep', 'dustbin', 'hygiene', 'washroom', 'toilet', 'garbage', 'litter', 'dirty'],
    'Security': ['security', 'guard', 'gate', 'id card', 'theft', 'lost', 'stolen', 'harassment', 'fight'],
    'Infrastructure': ['bench', 'desk', 'building', 'classroom', 'infrastructure', 'wall', 'door', 'window', 'projector', 'board'],
    'Academic': ['faculty', 'professor', 'class', 'lecture', 'syllabus', 'attendance', 'lab', 'assignment', 'course']
  };

  for (const [cat, keywords] of Object.entries(categoriesMap)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      category = cat;
      break;
    }
  }

  // 2. Priority Recommendation
  let priority = 'Low';
  const emergencyKeywords = ['fire', 'danger', 'shock', 'injury', 'medical', 'accident', 'theft', 'harassment', 'stolen', 'wire cut', 'short circuit'];
  const highKeywords = ['broken', 'leak', 'no network', 'cannot login', 'exam conflict', 'fees error', 'admit card missing', 'water outage', 'power cut'];
  const mediumKeywords = ['repair', 'slow', 'delay', 'missing', 'dirty', 'unclean', 'rude'];

  if (emergencyKeywords.some(kw => text.includes(kw))) {
    priority = 'Emergency';
  } else if (highKeywords.some(kw => text.includes(kw))) {
    priority = 'High';
  } else if (mediumKeywords.some(kw => text.includes(kw))) {
    priority = 'Medium';
  }

  // 3. Spam Detection
  let isSpam = false;
  let spamReason = '';
  const gibberishPatterns = [/^[asdfghjkl;qwertyuiopzxcvbnm\s]{1,8}$/i, /^(.)\1{4,}/]; // very short or repetitive letters (e.g. aaaaa)
  const profanities = ['abuse', 'fuck', 'shit', 'idiot', 'stupid', 'asshole'];
  
  if (description.trim().length < 10) {
    isSpam = true;
    spamReason = 'Complaint description is too short (minimum 10 characters required).';
  } else if (gibberishPatterns.some(pat => pat.test(description))) {
    isSpam = true;
    spamReason = 'Gibberish or highly repetitive text pattern detected.';
  } else if (profanities.some(prof => text.includes(prof))) {
    isSpam = true;
    spamReason = 'Inappropriate language or profanity detected.';
  }

  // 4. Sentiment Analysis
  const positiveWords = ['happy', 'good', 'satisfied', 'excellent', 'great', 'resolved', 'thanks', 'wonderful'];
  const negativeWords = ['bad', 'terrible', 'poor', 'broken', 'worst', 'unacceptable', 'furious', 'angry', 'irritating', 'delay', 'useless', 'slow', 'leak', 'outage'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  positiveWords.forEach(w => { if (text.includes(w)) positiveCount++; });
  negativeWords.forEach(w => { if (text.includes(w)) negativeCount++; });

  let sentiment = 'Neutral';
  let sentimentScore = 0.5; // Scale 0 to 1
  if (positiveCount > negativeCount) {
    sentiment = 'Positive';
    sentimentScore = 0.8;
  } else if (negativeCount > positiveCount) {
    sentiment = 'Negative';
    sentimentScore = 0.2;
  }

  // 5. Summary Generation
  const summary = description.length > 80 
    ? `${description.substring(0, 77)}...`
    : description;

  // 6. Duplicate Detection
  let duplicateOf = null;
  for (const comp of existingComplaints) {
    // Simple jaccard word similarity on titles
    const w1 = new Set(title.toLowerCase().split(/\s+/));
    const w2 = new Set(comp.title.toLowerCase().split(/\s+/));
    const intersection = new Set([...w1].filter(x => w2.has(x)));
    const union = new Set([...w1, ...w2]);
    const similarity = intersection.size / union.size;

    if (similarity > 0.6) {
      duplicateOf = {
        complaintId: comp.complaintId,
        title: comp.title,
        status: comp.status,
        similarity: Math.round(similarity * 100)
      };
      break;
    }
  }

  // 7. Auto response
  const autoResponse = `Dear Student, thank you for raising this issue regarding "${title}". We have auto-categorized this under "${category}" with "${priority}" priority and notified the respective department head. We aim to resolve this as soon as possible.`;

  return {
    category,
    priority,
    summary,
    isSpam,
    spamReason,
    sentiment,
    sentimentScore,
    duplicateOf,
    autoResponse,
    isLocalFallback: true
  };
}

/**
 * Main AI Analyzer Service using Gemini 1.5 or 2.5 API with offline fallback.
 */
const aiService = {
  analyzeComplaint: async (title, description, existingComplaints = []) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Offline fallback
      return localAnalyze(title, description, existingComplaints);
    }

    try {
      // Gemini initialization
      const ai = new GoogleGenAI({ apiKey });
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Construct duplicate options list for prompt context
      const existingListStr = existingComplaints.map(c => `ID: ${c.complaintId}, Title: ${c.title}`).join('\n');

      const prompt = `
        You are an AI assistant for a College Campus Complaint System.
        Analyze the following student complaint details:
        Title: "${title}"
        Description: "${description}"

        Existing Complaints in the system:
        ${existingListStr || 'None'}

        Perform the following:
        1. Categorize it into one of these: Academic, Hostel, Transport, Library, Examination, Fees, Placement Cell, WiFi, Electrical, Water Supply, Cleaning, Cafeteria, Security, Infrastructure, Others.
        2. Suggest priority: Low, Medium, High, Emergency.
        3. Generate a concise 1-sentence summary (max 100 characters).
        4. Perform spam detection: flag as true if it's gibberish, highly repetitive, extremely short, or uses explicit abuse. Mention a brief reason.
        5. Sentiment analysis: Positive, Neutral, or Negative, along with a score between 0.0 (very negative) and 1.0 (very positive).
        6. Duplicate check: Check if it resembles any of the existing complaints. If a similarity (>60%) is found, identify the matching ID and similarity percentage.
        7. Generate a professional auto-response to the student acknowledging the issue.

        Format your final response strictly as a JSON object with keys:
        {
          "category": "String",
          "priority": "String",
          "summary": "String",
          "isSpam": boolean,
          "spamReason": "String",
          "sentiment": "String",
          "sentimentScore": number,
          "duplicateOf": { "complaintId": "String", "title": "String", "similarity": number } or null,
          "autoResponse": "String"
        }
      `;

      // Set up a promise race to timeout if Google AI takes too long
      const apiCallPromise = model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API call timed out after 4000ms')), 4000)
      );

      const result = await Promise.race([apiCallPromise, timeoutPromise]);
      const responseText = result.response.text();
      
      // Extract JSON structure in case model output is wrapped in Markdown
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = responseText.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonStr);
        return {
          ...parsed,
          isLocalFallback: false
        };
      }
      throw new Error("Could not parse JSON from Gemini response");

    } catch (err) {
      console.error("[AI Service] Gemini Error, using fallback engine:", err.message);
      return localAnalyze(title, description, existingComplaints);
    }
  }
};

module.exports = aiService;
