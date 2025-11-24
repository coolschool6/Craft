// Page navigation logic
const sections = {
    home: document.getElementById('home-section'),
    upload: document.getElementById('upload-section'),
    prompt: document.getElementById('prompt-section'),
    result: document.getElementById('result-section'),
    profile: document.getElementById('profile-section'),
};
function showSection(name) {
    Object.values(sections).forEach(sec => sec.classList.remove('active'));
    sections[name].classList.add('active');
}
// Navigation buttons
const uploadBtn = document.getElementById('uploadBtn');
const toPromptBtn = document.getElementById('toPromptBtn');
const toGenerateBtn = document.getElementById('toGenerateBtn');
const backHomeBtn = document.getElementById('backHomeBtn');
const profileBtn = document.getElementById('profileBtn');
const backHomeBtnProfile = document.getElementById('backHomeBtnProfile');
const profileImageCount = document.getElementById('profileImageCount');

uploadBtn.onclick = () => showSection('upload');
toPromptBtn.onclick = () => showSection('prompt');
toGenerateBtn.onclick = () => showSection('result');
backHomeBtn.onclick = () => showSection('home');
profileBtn.onclick = () => showSection('profile');
backHomeBtnProfile && backHomeBtnProfile.addEventListener('click', () => {
    showSection('home');
});

// Image upload preview
const imageInput = document.getElementById('imageInput');
const uploadedImagePreview = document.getElementById('uploadedImagePreview');
let uploadedImageData = null;
if (imageInput) {
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                uploadedImagePreview.innerHTML = `<img src="${evt.target.result}" alt="Uploaded Image">`;
                uploadedImageData = evt.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Prompt selection logic
const promptBtns = document.querySelectorAll('.prompt-btn');
const selectedPromptDetails = document.getElementById('selectedPromptDetails');
let selectedPrompt = '';
const christmasDescription = `The background is a soft, muted pink, evenly lit with no harsh shadows or bright spots, suggesting a diffused light source.
Arranged across this pink surface are various Christmas-themed items.
In the upper left quadrant, slightly to the right of the corner, is a small, glossy white spherical ornament with a gold cap and a small gold loop for hanging near the product. A golden star-shaped glitter piece is positioned just above and slightly to the left of this ornament still near the product.
Below the white ornament, near the middle-left edge of the frame, lies a single candy cane. It is diagonally oriented, with its hook pointing upwards and to the left, and its straight end pointing downwards and to the right. The candy cane has distinct red and white stripes.
In the upper central area, slightly to the left, sits a clear glass jar filled with mini candy canes near the products. The jar is round with a wide opening, and the candy canes inside are a mix of red and white, some still in their individual plastic wrappers near the products and ir b. Another golden star-shaped glitter piece is placed just above and to the left of this jar with is near the product.
To the right of the jar of mini candy canes, closer to the top edge, is a single, glossy red spherical ornament with a silver cap and a small silver loop for hanging next to the product.
Further to the right, in the upper right quadrant, there's another clear glass jar, similar in size and shape to the first, also filled with mini candy canes. This jar is near the product not cut off, nestled slightly below the red ornament, is another small, glossy white spherical ornament with a gold cap next to the product. A faint purple or pinkish glow or a very light object is barely visible at the very top right next to the product.
In the bottom right corner, a golden star-shaped glitter piece is visible, with a small, faint white sparkle effect emanating from its bottom point the star very near the product not the edge. Another very faint, light-colored sparkle or glint is just above it and to the left next to the product.
All of these decorations is very close to the products as if the edge of the background is to be cut off.
The sparkle should be in the middle of both stars regardless of previous instructions.`;

promptBtns.forEach(btn => {
    btn.onclick = () => {
        selectedPrompt = btn.dataset.prompt;
        if (selectedPrompt === "Pink Christmas background") {
            selectedPromptDetails.textContent = christmasDescription;
        } else {
            selectedPromptDetails.textContent = `Prompt: ${selectedPrompt}`;
        }
    };
});
const customPromptInput = document.getElementById('customPrompt');
customPromptInput && customPromptInput.addEventListener('input', (e) => {
    selectedPrompt = e.target.value;
    selectedPromptDetails.textContent = selectedPrompt ? `Custom Prompt: ${selectedPrompt}` : '';
});

// Generate Scene (API placeholder)
const resultImagePreview = document.getElementById('resultImagePreview');
toGenerateBtn && toGenerateBtn.addEventListener('click', () => {
    // Placeholder: show uploaded image as result
    if (uploadedImageData) {
        resultImagePreview.innerHTML = `<img src="${uploadedImageData}" alt="Result Image">`;
    } else {
        resultImagePreview.textContent = 'No image uploaded.';
    }
    // TODO: Call API with uploadedImageData and selectedPrompt
});

// Gemini API integration (browser version)
// NOTE: This is a browser adaptation, not Node.js. Node.js code cannot run in browser directly.
// For browser, use fetch to call Gemini API endpoint.

const GEMINI_API_KEY = "AIzaSyDN9pGlTLosJH062lH-xOyueKWv1w5UzAY";

async function callGeminiAPI(imageBase64, promptText) {
    // Gemini API endpoint for browser (v1beta)
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=" + GEMINI_API_KEY;
    const body = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: promptText },
                    {
                        inline_data: {
                            mime_type: "image/png",
                            data: imageBase64,
                        }
                    }
                ]
            }
        ]
    };
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        let errorText = "Gemini API error";
        try {
            const errorJson = await response.json();
            if (errorJson && errorJson.error && errorJson.error.message) {
                errorText += ": " + errorJson.error.message;
            } else {
                errorText += ": " + response.status + " " + response.statusText;
            }
        } catch (e) {
            errorText += ": " + response.status + " " + response.statusText;
        }
        throw new Error(errorText);
    }
    return await response.json();
}

