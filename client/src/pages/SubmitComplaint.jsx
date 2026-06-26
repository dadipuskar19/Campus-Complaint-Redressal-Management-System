import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  FileText, Sparkles, Mic, MicOff, Upload, FilePlus, 
  MapPin, EyeOff, AlertCircle, Info, CheckCircle2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SubmitComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Auto');
  const [priority, setPriority] = useState('Auto');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [image, setImage] = useState('');
  const [document, setDocument] = useState('');

  // Status & UI States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  // AI Suggestions Popup after submit
  const [aiResult, setAiResult] = useState(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setDescription(prev => (prev ? prev + ' ' : '') + transcript);
      };

      rec.onend = () => {
        setListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome/Edge.');
      return;
    }

    if (listening) {
      recognition.stop();
    } else {
      setListening(true);
      recognition.start();
    }
  };

  // Convert files to base64
  const handleFileConvert = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${type === 'image' ? 'Image' : 'Document'} must be smaller than 5MB.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'image') setImage(reader.result);
        if (type === 'doc') setDocument(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAiResult(null);

    if (!title || !description) {
      setError('Title and Description are required.');
      return;
    }

    if (title.length < 8) {
      setError('Title must be at least 8 characters long.');
      return;
    }

    if (description.length < 15) {
      setError('Description must be at least 15 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title,
        description,
        category,
        priority,
        location: location || 'Vignan Campus',
        isAnonymous,
        image,
        document
      };

      const res = await axios.post('http://localhost:5000/api/complaints/submit', payload);
      setLoading(false);
      
      setAiResult(res.data.aiAnalysis);
      
      // Fire confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit complaint');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 text-left animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Register Grievance</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit a campus complaint. Our AI engine will auto-categorize and route it to your respective department head.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {aiResult ? (
          /* AI Success Report summary card */
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/5 shadow space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Complaint Filed Successfully</h3>
                <p className="text-[11px] text-slate-550 dark:text-slate-400">Gemini AI has finished evaluating your complaint parameters:</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-slate-200/50 dark:border-slate-750">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">AI Category</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{aiResult.category}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">AI Priority</span>
                <span className={`text-xs font-bold ${aiResult.priority === 'Emergency' ? 'text-red-500' : 'text-slate-800 dark:text-slate-250'}`}>{aiResult.priority}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Spam Screening</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{aiResult.isSpam ? 'Flagged Spam' : 'Pass'}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Sentiment Score</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{aiResult.sentiment} ({aiResult.sentimentScore * 10} / 10)</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-white/40 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/20">
              <span className="font-bold text-[10px] uppercase text-vignan-blue dark:text-sky-400 block mb-1">Instant AI Acknowledgment</span>
              "{aiResult.autoResponse}"
            </div>

            <button 
              onClick={() => navigate('/history')}
              className="px-5 py-2.5 bg-vignan-blue hover:bg-vignan-blue/90 text-white rounded-xl font-bold text-xs shadow-md transition-all inline-block"
            >
              Go to History Logs
            </button>
          </div>
        ) : (
          /* Form UI */
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Complaint Title *
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief description of the issue (e.g. WiFi connection broken in library block)"
                    className="w-full pl-3 pr-10 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white"
                  />
                  <FileText className="absolute right-3.5 top-3.5 text-slate-400" size={16} />
                </div>
              </div>

              {/* Description & Speech input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Detailed Complaint Description *
                  </label>
                  <button 
                    type="button" 
                    onClick={toggleListening}
                    className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700 dark:bg-slate-750 dark:text-slate-300 hover:bg-slate-300'}`}
                  >
                    {listening ? <MicOff size={10} /> : <Mic size={10} />}
                    {listening ? 'Stop Speech Engine' : 'Speech-to-Text'}
                  </button>
                </div>
                <div className="relative">
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed description of your grievance here... (min 15 characters)"
                    rows={4}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white"
                  ></textarea>
                </div>
              </div>

              {/* Selection Grids */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Category Choice
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white"
                  >
                    <option value="Auto">Auto (AI Categorize)</option>
                    <option value="Academic">Academic</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Transport">Transport</option>
                    <option value="Library">Library</option>
                    <option value="Examination">Examination</option>
                    <option value="Fees">Fees</option>
                    <option value="Placement Cell">Placement Cell</option>
                    <option value="WiFi">WiFi</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Cafeteria">Cafeteria</option>
                    <option value="Security">Security</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Grievance Priority
                  </label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white"
                  >
                    <option value="Auto">Auto (AI Suggest)</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Incident Location
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Block II, 3rd Floor"
                      className="w-full pl-8 pr-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-vignan-blue outline-none transition-all dark:text-white"
                    />
                    <MapPin className="absolute left-2.5 top-3 text-slate-400" size={14} />
                  </div>
                </div>
              </div>

              {/* Upload Files Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Image Upload */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Upload Supporting Image (JPG/PNG)
                  </label>
                  <div className="relative border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white/30 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center">
                    {image ? (
                      <div className="relative">
                        <img src={image} alt="Upload preview" className="h-16 w-auto object-cover rounded border" />
                        <button type="button" onClick={() => setImage('')} className="absolute -top-1 -right-1 h-4 w-4 bg-vignan-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">X</button>
                      </div>
                    ) : (
                      <>
                        <Upload size={16} className="text-slate-450" />
                        <span className="text-[10px] text-slate-400 mt-1">Drag image here or click</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileConvert(e, 'image')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </>
                    )}
                  </div>
                </div>

                {/* PDF Upload */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Upload Supporting Document (PDF)
                  </label>
                  <div className="relative border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white/30 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center">
                    {document ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 dark:text-slate-350 truncate max-w-[120px]">Document attached</span>
                        <button type="button" onClick={() => setDocument('')} className="h-4 w-4 bg-vignan-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">X</button>
                      </div>
                    ) : (
                      <>
                        <Upload size={16} className="text-slate-450" />
                        <span className="text-[10px] text-slate-400 mt-1">Drag PDF file here or click</span>
                        <input type="file" accept="application/pdf" onChange={(e) => handleFileConvert(e, 'doc')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Anonymous checkbox */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-750">
                <button 
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`h-5 w-5 rounded border flex items-center justify-center ${isAnonymous ? 'bg-vignan-blue border-vignan-blue text-white' : 'border-slate-300 bg-white'}`}
                >
                  {isAnonymous && <CheckCircle2 size={14} className="fill-white text-vignan-blue" />}
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-250 flex items-center gap-1.5">
                    <EyeOff size={14} className="text-slate-400" /> Submit Complaint Anonymously
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Your details will be hidden from departments. Admin will still see them for integrity check.
                  </span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-vignan-blue to-vignan-blue/90 hover:brightness-105 transition-all text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Sparkles size={16} /> File Complaint (AI Scan)
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Informative Tip */}
        <div className="p-4 bg-vignan-blue/5 border border-vignan-blue/15 dark:border-vignan-blue/30 rounded-2xl flex gap-3 text-left">
          <Info size={16} className="text-vignan-blue shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
            <span className="font-bold text-slate-700 dark:text-slate-200">How the AI Engine assists you:</span><br/>
            Our MERN system connects directly to Gemini Generative AI to parse your description. Leaving category and priority as "Auto" allows the AI to tag tags automatically. It also screens duplicates and flags spam.
          </p>
        </div>

      </div>
    </Layout>
  );
};

export default SubmitComplaint;
