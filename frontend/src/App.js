import { useState, useEffect, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Scales of Justice SVG Icon
const ScalesIcon = () => (
  <svg viewBox="0 0 100 100" className="scales-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10 L50 80" stroke="#fbbf24" strokeWidth="3"/>
    <path d="M50 20 L20 20 L20 30" stroke="#fbbf24" strokeWidth="3"/>
    <path d="M50 20 L80 20 L80 30" stroke="#fbbf24" strokeWidth="3"/>
    <path d="M10 30 Q20 60 30 30" stroke="#fbbf24" strokeWidth="2" fill="none"/>
    <path d="M70 30 Q80 60 90 30" stroke="#fbbf24" strokeWidth="2" fill="none"/>
    <circle cx="20" cy="20" r="4" fill="#fbbf24"/>
    <circle cx="80" cy="20" r="4" fill="#fbbf24"/>
    <rect x="40" y="80" width="20" height="10" fill="#fbbf24"/>
    <rect x="35" y="88" width="30" height="5" fill="#fbbf24"/>
  </svg>
);

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

  // Fetch initial data
  useEffect(() => {
    fetchRouteAnalysis();
    fetchFolders();
  }, []);

  // Fetch evidence when year selected
  useEffect(() => {
    if (selectedYear && isAuthenticated) {
      fetchEvidence(selectedYear);
    }
  }, [selectedYear, isAuthenticated]);

  // Scroll chat to bottom
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
    
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput
    };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");

    try {
      const response = await axios.post(`${API}/chat`, {
        role: "user",
        content: chatInput
      });
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
      setNewEvidence({
        year: new Date().getFullYear(),
        title: "",
        description: "",
        category: "document",
        date: "",
        tags: "",
        is_critical: false
      });
      if (selectedYear) {
        fetchEvidence(selectedYear);
      }
      fetchFolders();
    } catch (e) {
      console.error("Error adding evidence:", e);
    }
  };

  const markerColors = {
    A: "marker-a",
    B: "marker-b",
    C: "marker-c",
    D: "marker-d",
    E: "marker-e"
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="archives-header">
        <ScalesIcon />
        <h1 className="main-title">BLANKENSHIP</h1>
        <p className="subtitle">JUDICIAL ARCHIVES — INDEX</p>
      </header>

      {/* Route Analysis Section */}
      {routeAnalysis && (
        <div className="route-analysis-card" data-testid="route-analysis-card">
          <div 
            className="route-header" 
            onClick={() => setRouteExpanded(!routeExpanded)}
            data-testid="route-header"
          >
            <div className="route-title">
              <span style={{ fontSize: "1.5rem" }}>📍</span>
              <div>
                <h2 style={{ color: "#e5e7eb", fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                  Geographic Route Analysis — {routeAnalysis.date}
                </h2>
                <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                  {routeAnalysis.day_description}
                </p>
              </div>
            </div>
            <div className="route-badges">
              <span className="badge badge-distance">🚗 {routeAnalysis.total_distance}</span>
              <span className="badge badge-time">⏱️ {routeAnalysis.total_time}</span>
              <span style={{ color: "#9ca3af", fontSize: "1.5rem" }}>
                {routeExpanded ? "∧" : "∨"}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="timeline-container">
            <div className="timeline">
              {routeAnalysis.locations?.map((loc, index) => (
                <div key={loc.id || index} className="timeline-point">
                  <div className={`timeline-marker ${markerColors[loc.marker]}`}>
                    {loc.marker}
                  </div>
                  <div className="timeline-info">
                    <p className="timeline-name">{loc.name}</p>
                    <p className="timeline-address">{loc.address}</p>
                    {index < routeAnalysis.locations.length - 1 && (
                      <p className="timeline-distance">{loc.distance} • {loc.time_range}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.85rem", padding: "0.5rem" }}>
            Click to {routeExpanded ? "collapse" : "expand"} detailed analysis • Blankenship Case Evidence
          </p>

          {/* Expanded Details */}
          {routeExpanded && (
            <div className="route-details" data-testid="route-details">
              <div className="location-list">
                <h3>📍 LOCATION DETAILS</h3>
                {routeAnalysis.locations?.map((loc, index) => (
                  <div key={loc.id || index} className="location-item">
                    <div className={`location-marker ${markerColors[loc.marker]}`}>
                      {loc.marker}
                    </div>
                    <div className="location-details">
                      <h4>{loc.name}</h4>
                      <p>{loc.address}, {loc.city}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="critical-analysis">
                <h3>⚠️ CRITICAL ANALYSIS</h3>
                <ul className="critical-list">
                  {routeAnalysis.critical_points?.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
              <div className="route-conclusion">
                {routeAnalysis.conclusion}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature Cards */}
      <div className="feature-cards">
        <div className="feature-card" data-testid="route-analysis-feature">
          <div className="feature-icon">🗺️</div>
          <div className="feature-content">
            <h3>Route Analysis</h3>
            <p>Nov 30, 2013 — Geographic Evidence</p>
          </div>
          <span style={{ color: "#9ca3af" }}>📍</span>
        </div>

        <div 
          className="feature-card" 
          onClick={() => setShowChat(!showChat)}
          data-testid="pi-thomas-card"
        >
          <div className="feature-icon">🕵️</div>
          <div className="feature-content">
            <h3>Privatinvestigator Thomas</h3>
            <p>Case File Assistant</p>
          </div>
          <button className="ask-me-btn" onClick={(e) => { e.stopPropagation(); setShowChat(true); }}>
            Ask Me
          </button>
        </div>
      </div>

      {/* Evidence Folders */}
      <section className="folders-section">
        <div className="folders-grid">
          {folders.map((folder) => (
            <div 
              key={folder.id}
              className={`folder-card ${selectedYear === folder.year ? 'selected' : ''}`}
              onClick={() => handleFolderClick(folder.year)}
              data-testid={`folder-${folder.year}`}
            >
              <span className="confidential-badge">CONFIDENTIAL</span>
              <div className="folder-envelope">
                <div className="envelope-body">
                  <div className="envelope-flap"></div>
                </div>
                <span className="evidence-tag">EVIDENCE<br/>{folder.year}</span>
              </div>
              <span className="folder-year">{folder.year}</span>
            </div>
          ))}
        </div>

        {/* Expanded Folder Content */}
        {selectedYear && isAuthenticated && (
          <div className="folder-expanded" data-testid={`folder-expanded-${selectedYear}`}>
            <div className="folder-header">
              <h2>{selectedYear} Archives</h2>
              <p style={{ color: "#9ca3af" }}>
                {evidence.length} evidence item{evidence.length !== 1 ? 's' : ''} documented
              </p>
            </div>
            {evidence.length > 0 ? (
              <div className="evidence-grid">
                {evidence.map((item) => (
                  <div 
                    key={item.id} 
                    className={`evidence-card ${item.is_critical ? 'critical' : ''}`}
                    data-testid={`evidence-${item.id}`}
                  >
                    <span className={`evidence-category category-${item.category}`}>
                      {item.category}
                    </span>
                    {item.is_critical && (
                      <span style={{ 
                        background: "#dc2626", 
                        color: "white", 
                        padding: "0.15rem 0.5rem", 
                        borderRadius: "4px",
                        fontSize: "0.65rem",
                        marginLeft: "0.5rem"
                      }}>
                        CRITICAL
                      </span>
                    )}
                    <h4 className="evidence-title">{item.title}</h4>
                    {item.date && <p className="evidence-date">{item.date}</p>}
                    <p className="evidence-description">{item.description}</p>
                    {item.tags?.length > 0 && (
                      <div className="evidence-tags">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="evidence-tag-item">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No evidence documented for {selectedYear} yet.</p>
                <p style={{ color: "#fbbf24" }}>Click the + button to add evidence.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* PI Thomas Chat Modal */}
      {showChat && (
        <div className="chat-modal" data-testid="chat-modal">
          <div className="chat-header">
            <span style={{ fontSize: "1.5rem" }}>🕵️</span>
            <h3>Privatinvestigator Thomas</h3>
            <button className="chat-close" onClick={() => setShowChat(false)}>×</button>
          </div>
          <div className="chat-messages" ref={chatMessagesRef}>
            {chatMessages.length === 0 && (
              <div className="chat-message assistant">
                Good evening. I'm Privatinvestigator Thomas, your Case File Assistant. 
                I'm here to help you navigate through the evidence and answer any 
                questions regarding this case file.
                <br/><br/>
                Need help navigating? Just ask.
                <br/><br/>
                Need help locating something specific — a name, a time, a circumstance, 
                or even a phrase? Be my guest.
                <br/><br/>
                Give it a try: I'm here to be of help to you.
                <br/><br/>
                — Privatinvestigator Thomas
              </div>
            )}
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask about the case..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
              data-testid="chat-input"
            />
            <button className="chat-send" onClick={sendChatMessage} data-testid="chat-send">
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="password-modal-overlay">
          <div className="password-modal" data-testid="password-modal">
            <h3>🔒 Access Required</h3>
            <p>Enter password to access confidential archives</p>
            <input
              type="password"
              className="password-input"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && verifyPassword()}
              data-testid="password-input"
            />
            {passwordError && <p className="password-error">{passwordError}</p>}
            <div className="password-buttons">
              <button 
                className="password-btn secondary" 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordInput("");
                  setPasswordError("");
                }}
              >
                Cancel
              </button>
              <button 
                className="password-btn primary" 
                onClick={verifyPassword}
                data-testid="password-submit"
              >
                Access Archives
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Evidence Button (only for authenticated users) */}
      {isAuthenticated && (
        <button 
          className="add-evidence-btn" 
          onClick={() => setShowAddEvidence(true)}
          data-testid="add-evidence-btn"
        >
          +
        </button>
      )}

      {/* Add Evidence Modal */}
      {showAddEvidence && (
        <div className="add-evidence-modal">
          <form className="add-evidence-form" onSubmit={handleAddEvidence} data-testid="add-evidence-form">
            <h3>Add New Evidence</h3>
            
            <div className="form-group">
              <label>Year</label>
              <select 
                value={newEvidence.year}
                onChange={(e) => setNewEvidence({...newEvidence, year: parseInt(e.target.value)})}
              >
                {Array.from({length: 14}, (_, i) => 2013 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                required
                value={newEvidence.title}
                onChange={(e) => setNewEvidence({...newEvidence, title: e.target.value})}
                placeholder="Evidence title"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select 
                value={newEvidence.category}
                onChange={(e) => setNewEvidence({...newEvidence, category: e.target.value})}
              >
                <option value="document">Document</option>
                <option value="testimony">Testimony</option>
                <option value="medical">Medical</option>
                <option value="legal">Legal</option>
                <option value="photo">Photo</option>
                <option value="correspondence">Correspondence</option>
                <option value="general">General</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="text"
                value={newEvidence.date}
                onChange={(e) => setNewEvidence({...newEvidence, date: e.target.value})}
                placeholder="e.g., November 30, 2013"
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                required
                value={newEvidence.description}
                onChange={(e) => setNewEvidence({...newEvidence, description: e.target.value})}
                placeholder="Describe the evidence..."
              />
            </div>

            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                value={newEvidence.tags}
                onChange={(e) => setNewEvidence({...newEvidence, tags: e.target.value})}
                placeholder="e.g., warrant, medical, timeline"
              />
            </div>

            <div className="form-group form-checkbox">
              <input
                type="checkbox"
                id="is_critical"
                checked={newEvidence.is_critical}
                onChange={(e) => setNewEvidence({...newEvidence, is_critical: e.target.checked})}
              />
              <label htmlFor="is_critical">Mark as Critical Evidence</label>
            </div>

            <div className="form-buttons">
              <button type="button" className="cancel-btn" onClick={() => setShowAddEvidence(false)}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Add Evidence
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Footer */}
      <footer className="archives-footer">
        <p>Justice for Jacob, Justice for Zack ⚖️💙</p>
        <p style={{ marginTop: "0.5rem" }}>
          <a href="https://emergent.sh" target="_blank" rel="noopener noreferrer">
            Made with Emergent
          </a>
        </p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/index" element={<IndexPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
