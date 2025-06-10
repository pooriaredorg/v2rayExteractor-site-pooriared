document.addEventListener('DOMContentLoaded', () => {

    const navButtons = document.querySelectorAll('.nav-btn');
    const messageArea = document.getElementById('message-area');
    const loadingSpinner = document.getElementById('loading');
    const resultContainer = document.getElementById('result-container');
    const resultLinkTextarea = document.getElementById('result-link');
    const finalCopyBtn = document.getElementById('final-copy-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    const CORS_PROXY = 'https://corsproxy.io/?';

    // --- مدیریت تم ---
    const applyTheme = (theme) => {
        body.classList.toggle('dark-theme', theme === 'dark');
        themeToggle.checked = (theme === 'dark');
    };
    themeToggle.addEventListener('change', () => {
        const selectedTheme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', selectedTheme);
        applyTheme(selectedTheme);
    });
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // نمایش پیام به کاربر
    function showMessage(text, isError = true) {
        const color = isError ? 'var(--iran-red)' : 'var(--success-color)';
        messageArea.innerHTML = `<p style="color: ${color}; font-weight: bold;">${text}</p>`;
    }

    // --- تابع اصلی برای تولید لینک ساب ---
    async function generateSubscription(button) {
        const originalText = button.textContent;
        navButtons.forEach(btn => btn.disabled = true);
        resultContainer.style.display = 'none';
        messageArea.innerHTML = '';
        loadingSpinner.style.display = 'block';

        const url = button.dataset.url;

        try {
            const encodedUrl = encodeURIComponent(url);
            const response = await fetch(CORS_PROXY + encodedUrl);
            if (!response.ok) throw new Error('خطای شبکه');
            
            const base64Data = (await response.text()).trim();
            if (!base64Data) throw new Error('محتوای لینک ساب خالی است');

            // رمزگشایی صحیح
            const binaryString = atob(base64Data);
            const bytes = Uint8Array.from(binaryString, (m) => m.charCodeAt(0));
            const decodedData = new TextDecoder('utf-8').decode(bytes);

            const configs = decodedData.split(/\r?\n/).filter(line => line.trim() !== '');
            const personalizedConfigs = configs.map((config, index) => {
                const newName = `pooriared${index + 1}`;
                return config.includes('#') 
                    ? config.substring(0, config.indexOf('#') + 1) + newName
                    : `${config}#${newName}`;
            });
            const newSubContent = personalizedConfigs.join('\n');

            // رمزگذاری صحیح
            const newBytes = new TextEncoder().encode(newSubContent);
            let newBinaryString = '';
            newBytes.forEach((byte) => newBinaryString += String.fromCharCode(byte));
            const newSubBase64 = btoa(newBinaryString);

            // نمایش نتیجه به کاربر
            resultLinkTextarea.value = newSubBase64;
            resultContainer.style.display = 'flex';
            showMessage('لینک ساب شما آماده است. برای کپی روی دکمه زیر کلیک کنید.', false);

        } catch (error) {
            console.error('Generation Error:', error);
            showMessage("خطا در پردازش. ممکن است محتوای لینک ساب استاندارد نباشد یا پراکسی پاسخ ندهد.");
        } finally {
            loadingSpinner.style.display = 'none';
            navButtons.forEach(btn => btn.disabled = false);
        }
    }

    // Event Listener برای دکمه‌های اصلی
    navButtons.forEach(button => {
        button.setAttribute('data-original-text', button.textContent);
        button.addEventListener('click', () => {
            generateSubscription(button);
        });
    });

    // Event Listener برای دکمه کپی نهایی
    finalCopyBtn.addEventListener('click', () => {
        const linkToCopy = resultLinkTextarea.value;
        if (linkToCopy) {
            navigator.clipboard.writeText(linkToCopy).then(() => {
                finalCopyBtn.textContent = 'با موفقیت کپی شد!';
                finalCopyBtn.classList.add('copied');
                setTimeout(() => {
                    finalCopyBtn.textContent = 'کپی لینک';
                    finalCopyBtn.classList.remove('copied');
                }, 2000);
            });
        }
    });
});
