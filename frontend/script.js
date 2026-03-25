document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.location.href = 'dashboard.html';
        });
    }

    // --- Text Redaction State ---
    let historyStack = [];
    let redoStack = [];
    let originalText = "";
    let isAIMode = false;
    let selectedRange = null;

    const sourceTextarea = document.getElementById('source-text');
    const modeToggle = document.getElementById('mode-toggle');
    const aiComingSoon = document.getElementById('ai-coming-soon');
    const resultsContainer = document.getElementById('results-container');
    const labelModal = document.getElementById('label-modal');
    const closeModal = document.getElementById('close-modal');
    const confirmRedact = document.getElementById('confirm-redact');
    const popupRedactStyle = document.getElementById('popup-redact-style');
    const popupCustomContainer = document.getElementById('popup-custom-container');
    const popupCustomInput = document.getElementById('popup-custom-input');
    const labelOptions = document.querySelectorAll('.label-option');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const redactBtn = document.getElementById('redact-btn');
    const originalPanel = document.getElementById('original-panel');
    const resultPanel = document.getElementById('result-panel');

    let currentSelectedLabel = "PERSON";

    // --- Mode Toggle ---
    if (modeToggle) {
        modeToggle.addEventListener('change', (e) => {
            isAIMode = e.target.checked;
            if (isAIMode) {
                aiComingSoon.classList.remove('hidden');
            } else {
                aiComingSoon.classList.add('hidden');
            }
        });
    }

    // --- Modal Logic ---
    function showModal() {
        const start = sourceTextarea.selectionStart;
        const end = sourceTextarea.selectionEnd;
        if (start === end) {
            alert('Please select some text to redact first.');
            return;
        }
        selectedRange = { start, end };
        labelModal.classList.remove('hidden');
    }

    function hideModal() {
        labelModal.classList.add('hidden');
        selectedRange = null;
    }

    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
    }

    labelOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            labelOptions.forEach(b => b.classList.remove('active'));
            opt.classList.add('active');
            currentSelectedLabel = opt.dataset.label;
            if (currentSelectedLabel === 'CUSTOM') {
                popupCustomContainer.classList.remove('hidden');
            } else {
                popupCustomContainer.classList.add('hidden');
            }
        });
    });

    // Initialize first option as active
    if (labelOptions.length > 0) labelOptions[0].click();

    // --- History System ---
    function saveState() {
        historyStack.push(sourceTextarea.value);
        redoStack = []; // Clear redo on new action
        updateHistoryButtons();
    }

    function updateHistoryButtons() {
        if (undoBtn) undoBtn.disabled = historyStack.length === 0;
        if (redoBtn) redoBtn.disabled = redoStack.length === 0;
    }

    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            if (historyStack.length > 0) {
                redoStack.push(sourceTextarea.value);
                sourceTextarea.value = historyStack.pop();
                updateHistoryButtons();
                updatePreviews();
            }
        });
    }

    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            if (redoStack.length > 0) {
                historyStack.push(sourceTextarea.value);
                sourceTextarea.value = redoStack.pop();
                updateHistoryButtons();
                updatePreviews();
            }
        });
    }

    // --- Redaction Core ---
    if (redactBtn) {
        redactBtn.addEventListener('click', () => {
            if (isAIMode) {
                // Future AI integration message already handled by toggle, but we can alert too
                alert('AI redaction is coming soon in a future update.');
                return;
            }

            showModal();
        });
    }

    if (confirmRedact) {
        confirmRedact.addEventListener('click', () => {
            if (!selectedRange) return;

            const style = popupRedactStyle.value;
            let finalLabel = currentSelectedLabel;
            if (finalLabel === 'CUSTOM') {
                finalLabel = popupCustomInput.value.trim().toUpperCase() || 'CUSTOM';
            }

            const text = sourceTextarea.value;
            const selectedText = text.substring(selectedRange.start, selectedRange.end);
            let replacement = "";

            if (style === 'tag') {
                replacement = `<${finalLabel}>`;
            } else if (style === 'redacted') {
                replacement = '[REDACTED]';
            } else if (style === 'mask') {
                replacement = 'X'.repeat(selectedText.length);
            }

            // Capture initial original text if this is the first action
            if (originalText === "" && text !== "") {
                originalText = text;
            }

            saveState();

            sourceTextarea.value =
                text.slice(0, selectedRange.start) +
                replacement +
                text.slice(selectedRange.end);

            hideModal();
            updatePreviews();
        });
    }

    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    function updatePreviews() {
        if (sourceTextarea.value.trim() !== "") {
            resultsContainer.classList.remove('hidden');
            originalPanel.innerHTML = escapeHtml(originalText || sourceTextarea.value);
            resultPanel.innerHTML = escapeHtml(sourceTextarea.value);
        }
    }

    // --- Existing Copy/Download Logic (Adapted) ---

    // Copy to Clipboard functionality
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const textToCopy = sourceTextarea.value;
            if (!textToCopy) return;

            try {
                await navigator.clipboard.writeText(textToCopy);
                const copyTextSpan = document.getElementById('copy-text');
                const originalBtnText = copyTextSpan.innerText;
                copyTextSpan.innerText = 'Copied!';
                setTimeout(() => copyTextSpan.innerText = originalBtnText, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });
    }

    // Download Text File functionality and Save to DB
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            const textToDownload = sourceTextarea.value;
            if (!textToDownload) return;

            // Save to DB via API
            try {
                const token = localStorage.getItem('shieldDocsToken');
                if (token) {
                    await fetch('http://127.0.0.1:5000/api/documents/save-text', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ redacted_text: textToDownload })
                    });
                }
            } catch (err) {
                console.error('Failed to save text to DB:', err);
            }

            const blob = new Blob([textToDownload], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'redacted_text.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        });
    }

    // --- File Redaction Rebuild Logic (Page: file-redact.html) ---
    const fileInput = document.getElementById('fileInput');
    const uploadFileBtn = document.getElementById('uploadFileBtn');
    const fileNameDisplay = document.getElementById('file-name-display');
    const viewerWrapper = document.getElementById('viewer-wrapper');
    const pdfViewer = document.getElementById('pdf-viewer');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const applyRedactionBtn = document.getElementById('applyRedactionBtn');

    let redactions = []; // Store redaction data: {page, x1, y1, x2, y2, type}
    let selectedRedactionType = "";
    let currentFilePath = '';
    let redactedFilePath = null;
    let isDrawing = false;
    
    const redactStyleSelect = document.getElementById('file-redact-style');
    if (redactStyleSelect) {
        redactStyleSelect.addEventListener('change', (e) => {
            selectedRedactionType = e.target.value;
        });
    }
    
    function removeAllRedactionBoxes() {
        document.querySelectorAll(".redaction-box").forEach(el => el.remove());
    }

    let startX, startY;
    let currentRect = null;
    let currentScale = 1.5;
    let activeDrawingContainer = null;
    let activeDrawingViewport = null;
    let documentRotation = 0;

    const undoRedactionBtn = document.getElementById('undoRedactionBtn');
    const rotateDocBtn = document.getElementById('rotateDocBtn');
    const fileModeToggle = document.getElementById('file-mode-toggle');

    if (fileModeToggle) {
        fileModeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                alert("AI file redaction is coming soon in a future update.");
                e.target.checked = false; // Revert visually
            }
        });
    }

    if (undoRedactionBtn) {
        undoRedactionBtn.addEventListener('click', () => {
            if (redactions.length > 0) {
                redactions.pop();
                const boxes = document.querySelectorAll('.redaction-box');
                if (boxes.length > 0) {
                    boxes[boxes.length - 1].remove();
                }
                if (redactions.length === 0) undoRedactionBtn.disabled = true;
                console.log("Undid last redaction. Remaining:", redactions);
            }
        });
    }

    if (rotateDocBtn) {
        rotateDocBtn.addEventListener('click', async () => {
            if (!currentFilePath) return;
            documentRotation = (documentRotation + 90) % 360;
            // Clear un-applied redactions to prevent coordinate mismatches
            redactions = [];
            removeAllRedactionBoxes();
            if (undoRedactionBtn) undoRedactionBtn.disabled = true;
            
            pdfViewer.innerHTML = '';
            
            let renderSource = currentFilePath;
            // Native uploads should render from the local File object to prevent local file:// CORS errors
            if (!redactedFilePath && fileInput.files.length > 0) {
                renderSource = fileInput.files[0];
            } else {
                // If previously redacted, it must fetch absolute URL over HTTP
                renderSource = "http://127.0.0.1:5000/" + currentFilePath;
            }
            
            try {
                await renderPDFInViewer(renderSource, pdfViewer, currentScale, documentRotation);
            } catch (err) {
                console.error("Render error on rotate:", err);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const fileName = e.target.files[0] ? e.target.files[0].name : 'Choose PDF Document';
            if (fileNameDisplay) fileNameDisplay.textContent = fileName;
        });
    }

    if (uploadFileBtn) {
        uploadFileBtn.addEventListener('click', async () => {
            if (!fileInput.files || fileInput.files.length === 0) {
                alert('Please select a PDF file first.');
                return;
            }

            const file = fileInput.files[0];
            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                alert('Only PDF files are allowed.');
                return;
            }

            // Show Loading State
            uploadFileBtn.disabled = true;
            if (btnText) btnText.classList.add('hidden');
            if (btnLoader) btnLoader.classList.remove('hidden');

            const formData = new FormData();
            formData.append('document', file);

            try {
                const token = localStorage.getItem('shieldDocsToken');
                const headers = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                // 1. Upload to Node.js Backend
                const response = await fetch('http://127.0.0.1:5000/api/documents/upload-file', {
                    method: 'POST',
                    headers: headers,
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.detail || `Upload failed: ${response.statusText}`);
                }

                const data = await response.json();
                if (!data || !data.file_path) {
                    throw new Error(`Invalid upload response: ${JSON.stringify(data)}`);
                }
                console.log('Backend Upload Success:', data.file_path);
                currentFilePath = data.file_path;

                // 2. Clear previous view and show wrapper
                pdfViewer.innerHTML = '';
                viewerWrapper.classList.remove('hidden');
                redactions = []; // Reset redactions on new upload
                documentRotation = 0; // Reset rotation on new upload
                redactedFilePath = null; // Important: Clear previous redaction state
                if (undoRedactionBtn) undoRedactionBtn.disabled = true;

                // 3. Render PDF locally using PDF.js
                await renderPDFInViewer(file);

                // Smooth scroll to viewer
                viewerWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });

            } catch (err) {
                console.error('File Redaction Error:', err);
                alert(`Error: ${err.message}`);
                viewerWrapper.classList.add('hidden');
            } finally {
                uploadFileBtn.disabled = false;
                if (btnText) btnText.classList.remove('hidden');
                if (btnLoader) btnLoader.classList.add('hidden');
            }
        });
    }

    if (applyRedactionBtn) {
        applyRedactionBtn.addEventListener('click', async () => {
            if (redactions.length === 0) {
                alert('Please draw at least one redaction box first.');
                return;
            }
            if (!currentFilePath) {
                alert('Please upload a file first.');
                return;
            }

            const originalText = applyRedactionBtn.textContent;
            applyRedactionBtn.disabled = true;
            applyRedactionBtn.textContent = 'Applying...';

            console.log('--- Apply Redactions Debug ---');
            console.log('File Path:', currentFilePath);
            console.log('Redactions Count:', redactions.length);
            console.log('Redactions Data:', JSON.stringify(redactions));
            
            try {
                const token = localStorage.getItem('shieldDocsToken');
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                // Note: The new Node.js backend currently focuses on tracking file uploads and text.
                // Apply Redactions would need a dedicated PDF engine on the server if fully ported.
                // For now, pointing to localhost:5000 but it may 404 if the route isn't built yet.
                const response = await fetch('http://127.0.0.1:5000/api/documents/apply-redactions', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        file_path: currentFilePath,
                        redactions: redactions,
                        rotation: documentRotation
                    })
                });

                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch {
                        errorData = { detail: response.statusText };
                    }
                    throw new Error(errorData.detail || errorData.error || `Apply failed: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Success response:', data);
                
                if (data.redacted_file) {
                    currentFilePath = data.redacted_file;
                    redactedFilePath = data.redacted_file;
                    const fileUrl = "http://127.0.0.1:5000/" + data.redacted_file;

                    // Reset rotation because the backend saves it natively
                    documentRotation = 0;
                    if (undoRedactionBtn) undoRedactionBtn.disabled = true;

                    // Reload viewer
                    pdfViewer.innerHTML = '';
                    await renderPDFInViewer(fileUrl, pdfViewer, currentScale, documentRotation);

                    // Clear old selections
                    redactions = [];
                    removeAllRedactionBoxes();

                    // 3. Reset Dropdown
                    selectedRedactionType = "";
                    const styleDropdown = document.getElementById("file-redact-style");
                    if (styleDropdown) styleDropdown.value = "";

                    alert("Redaction applied successfully");
                }

                // Enable buttons
                const previewBtn = document.getElementById('previewBtn');
                const downloadBtn = document.getElementById('downloadBtn');
                if (previewBtn) {
                    previewBtn.disabled = false;
                    // Reset listener to avoid duplicates
                    const newPreviewBtn = previewBtn.cloneNode(true);
                    previewBtn.parentNode.replaceChild(newPreviewBtn, previewBtn);
                    
                    newPreviewBtn.addEventListener('click', async () => {
                        const previewSection = document.getElementById('preview-section');
                        const originalViewer = document.getElementById('original-viewer');
                        const redactedViewer = document.getElementById('redacted-viewer');
                        
                        previewSection.classList.remove('hidden');
                        originalViewer.innerHTML = '';
                        redactedViewer.innerHTML = '';

                        const originalFile = fileInput.files[0];
                        const redactedUrl = "http://127.0.0.1:5000/" + currentFilePath;

                        console.log('Loading side-by-side preview...');
                        
                        await Promise.all([
                            renderPDFInViewer(originalFile, originalViewer, 0.8),
                            renderPDFInViewer(redactedUrl, redactedViewer, 0.8)
                        ]);

                        previewSection.scrollIntoView({ behavior: 'smooth' });
                    });

                    // Update action buttons (Download & Save)
                    const downloadBtn = document.getElementById('downloadRedactedBtn');
                    const saveBtn = document.getElementById('saveRedactedBtn');

                    if (downloadBtn) {
                        downloadBtn.style.display = 'flex';
                        downloadBtn.disabled = false;
                        downloadBtn.onclick = () => {
                            if (redactedFilePath) {
                                window.location.href = `http://127.0.0.1:5000/${redactedFilePath}`;
                            }
                        };
                    }

                    if (saveBtn) {
                        saveBtn.style.display = 'flex';
                        saveBtn.disabled = false;
                        saveBtn.onclick = async () => {
                            const token = localStorage.getItem('shieldDocsToken');
                            const originalName = fileInput.files[0]?.name || 'document.pdf';
                            
                            saveBtn.disabled = true;
                            saveBtn.textContent = 'Saving...';
                            
                            try {
                                const res = await fetch('http://127.0.0.1:5000/api/documents/save-redacted', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        file_path: redactedFilePath,
                                        original_name: originalName
                                    })
                                });
                                
                                if (!res.ok) throw new Error('Failed to save document');
                                
                                saveBtn.textContent = 'Saved!';
                                saveBtn.style.background = '#10b981';
                                setTimeout(() => {
                                    saveBtn.textContent = 'Save to Workspace';
                                    saveBtn.disabled = false;
                                    saveBtn.style.background = '';
                                }, 3000);
                            } catch (err) {
                                console.error('Save error:', err);
                                alert('Error saving: ' + err.message);
                                saveBtn.disabled = false;
                                saveBtn.textContent = 'Save to Workspace';
                            }
                        };
                    }

                    applyRedactionBtn.textContent = 'Applied!';
                    setTimeout(() => { applyRedactionBtn.textContent = originalText; }, 3000);
                }
            } catch (err) {
                console.error('Apply Redaction Error:', err);
                const errorMsg = err.message || 'Unknown error occurred.';
                alert(`Error: ${errorMsg}`);
                applyRedactionBtn.textContent = originalText;
            } finally {
                applyRedactionBtn.disabled = false;
            }
        });
    }

    async function renderPDFInViewer(source, targetContainer = pdfViewer, scale = currentScale, rotation = 0) {
        try {
            let loadingTask;
            if (source instanceof File) {
                const fileURL = URL.createObjectURL(source);
                loadingTask = pdfjsLib.getDocument(fileURL);
            } else {
                loadingTask = pdfjsLib.getDocument(source);
            }

            const pdf = await loadingTask.promise;
            console.log(`Rendering PDF to ${targetContainer.id || 'viewer'}...`);

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                
                // Final visual rotation is native rotation + our manual rotation
                const finalRotation = (page.rotate + rotation) % 360;
                const viewport = page.getViewport({ scale: scale, rotation: finalRotation });

                // Page Container
                const pageContainer = document.createElement('div');
                pageContainer.className = (targetContainer === pdfViewer) ? 'pdf-page-container' : 'mini-page-container';
                pageContainer.dataset.pageNumber = pageNum;
                pageContainer.style.width = `${viewport.width}px`;
                pageContainer.style.height = `${viewport.height}px`;

                // Canvas
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                canvas.className = 'pdf-page-canvas';
                
                pageContainer.appendChild(canvas);
                targetContainer.appendChild(pageContainer);

                // Add Drawing Event Listeners ONLY for main viewer
                if (targetContainer === pdfViewer) {
                    setupDrawingListeners(pageContainer, page, viewport);
                }

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
            }
        } catch (error) {
            console.error('PDF Rendering Error:', error);
            throw new Error('Could not render PDF document.');
        }
    }

    function setupDrawingListeners(container, page, viewport) {
        container.addEventListener('mousedown', (e) => {
            if (!selectedRedactionType) {
                alert("Select redaction type before drawing");
                return;
            }
            isDrawing = true;
            activeDrawingContainer = container;
            activeDrawingViewport = viewport;
            
            const rect = container.getBoundingClientRect();
            // Handle any CSS responsive scaling
            const scaleX = viewport.width / rect.width;
            const scaleY = viewport.height / rect.height;

            startX = (e.clientX - rect.left) * scaleX;
            startY = (e.clientY - rect.top) * scaleY;

            // Visual box in CSS pixels
            const cssStartX = e.clientX - rect.left;
            const cssStartY = e.clientY - rect.top;

            currentRect = document.createElement('div');
            currentRect.className = 'redaction-box';
            currentRect.dataset.cssStartX = cssStartX;
            currentRect.dataset.cssStartY = cssStartY;
            currentRect.style.left = `${cssStartX}px`;
            currentRect.style.top = `${cssStartY}px`;
            container.appendChild(currentRect);
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDrawing || !currentRect || activeDrawingContainer !== container) return;

            const rect = container.getBoundingClientRect();
            const currentCssX = e.clientX - rect.left;
            const currentCssY = e.clientY - rect.top;

            const cssStartX = parseFloat(currentRect.dataset.cssStartX);
            const cssStartY = parseFloat(currentRect.dataset.cssStartY);

            const width = Math.abs(currentCssX - cssStartX);
            const height = Math.abs(currentCssY - cssStartY);
            const left = Math.min(cssStartX, currentCssX);
            const top = Math.min(cssStartY, currentCssY);

            currentRect.style.width = `${width}px`;
            currentRect.style.height = `${height}px`;
            currentRect.style.left = `${left}px`;
            currentRect.style.top = `${top}px`;
        });
    }

    // Attach SINGLE window mouseup handler to avoid multi-page duplication bugs
    window.addEventListener('mouseup', (e) => {
        if (!isDrawing || !activeDrawingContainer || !activeDrawingViewport) return;
        isDrawing = false;

        if (currentRect) {
            const container = activeDrawingContainer;
            const viewport = activeDrawingViewport;
            const rect = container.getBoundingClientRect();
            
            const scaleX = viewport.width / rect.width;
            const scaleY = viewport.height / rect.height;

            const endX = (e.clientX - rect.left) * scaleX;
            const endY = (e.clientY - rect.top) * scaleY;

            const x1 = Math.min(startX, endX);
            const y1 = Math.min(startY, endY);
            const x2 = Math.max(startX, endX);
            const y2 = Math.max(startY, endY);

            // Filter out tiny clicks (in internal pixels)
            if (Math.abs(x2 - x1) < 5 || Math.abs(y2 - y1) < 5) {
                currentRect.remove();
                currentRect = null;
                activeDrawingContainer = null;
                activeDrawingViewport = null;
                return;
            }

            // Convert to PyMuPDF format (PyMuPDF natively expects top-left origin, exactly matching unscaled pixels)
            const finalX1 = x1 / viewport.scale;
            const finalY1 = y1 / viewport.scale;
            const finalX2 = x2 / viewport.scale;
            const finalY2 = y2 / viewport.scale;

            const pageNum = parseInt(container.dataset.pageNumber);
            redactions.push({
                page: pageNum,
                x1: finalX1,
                y1: finalY1,
                x2: finalX2,
                y2: finalY2,
                type: selectedRedactionType
            });

            console.log("Stored redactions:", redactions);
            
            if (undoRedactionBtn) undoRedactionBtn.disabled = false;
            
            currentRect = null;
            activeDrawingContainer = null;
            activeDrawingViewport = null;
        }
    });

});
