import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    title: "Campus Complaint System",
    subtitle: "Real-time support & complaint resolution portal",
    vignanTitle: "Vignan's Institute of Information Technology",
    home: "Home",
    dashboard: "Dashboard",
    history: "History",
    notifications: "Notifications",
    profile: "Profile",
    reports: "Reports",
    settings: "Settings",
    about: "About Us",
    contact: "Contact",
    logout: "Log Out",
    welcome: "Welcome back",
    newComplaint: "File New Complaint",
    viewComplaints: "View Complaints",
    recentComplaints: "Recent Complaints",
    totalComplaints: "Total Complaints",
    pending: "Pending",
    resolved: "Resolved",
    underReview: "Under Review",
    rejected: "Rejected",
    inProgress: "In Progress",
    assigned: "Assigned",
    priority: "Priority",
    status: "Status",
    category: "Category",
    action: "Action",
    submit: "Submit",
    loading: "Loading data...",
    anonymous: "Submit Anonymously",
    voiceInput: "Tap to Speak",
    location: "Incident Location",
    imageUpload: "Upload Image (JPG/PNG)",
    docUpload: "Upload Document (PDF)",
    details: "Complaint Details",
    timeline: "Complaint Timeline",
    rating: "Rate Resolution Quality",
    feedback: "Your Feedback",
    search: "Search complaints..."
  },
  hi: {
    title: "परिसर शिकायत प्रणाली",
    subtitle: "वास्तविक समय सहायता और शिकायत निवारण पोर्टल",
    vignanTitle: "विज्ञान इंस्टीट्यूट ऑफ इंफॉर्मेशन टेक्नोलॉजी",
    home: "होम",
    dashboard: "डैशबोर्ड",
    history: "इतिहास",
    notifications: "सूचनाएं",
    profile: "प्रोफ़ाइल",
    reports: "रिपोर्ट",
    settings: "सेटिंग्स",
    about: "हमारे बारे में",
    contact: "संपर्क करें",
    logout: "लॉग आउट",
    welcome: "आपका स्वागत है",
    newComplaint: "नई शिकायत दर्ज करें",
    viewComplaints: "शिकायतें देखें",
    recentComplaints: "हाल की शिकायतें",
    totalComplaints: "कुल शिकायतें",
    pending: "लंबित",
    resolved: "समाधान किया गया",
    underReview: "समीक्षा के अधीन",
    rejected: "अस्वीकृत",
    inProgress: "प्रगति पर",
    assigned: "सॉन्पा गया",
    priority: "प्राथमिकता",
    status: "स्थिति",
    category: "श्रेणी",
    action: "कार्रवाई",
    submit: "जमा करें",
    loading: "डेटा लोड हो रहा है...",
    anonymous: "गुमनाम रूप से जमा करें",
    voiceInput: "बोलने के लिए टैप करें",
    location: "घटना स्थल",
    imageUpload: "छवि अपलोड करें (JPG/PNG)",
    docUpload: "दस्तावेज़ अपलोड करें (PDF)",
    details: "शिकायत का विवरण",
    timeline: "शिकायत की समयरेखा",
    rating: "निवारण गुणवत्ता का मूल्यांकन करें",
    feedback: "आपकी प्रतिक्रिया",
    search: "शिकायतों की खोज करें..."
  },
  te: {
    title: "క్యాంపస్ ఫిర్యాదుల వ్యవస్థ",
    subtitle: "నిజ-సమయ సహాయం & ఫిర్యాదుల పరిష్కార పోర్టల్",
    vignanTitle: "విజ్ఞాన్ ఇన్స్టిట్యూట్ ఆఫ్ ఇన్ఫర్మేషన్ టెక్నాలజీ",
    home: "హోమ్",
    dashboard: "డ్యాష్‌బోర్డ్",
    history: "చరిత్ర",
    notifications: "నోటిఫికేషన్లు",
    profile: "ప్రొఫైల్",
    reports: "నివేదికలు",
    settings: "సెట్టింగులు",
    about: "మా గురించి",
    contact: "సంప్రదించండి",
    logout: "లాగ్ అవుట్",
    welcome: "స్వాగతం",
    newComplaint: "కొత్త ఫిర్యాదు చేయండి",
    viewComplaints: "ఫిర్యాదులను చూడండి",
    recentComplaints: "ఇటీవలి ఫిర్యాదులు",
    totalComplaints: "మొత్తం ఫిర్యాదులు",
    pending: "పెండింగ్",
    resolved: "పరిష్కరించబడింది",
    underReview: "సమీక్షలో ఉంది",
    rejected: "తిరస్కరించబడింది",
    inProgress: "పురోగతిలో ఉంది",
    assigned: "కేటాయించబడింది",
    priority: "ప్రాధాన్యత",
    status: "స్థితి",
    category: "వర్గం",
    action: "చర్య",
    submit: "సమర్పించు",
    loading: "డేటా లోడ్ అవుతోంది...",
    anonymous: "అజ్ఞాతంగా సమర్పించు",
    voiceInput: "మాట్లాడటానికి నొక్కండి",
    location: "సంఘటన స్థలం",
    imageUpload: "చిత్రాన్ని అప్‌లోడ్ చేయి (JPG/PNG)",
    docUpload: "పత్రాన్ని అప్‌లోడ్ చేయి (PDF)",
    details: "ఫిర్యాదు వివరాలు",
    timeline: "ఫిర్యాదు టైమ్‌లైన్",
    rating: "పరిష్కార నాణ్యతను రేట్ చేయండి",
    feedback: "మీ అభిప్రాయం",
    search: "ఫిర్యాదులను శోధించండి..."
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('vignan-locale') || 'en';
  });

  const t = (key) => {
    return translations[locale]?.[key] || translations['en']?.[key] || key;
  };

  const changeLanguage = (lang) => {
    setLocale(lang);
    localStorage.setItem('vignan-locale', lang);
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export { translations };
