
document.addEventListener('DOMContentLoaded', () => {
    const detailsDiv = document.getElementById('original-inputs-details');
    const finalPromptPre = document.getElementById('final-prompt');
    const title = document.getElementById('page-title');

    // 1. Get the data from the previous page
    const dataJSON = localStorage.getItem('promptData'); 
    const data = dataJSON ? JSON.parse(dataJSON) : null;

    if (data && data.final_prompt_en) {
        let innerHTML = '';
        
        // 2. Rendering logic based on source
        // We use the CSS class "cprf-section" which you should define in your CSS
        if (data.source === 'text') {
            title.textContent = "📝 Text Prompt Prompt Generated";
            
        } else if (data.source === 'image') {
            title.textContent = "🖼️ Image Prompt Generated";
            
        } else if (data.source === 'video') {
            title.textContent = "🎥 Video Prompt Generated";
         
        }

        if (detailsDiv) {
            detailsDiv.style.display = 'none';
        }        
        finalPromptPre.textContent = data.final_prompt_en;

    } else {
        // Error case: If user visits results.html directly without generating anything
        title.textContent = "❌ No Active Translation";
        finalPromptPre.textContent = "Awaiting translation...";
    }
});

// Clipboard Function
function copyPrompt() {
    const promptText = document.getElementById('final-prompt').textContent;
    const copyBtn = document.querySelector('.copy-btn');

    if(!promptText || promptText.includes("Awaiting")) return;

    navigator.clipboard.writeText(promptText).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = "✅ Copied to Clipboard!";
        const originalBg = copyBtn.style.backgroundColor;
        copyBtn.style.backgroundColor = "#28a745";
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.backgroundColor = originalBg;
        }, 2000);
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
}