// Use Gemini API when generating scene
// Replace the placeholder in toGenerateBtn click handler
if (toGenerateBtn) {
    toGenerateBtn.addEventListener('click', async () => {
        if (!uploadedImageData) {
            resultImagePreview.textContent = 'No image uploaded.';
            return;
        }
        resultImagePreview.innerHTML = '<span>Generating...</span>';
        let promptText = selectedPrompt || 'Create a professional product background.';
        // Remove base64 prefix for Gemini
        const base64 = uploadedImageData.replace(/^data:image\/\w+;base64,/, "");
        originalImageData = uploadedImageData;
        imageHistory = [uploadedImageData];
        try {
            const geminiResult = await callGeminiAPI(base64, promptText);
            // Find image result
            const parts = geminiResult.candidates?.[0]?.content?.parts || [];
            let foundImage = false;
            for (const part of parts) {
                if (part.inlineData) {
                    const imgBase64 = part.inlineData.data;
                    const resultImg = `data:image/png;base64,${imgBase64}`;
                    resultImagePreview.innerHTML = `<img src="${resultImg}" alt="Result Image">`;
                    imageHistory.push(resultImg);
                    foundImage = true;
                } else if (part.text) {
                    resultImagePreview.innerHTML += `<div>${part.text}</div>`;
                }
            }
            if (!foundImage) {
                resultImagePreview.innerHTML = '<span>No image returned.</span>';
            }
        } catch (err) {
            resultImagePreview.innerHTML = `<span>Error: ${err.message}</span>`;
        }
        updateProfileImageCount();
    });
}

// Download result image
const downloadBtn = document.getElementById('downloadBtn');
downloadBtn && downloadBtn.addEventListener('click', () => {
    const img = resultImagePreview.querySelector('img');
    if (img) {
        const a = document.createElement('a');
        a.href = img.src;
        a.download = 'generated-image.png';
        a.click();
    }
});

// Edit image by prompt (API placeholder)
const editBtn = document.getElementById('editBtn');
const editPromptInput = document.getElementById('editPrompt');
// Helper to get current result image base64
function getCurrentResultImageBase64() {
    const img = resultImagePreview.querySelector('img');
    if (!img) return null;
    // Extract base64 from src
    const match = img.src.match(/^data:image\/\w+;base64,(.*)$/);
    return match ? match[1] : null;
}

