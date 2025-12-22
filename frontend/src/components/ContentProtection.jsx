import { useEffect } from 'react';

const ContentProtection = () => {
  // Function to show the sassy screenshot warning
  const showScreenshotWarning = () => {
    const warningDiv = document.createElement('div');
    warningDiv.id = 'screenshot-warning';
    
    // Function to close the warning
    const closeWarning = () => {
      warningDiv.style.transition = 'opacity 0.3s ease-out';
      warningDiv.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(warningDiv)) {
          document.body.removeChild(warningDiv);
        }
      }, 300);
    };
    
    warningDiv.innerHTML = `
      <div id="screenshot-overlay" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        animation: fadeIn 0.2s ease-out;
        cursor: pointer;
      ">
        <div style="
          background: linear-gradient(135deg, #8b0000 0%, #5c0000 100%);
          border: 4px solid #d4af37;
          padding: 30px 40px 25px;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.9), 0 0 100px rgba(139,0,0,0.5);
          font-family: Georgia, serif;
          text-align: center;
          max-width: 500px;
          animation: popIn 0.3s ease-out;
          position: relative;
        ">
          <div style="font-size: 50px; margin-bottom: 12px;">
            🚨📸🚫
          </div>
          <div style="color: #d4af37; font-size: 24px; font-weight: bold; margin-bottom: 12px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
            CAUGHT YOU!
          </div>
          <div style="color: #f5e6c8; font-size: 16px; margin-bottom: 8px; line-height: 1.5;">
            What did your mother tell you about taking other people's stuff?
          </div>
          <div style="color: #ff6b6b; font-size: 20px; font-weight: bold; margin-bottom: 12px;">
            Stop that! 😤
          </div>
          <div style="color: #d4a574; font-size: 11px; font-style: italic; margin-bottom: 15px;">
            This content is protected evidence. Screenshots are monitored.
          </div>
          <button id="screenshot-close-btn" style="
            background: linear-gradient(145deg, #d4af37 0%, #9c7a1f 100%);
            color: #1a0f0a;
            border: 2px solid #8b6914;
            padding: 8px 24px;
            border-radius: 6px;
            font-family: Georgia, serif;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s ease;
          " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            Okay, okay! 🙄
          </button>
        </div>
      </div>
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      </style>
    `;
    
    // Remove any existing warning first
    const existing = document.getElementById('screenshot-warning');
    if (existing) {
      document.body.removeChild(existing);
    }
    
    document.body.appendChild(warningDiv);
    
    // Add click handler to close button
    const closeBtn = document.getElementById('screenshot-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeWarning();
      });
    }
    
    // Add click handler to overlay (click outside to close)
    const overlay = document.getElementById('screenshot-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeWarning();
        }
      });
    }
    
    // Auto-remove warning after 5 seconds (longer now since they can close manually)
    setTimeout(() => {
      if (document.body.contains(warningDiv)) {
        closeWarning();
      }
    }, 5000);
  };

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      
      // Show warning message
      const warningDiv = document.createElement('div');
      warningDiv.innerHTML = `
        <div style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
          border: 3px solid #d4af37;
          padding: 30px 40px;
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.9);
          z-index: 10000;
          font-family: Georgia, serif;
          text-align: center;
        ">
          <div style="color: #d4af37; font-size: 24px; font-weight: bold; margin-bottom: 10px;">
            ⚠️ PROTECTED CONTENT
          </div>
          <div style="color: #f5e6c8; font-size: 16px; margin-bottom: 5px;">
            This content is legally protected evidence.
          </div>
          <div style="color: #d4a574; font-size: 14px;">
            Downloading, copying, or distributing is prohibited.
          </div>
        </div>
      `;
      
      document.body.appendChild(warningDiv);
      
      // Remove warning after 3 seconds
      setTimeout(() => {
        document.body.removeChild(warningDiv);
      }, 3000);
      
      return false;
    };

    // Disable specific keyboard shortcuts AND detect screenshots
    const handleKeyDown = (e) => {
      // Screenshot detection - Windows PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        showScreenshotWarning();
        return false;
      }
      
      // Screenshot detection - Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
      if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
        showScreenshotWarning();
        return false;
      }
      
      // Screenshot detection - Windows: Win+Shift+S (Snipping Tool)
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        showScreenshotWarning();
        return false;
      }
      
      // Screenshot detection - Windows: Win+PrtScn
      if (e.metaKey && e.key === 'PrintScreen') {
        e.preventDefault();
        showScreenshotWarning();
        return false;
      }
      
      // Disable Ctrl+S (Save), Ctrl+U (View Source), DevTools shortcuts
      if (
        (e.ctrlKey && e.key === 's') || // Save
        (e.ctrlKey && e.key === 'u') || // View Source
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // DevTools
        (e.ctrlKey && e.shiftKey && e.key === 'i') || // DevTools
        (e.ctrlKey && e.shiftKey && e.key === 'J') || // DevTools Console
        (e.ctrlKey && e.shiftKey && e.key === 'j') || // DevTools Console
        (e.ctrlKey && e.shiftKey && e.key === 'C') || // DevTools Inspect
        (e.ctrlKey && e.shiftKey && e.key === 'c') || // DevTools Inspect
        e.key === 'F12' // DevTools
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag and drop of images
    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    // Disable text selection on sensitive content
    const handleSelectStart = (e) => {
      // Allow text selection in input fields and textareas
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
      }
      // Allow selection in SVG elements (for Genogram)
      if (e.target.tagName === 'svg' || e.target.tagName === 'SVG' || 
          e.target.closest && e.target.closest('svg')) {
        return true;
      }
      // Prevent selection on images and documents
      try {
        if (e.target.tagName === 'IMG' || (e.target.closest && e.target.closest('.protected-content'))) {
          e.preventDefault();
          return false;
        }
      } catch (err) {
        // Handle cases where closest is not available (SVG elements)
        return true;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  // Add CSS for additional protection
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      /* Prevent text selection on images and sensitive content */
      img {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        pointer-events: auto;
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
      }
      
      .protected-content {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }
      
      /* Prevent highlighting on documents */
      .protected-content * {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }
      
      /* Allow selection in input fields */
      input, textarea {
        user-select: text !important;
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default ContentProtection;
