import { useEffect } from 'react';

const ContentProtection = () => {
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

    // Disable specific keyboard shortcuts
    const handleKeyDown = (e) => {
      // Disable Ctrl+S (Save), Ctrl+C (Copy), Ctrl+U (View Source), F12 (DevTools), Ctrl+Shift+I (DevTools)
      if (
        (e.ctrlKey && e.key === 's') || // Save
        (e.ctrlKey && e.key === 'u') || // View Source
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // DevTools
        (e.ctrlKey && e.shiftKey && e.key === 'i') || // DevTools
        (e.ctrlKey && e.shiftKey && e.key === 'J') || // DevTools Console
        (e.ctrlKey && e.shiftKey && e.key === 'j') || // DevTools Console
        (e.ctrlKey && e.shiftKey && e.key === 'C') || // DevTools Inspect
        (e.ctrlKey && e.shiftKey && e.key === 'c') || // DevTools Inspect
        e.key === 'F12' || // DevTools
        e.key === 'PrintScreen' // Screenshot (limited effectiveness)
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
      // Prevent selection on images and documents
      if (e.target.tagName === 'IMG' || e.target.closest('.protected-content')) {
        e.preventDefault();
        return false;
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
