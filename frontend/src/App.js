import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Scale, MapPin, Car, Clock, ChevronDown, Navigation, Mail, Shield } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main Index Page Component
const IndexPage = () => {
  const [routeAnalysis, setRouteAnalysis] = useState(null);
  const [routeExpanded, setRouteExpanded] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessLevel, setAccessLevel] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [newEvidence, setNewEvidence] = useState({
    year: new Date().getFullYear(),
    title: "",
    description: "",
    category: "document",
    date: "",
    tags: "",
    is_critical: false
  });
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    fetchRouteAnalysis();
    fetchFolders();
  }, []);

  useEffect(() => {
    if (selectedYear && isAuthenticated) {
      fetchEvidence(selectedYear);
    }
  }, [selectedYear, isAuthenticated]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const fetchRouteAnalysis = async () => {
    try {
      const response = await axios.get(`${API}/route-analysis`);
      setRouteAnalysis(response.data);
    } catch (e) {
      console.error("Error fetching route analysis:", e);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await axios.get(`${API}/folders`);
      setFolders(response.data);
    } catch (e) {
      console.error("Error fetching folders:", e);
    }
  };

  const fetchEvidence = async (year) => {
    try {
      const response = await axios.get(`${API}/evidence?year=${year}`);
      setEvidence(response.data);
    } catch (e) {
      console.error("Error fetching evidence:", e);
    }
  };

  const handleFolderClick = (year) => {
    if (!isAuthenticated) {
      setSelectedYear(year);
      setShowPasswordModal(true);
    } else {
      setSelectedYear(selectedYear === year ? null : year);
    }
  };

  const verifyPassword = async () => {
    try {
      const response = await axios.post(`${API}/verify-password`, {
        password: passwordInput,
        access_type: "user"
      });
      if (response.data.success) {
        setIsAuthenticated(true);
        setAccessLevel(response.data.access_level);
        setShowPasswordModal(false);
        setPasswordError("");
        setPasswordInput("");
      } else {
        setPasswordError("Invalid password. Please try again.");
      }
    } catch (e) {
      setPasswordError("Error verifying password.");
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { id: Date.now().toString(), role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");

    try {
      const response = await axios.post(`${API}/chat`, { role: "user", content: chatInput });
      setChatMessages(prev => [...prev, response.data]);
    } catch (e) {
      console.error("Error sending chat:", e);
    }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    try {
      const evidenceData = {
        ...newEvidence,
        tags: newEvidence.tags.split(",").map(t => t.trim()).filter(t => t)
      };
      await axios.post(`${API}/evidence`, evidenceData);
      setShowAddEvidence(false);
      setNewEvidence({ year: new Date().getFullYear(), title: "", description: "", category: "document", date: "", tags: "", is_critical: false });
      if (selectedYear) fetchEvidence(selectedYear);
      fetchFolders();
    } catch (e) {
      console.error("Error adding evidence:", e);
    }
  };

  const markerColors = {
    A: "rgb(220, 53, 69)",
    B: "rgb(253, 126, 20)",
    C: "rgb(255, 193, 7)",
    D: "rgb(32, 201, 151)",
    E: "rgb(13, 110, 253)"
  };

  const years = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: "linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.98) 100%), radial-gradient(at 30% 20%, rgba(139, 69, 19, 0.12) 0%, transparent 50%), radial-gradient(at 70% 80%, rgba(42, 82, 152, 0.08) 0%, transparent 50%)"
    }}>
      {/* Side decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white/30 to-transparent"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/30 to-transparent"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-yellow-900/30 py-4 sm:py-6" style={{ background: "rgba(0, 0, 0, 0.2)" }}>
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full" 
                   style={{ background: "radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)", filter: "blur(30px)" }}></div>
              <Scale className="w-16 h-16 sm:w-20 sm:h-20 relative z-10" 
                     style={{ color: "rgb(212, 175, 55)", filter: "drop-shadow(0px 4px 12px rgba(212, 175, 55, 0.6))" }} />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center tracking-wider"
              style={{ fontFamily: "Garamond, Georgia, serif", letterSpacing: "0.1em", color: "rgb(212, 175, 55)" }}>
            BLANKENSHIP
          </h1>
          <div className="text-yellow-600/80 text-center text-xs sm:text-sm uppercase tracking-widest mt-2"
               style={{ fontFamily: "Garamond, serif" }}>
            Judicial Archives — Index
          </div>
        </div>
      </div>

      {/* Route Analysis Card */}
      {routeAnalysis && (
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl"
               style={{ 
                 background: "linear-gradient(135deg, rgb(26, 26, 46) 0%, rgb(22, 33, 62) 50%, rgb(15, 52, 96) 100%)",
                 border: "3px solid rgb(212, 175, 55)"
               }}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between cursor-pointer"
                 onClick={() => setRouteExpanded(!routeExpanded)}
                 style={{ 
                   background: "linear-gradient(135deg, rgb(44, 62, 80) 0%, rgb(26, 37, 47) 100%)",
                   borderBottom: "2px solid rgb(212, 175, 55)"
                 }}>
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6" style={{ color: "rgb(212, 175, 55)" }} />
                <div>
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
                    Geographic Route Analysis — {routeAnalysis.date}
                  </h3>
                  <p className="text-xs text-gray-400">{routeAnalysis.day_description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full"
                        style={{ background: "rgba(13, 110, 253, 0.2)", color: "rgb(96, 165, 250)" }}>
                    <Car className="w-4 h-4" /> {routeAnalysis.total_distance}
                  </span>
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full"
                        style={{ background: "rgba(34, 197, 94, 0.2)", color: "rgb(74, 222, 128)" }}>
                    <Clock className="w-4 h-4" /> {routeAnalysis.total_time}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${routeExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Timeline */}
            <div className="p-4">
              <div className="flex items-center justify-between overflow-x-auto pb-2">
                {routeAnalysis.locations?.map((loc, index) => (
                  <div key={loc.id || index} className="flex items-center">
                    <div className="flex flex-col items-center min-w-[80px]">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white"
                           style={{ background: markerColors[loc.marker] }}>
                        {loc.marker}
                      </div>
                      <div className="mt-2 text-center">
                        <div className="text-xs font-semibold text-white truncate max-w-[100px]">{loc.name.split(' ').slice(0, 2).join(' ')}</div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[100px]">{loc.address}</div>
                      </div>
                    </div>
                    {index < routeAnalysis.locations.length - 1 && (
                      <div className="flex-1 flex flex-col items-center mx-1 min-w-[60px]">
                        <div className="w-full h-1 bg-gradient-to-r from-gray-500 to-gray-400 relative">
                          <Navigation className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                        </div>
                        <div className="flex gap-2 mt-1 text-[10px]">
                          <span className="text-blue-400">{loc.distance}</span>
                          <span className="text-green-400">{loc.time_range}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Mobile badges */}
              <div className="flex sm:hidden items-center justify-center gap-4 mt-4 text-sm">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full"
                      style={{ background: "rgba(13, 110, 253, 0.2)", color: "rgb(96, 165, 250)" }}>
                  <Car className="w-4 h-4" /> {routeAnalysis.total_distance}
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full"
                      style={{ background: "rgba(34, 197, 94, 0.2)", color: "rgb(74, 222, 128)" }}>
                  <Clock className="w-4 h-4" /> {routeAnalysis.total_time}
                </span>
              </div>
            </div>

            <div className="px-4 py-2 text-center text-xs" style={{ background: "rgba(0, 0, 0, 0.4)", color: "rgb(102, 102, 102)" }}>
              Click to {routeExpanded ? 'collapse' : 'expand'} detailed analysis • Blankenship Case Evidence
            </div>

            {/* Expanded Details */}
            {routeExpanded && (
              <div className="p-4 grid md:grid-cols-2 gap-4" style={{ background: "rgba(0, 0, 0, 0.3)" }}>
                <div>
                  <h4 className="text-yellow-500 font-bold mb-3">📍 LOCATION DETAILS</h4>
                  {routeAnalysis.locations?.map((loc, index) => (
                    <div key={loc.id || index} className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                           style={{ background: markerColors[loc.marker] }}>
                        {loc.marker}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">{loc.name}</div>
                        <div className="text-gray-400 text-xs">{loc.address}, {loc.city}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-yellow-500 font-bold mb-3">⚠️ CRITICAL ANALYSIS</h4>
                  <ul className="space-y-2">
                    {routeAnalysis.critical_points?.map((point, index) => (
                      <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-yellow-500">•</span> {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-2 mt-4 p-4 rounded-lg text-center"
                     style={{ background: "rgba(212, 175, 55, 0.1)", border: "1px solid rgba(212, 175, 55, 0.3)" }}>
                  <p className="text-yellow-500">{routeAnalysis.conclusion}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature Buttons */}
      <div className="container mx-auto px-4 py-4 relative z-20">
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-6 py-3 rounded-lg flex items-center gap-3 transition-all hover:scale-105 shadow-lg"
                  style={{
                    background: "linear-gradient(145deg, rgb(26, 58, 82) 0%, rgb(13, 31, 45) 100%)",
                    color: "rgb(13, 110, 253)",
                    border: "3px solid rgb(13, 110, 253)",
                    fontFamily: "Georgia, serif",
                    fontWeight: "bold",
                    boxShadow: "0px 4px 20px rgba(13, 110, 253, 0.3)"
                  }}>
            <span className="text-2xl">🗺️</span>
            <div className="text-left">
              <div className="text-base">Route Analysis</div>
              <div className="text-xs text-blue-400/70 font-normal">Nov 30, 2013 — Geographic Evidence</div>
            </div>
            <MapPin className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* PI Thomas Button */}
      <div className="container mx-auto px-4 pt-6 relative z-10">
        <div className="w-full flex flex-col items-center">
          <button onClick={() => setShowChat(!showChat)}
                  className="px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105 flex items-center gap-3 mb-4"
                  style={{
                    background: "linear-gradient(145deg, rgb(44, 62, 80) 0%, rgb(26, 37, 47) 100%)",
                    border: "3px solid rgb(212, 175, 55)",
                    boxShadow: "0px 4px 25px rgba(212, 175, 55, 0.5), 0px 0px 40px rgba(212, 175, 55, 0.3)"
                  }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                 style={{ background: "linear-gradient(145deg, rgb(212, 175, 55) 0%, rgb(156, 122, 31) 100%)", border: "2px solid rgb(139, 105, 20)" }}>
              <span className="text-2xl">🕵️‍♂️</span>
            </div>
            <span className="font-bold text-sm hidden sm:block" style={{ color: "rgb(212, 175, 55)", fontFamily: "Georgia, serif" }}>
              Privatinvestigator Thomas
            </span>
            <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(212, 175, 55, 0.2)", color: "rgb(212, 175, 55)" }}>
              Ask Me
            </span>
          </button>
        </div>
      </div>

      {/* Evidence Folders */}
      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 mb-8">
          {years.map((year) => (
            <button key={year}
                    onClick={() => handleFolderClick(year)}
                    className={`group flex flex-col items-center gap-2 p-4 lg:p-5 xl:p-6 rounded-lg transition-all duration-300 hover:scale-110 ${selectedYear === year ? 'ring-2 ring-yellow-500' : ''}`}
                    style={{ background: "transparent", border: "1px solid transparent", borderRadius: "12px", position: "relative" }}>
              {/* CONFIDENTIAL Label */}
              <div className="absolute -top-2 lg:-top-3 left-1/2 -translate-x-1/2 px-2 lg:px-3 py-0.5 lg:py-1 text-[8px] sm:text-[9px] lg:text-[11px] xl:text-xs font-bold tracking-wider"
                   style={{
                     background: "linear-gradient(145deg, rgb(139, 0, 0) 0%, rgb(92, 0, 0) 100%)",
                     color: "rgb(255, 255, 255)",
                     border: "1px solid rgb(255, 0, 0)",
                     borderRadius: "2px",
                     fontFamily: "Impact, sans-serif",
                     transform: "translateX(-50%) rotate(-3deg)",
                     boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
                     textShadow: "1px 1px 1px rgba(0, 0, 0, 0.5)",
                     zIndex: 10
                   }}>
                CONFIDENTIAL
              </div>

              {/* Evidence Tag */}
              <div className="absolute -right-3 lg:-right-4 xl:-right-5 top-6 sm:top-8 lg:top-10" style={{ zIndex: 10 }}>
                <div className="w-7 h-[18px] sm:w-7 sm:h-[18px] lg:w-10 lg:h-6 xl:w-12 xl:h-7"
                     style={{
                       background: "rgb(255, 248, 220)",
                       border: "1px solid rgb(139, 105, 20)",
                       boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.4)",
                       transform: "rotate(12deg)"
                     }}>
                  <div className="text-[5px] lg:text-[8px] xl:text-[9px] font-bold text-center pt-[2px] lg:pt-[3px]"
                       style={{ color: "rgb(139, 0, 0)", fontFamily: "Arial, sans-serif" }}>EVIDENCE</div>
                  <div className="text-[6px] lg:text-[8px] xl:text-[10px] font-bold text-center"
                       style={{ color: "rgb(62, 39, 35)", fontFamily: "Courier, monospace" }}>{year}</div>
                </div>
              </div>

              {/* Envelope Icon */}
              <div className="relative mt-2 lg:mt-3" style={{ filter: "drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.4))" }}>
                <Mail className="w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 xl:w-24 xl:h-24 transition-all duration-300 text-yellow-600/80 group-hover:text-yellow-500"
                      style={{ stroke: "rgb(184, 134, 11)", strokeWidth: 1.5 }} />
                <ChevronDown className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 lg:w-5 lg:h-5 text-yellow-600/60 group-hover:text-yellow-500" />
              </div>

              {/* Year */}
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold tracking-wide transition-colors text-yellow-600/80 group-hover:text-yellow-500"
                    style={{ fontFamily: "Georgia, serif" }}>
                {year}
              </span>
            </button>
          ))}
        </div>

        {/* Expanded Folder Content */}
        {selectedYear && isAuthenticated && (
          <div className="max-w-6xl mx-auto mt-8 p-6 rounded-xl"
               style={{ background: "rgba(26, 26, 46, 0.9)", border: "2px solid rgb(212, 175, 55)" }}>
            <h2 className="text-2xl font-bold text-yellow-500 text-center mb-6" style={{ fontFamily: "Georgia, serif" }}>
              {selectedYear} Archives
            </h2>
            {evidence.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {evidence.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg"
                       style={{ background: "rgba(0, 0, 0, 0.3)", border: item.is_critical ? "2px solid rgb(220, 53, 69)" : "1px solid rgba(212, 175, 55, 0.3)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs rounded" 
                            style={{ background: "rgba(212, 175, 55, 0.2)", color: "rgb(212, 175, 55)" }}>
                        {item.category}
                      </span>
                      {item.is_critical && (
                        <span className="px-2 py-1 text-xs rounded" style={{ background: "rgb(220, 53, 69)", color: "white" }}>
                          CRITICAL
                        </span>
                      )}
                    </div>
                    <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                    {item.date && <p className="text-gray-400 text-sm mb-2">{item.date}</p>}
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No evidence documented for {selectedYear} yet.</p>
                <p className="text-yellow-500 mt-2">Click the shield button to add evidence.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed bottom-20 right-6 w-96 max-w-[calc(100vw-48px)] rounded-xl shadow-2xl z-50"
             style={{ background: "linear-gradient(135deg, rgb(26, 26, 46) 0%, rgb(22, 33, 62) 100%)", border: "2px solid rgb(212, 175, 55)" }}>
          <div className="p-4 border-b border-yellow-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🕵️‍♂️</span>
              <span className="font-bold text-yellow-500">Privatinvestigator Thomas</span>
            </div>
            <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white text-xl">×</button>
          </div>
          <div ref={chatMessagesRef} className="h-64 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(212, 175, 55, 0.1)", color: "rgb(212, 175, 55)" }}>
                Good evening. I'm here to help you navigate the case files. What would you like to know?
              </div>
            )}
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'ml-8' : 'mr-8'}`}
                   style={{ 
                     background: msg.role === 'user' ? "rgba(13, 110, 253, 0.2)" : "rgba(212, 175, 55, 0.1)",
                     color: msg.role === 'user' ? "rgb(96, 165, 250)" : "rgb(212, 175, 55)"
                   }}>
                {msg.content}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-yellow-900/50 flex gap-2">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                   placeholder="Ask about the case..."
                   className="flex-1 px-3 py-2 rounded-lg text-sm"
                   style={{ background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(212, 175, 55, 0.3)", color: "white" }} />
            <button onClick={sendChatMessage} className="px-4 py-2 rounded-lg font-bold"
                    style={{ background: "rgb(212, 175, 55)", color: "rgb(26, 15, 10)" }}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md p-6 rounded-xl"
               style={{ background: "linear-gradient(135deg, rgb(26, 26, 46) 0%, rgb(22, 33, 62) 100%)", border: "2px solid rgb(212, 175, 55)" }}>
            <h3 className="text-xl font-bold text-yellow-500 text-center mb-4">🔒 Access Required</h3>
            <p className="text-gray-400 text-center text-sm mb-4">Enter password to access {selectedYear} archives</p>
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && verifyPassword()}
                   placeholder="Enter password"
                   className="w-full px-4 py-3 rounded-lg text-center text-lg tracking-widest mb-4"
                   style={{ background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(212, 175, 55, 0.3)", color: "white" }} />
            {passwordError && <p className="text-red-500 text-sm text-center mb-4">{passwordError}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowPasswordModal(false); setPasswordInput(""); setPasswordError(""); }}
                      className="flex-1 py-3 rounded-lg font-bold"
                      style={{ background: "transparent", border: "1px solid rgba(212, 175, 55, 0.5)", color: "rgb(212, 175, 55)" }}>
                Cancel
              </button>
              <button onClick={verifyPassword} className="flex-1 py-3 rounded-lg font-bold"
                      style={{ background: "rgb(212, 175, 55)", color: "rgb(26, 15, 10)" }}>
                Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Evidence Button */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-40">
          <button onClick={() => setShowAddEvidence(true)}
                  className="p-3 rounded-full transition-all hover:scale-110"
                  style={{
                    background: "linear-gradient(145deg, rgb(212, 175, 55) 0%, rgb(197, 160, 40) 50%, rgb(156, 122, 31) 100%)",
                    border: "2px solid rgb(139, 105, 20)",
                    boxShadow: "0px 4px 16px rgba(212, 175, 55, 0.6)"
                  }}>
            <Shield className="w-5 h-5" style={{ color: "rgb(26, 15, 10)" }} />
          </button>
        </div>
      )}

      {/* Add Evidence Modal */}
      {showAddEvidence && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddEvidence} className="w-full max-w-md p-6 rounded-xl max-h-[90vh] overflow-y-auto"
                style={{ background: "linear-gradient(135deg, rgb(26, 26, 46) 0%, rgb(22, 33, 62) 100%)", border: "2px solid rgb(212, 175, 55)" }}>
            <h3 className="text-xl font-bold text-yellow-500 text-center mb-4">Add Evidence</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Year</label>
                <select value={newEvidence.year} onChange={(e) => setNewEvidence({...newEvidence, year: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 rounded-lg"
                        style={{ background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(212, 175, 55, 0.3)", color: "white" }}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Title *</label>
                <input type="text" required value={newEvidence.title}
                       onChange={(e) => setNewEvidence({...newEvidence, title: e.target.value})}
                       className="w-full px-3 py-2 rounded-lg"
                       style={{ background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(212, 175, 55, 0.3)", color: "white" }} />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Category</label>
                <select value={newEvidence.category} onChange={(e) => setNewEvidence({...newEvidence, category: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg"
                        style={{ background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(212, 175, 55, 0.3)", color: "white" }}>
                  <option value="document">Document</option>
                  <option value="testimony">Testimony</option>
                  <option value="medical">Medical</option>
                  <option value="legal">Legal</option>
                  <option value="photo">Photo</option>
                  <option value="correspondence">Correspondence</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Date</label>
                <input type="text" value={newEvidence.date}
                       onChange={(e) => setNewEvidence({...newEvidence, date: e.target.value})}
                       placeholder="e.g., November 30, 2013"
                       className="w-full px-3 py-2 rounded-lg"
                       style={{ background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(212, 175, 55, 0.3)", color: "white" }} />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Description *</label>
                <textarea required value={newEvidence.description}
                          onChange={(e) => setNewEvidence({...newEvidence, description: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg"
                          style={{ background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(212, 175, 55, 0.3)", color: "white" }} />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Tags (comma separated)</label>
                <input type="text" value={newEvidence.tags}
                       onChange={(e) => setNewEvidence({...newEvidence, tags: e.target.value})}
                       placeholder="e.g., warrant, medical"
                       className="w-full px-3 py-2 rounded-lg"
                       style={{ background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(212, 175, 55, 0.3)", color: "white" }} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="critical" checked={newEvidence.is_critical}
                       onChange={(e) => setNewEvidence({...newEvidence, is_critical: e.target.checked})} />
                <label htmlFor="critical" className="text-gray-300 text-sm">Mark as Critical Evidence</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setShowAddEvidence(false)}
                      className="flex-1 py-3 rounded-lg font-bold"
                      style={{ background: "transparent", border: "1px solid rgba(212, 175, 55, 0.5)", color: "rgb(212, 175, 55)" }}>
                Cancel
              </button>
              <button type="submit" className="flex-1 py-3 rounded-lg font-bold"
                      style={{ background: "rgb(212, 175, 55)", color: "rgb(26, 15, 10)" }}>
                Add Evidence
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/index" element={<IndexPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