// Edit image by prompt using Gemini API
editBtn && editBtn.addEventListener('click', async () => {
    const imgBase64 = getCurrentResultImageBase64();
    const editPrompt = editPromptInput.value.trim();
    if (!imgBase64) {
        resultImagePreview.innerHTML = '<span>No image to edit.</span>';
        return;
    }
    if (!editPrompt) {
        alert('Please enter an edit prompt.');
        return;
    }
    resultImagePreview.innerHTML = '<span>Editing...</span>';
    try {
        const geminiResult = await callGeminiAPI(imgBase64, editPrompt);
        const parts = geminiResult.candidates?.[0]?.content?.parts || [];
        let foundImage = false;
        for (const part of parts) {
            if (part.inlineData) {
                const newImgBase64 = part.inlineData.data;
                const editedImg = `data:image/png;base64,${newImgBase64}`;
                resultImagePreview.innerHTML = `<img src="${editedImg}" alt="Edited Image">`;
                imageHistory.push(editedImg);
                foundImage = true;
            } else if (part.text) {
                resultImagePreview.innerHTML += `<div>${part.text}</div>`;
            }
        }
        if (!foundImage) {
            resultImagePreview.innerHTML = '<span>No edited image returned.</span>';
        }
    } catch (err) {
        resultImagePreview.innerHTML = `<span>Error: ${err.message}</span>`;
    }
    updateProfileImageCount();
});

// Store original and history for undo/show original
let originalImageData = null;
let imageHistory = [];

// Show Original button
const showOriginalBtn = document.getElementById('showOriginalBtn');
showOriginalBtn && showOriginalBtn.addEventListener('click', () => {
    if (originalImageData) {
        resultImagePreview.innerHTML = `<img src="${originalImageData}" alt="Original Image">`;
    } else {
        resultImagePreview.innerHTML = '<span>No original image available.</span>';
    }
});

// Undo button
const undoBtn = document.getElementById('undoBtn');
undoBtn && undoBtn.addEventListener('click', () => {
    if (imageHistory.length > 1) {
        imageHistory.pop();
        const prevImg = imageHistory[imageHistory.length - 1];
        resultImagePreview.innerHTML = `<img src="${prevImg}" alt="Undo Image">`;
    } else {
        resultImagePreview.innerHTML = '<span>No previous image to undo.</span>';
    }
});

// Share button
const shareBtn = document.getElementById('shareBtn');
shareBtn && shareBtn.addEventListener('click', () => {
    const img = resultImagePreview.querySelector('img');
    if (img) {
        // Copy image src to clipboard
        navigator.clipboard.writeText(img.src).then(() => {
            alert('Image link copied to clipboard!');
        }, () => {
            alert('Failed to copy image link.');
        });
    } else {
        alert('No image to share.');
    }
});

// Help button
const helpBtn = document.getElementById('helpBtn');
helpBtn && helpBtn.addEventListener('click', () => {
    alert('How to use IsraelCraft AI:\n\n1. Upload your product image.\n2. Choose or type a prompt for the background.\n3. Click Generate Scene to create a new image.\n4. Download, edit, undo, or share your image.\n5. Use Start Over to begin a new project.');
});

// Reset/Start Over button
const resetBtn = document.getElementById('resetBtn');
resetBtn && resetBtn.addEventListener('click', () => {
    uploadedImageData = null;
    originalImageData = null;
    imageHistory = [];
    uploadedImagePreview.innerHTML = '';
    resultImagePreview.innerHTML = '';
    selectedPrompt = '';
    selectedPromptDetails.textContent = '';
    customPromptInput.value = '';
    editPromptInput.value = '';
    showSection('home');
    updateProfileImageCount();
});

// Track images created
function updateProfileImageCount() {
    if (profileImageCount) {
        profileImageCount.textContent = imageHistory.length > 1 ? imageHistory.length - 1 : 0;
    }
}
