document.addEventListener('DOMContentLoaded', () => {

    // --- انتخاب عناصر DOM ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const configsContainer = document.getElementById('configs-container');
    const loadingSpinner = document.getElementById('loading');
    const messageArea = document.getElementById('message-area');
    const copyAllButton = document.getElementById('copy-all-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
    
    let activeBtn = null;
    let lastFetchedBase64 = '';

    // --- مدیریت تم (روشن/تاریک) ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            themeToggle.checked = true;
        } else {
            body.classList.remove('dark-theme');
            themeToggle.checked = false;
        }
    };

    themeToggle.addEventListener('change', () => {
        const selectedTheme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', selectedTheme);
        applyTheme(selectedTheme);
    });

    const savedTheme = localStorage.getItem('theme');
    // Set default to light if nothing is saved
    applyTheme(savedTheme || 'light');


    // --- افزودن Event Listener به دکمه‌های منو ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const subUrl = button.dataset.url;
            
            if (activeBtn) {
                activeBtn.classList.remove('active');
            }
            button.classList.add('active');
            activeBtn = button;

            fetchAndDisplayConfigs(subUrl);
        });
    });

    // --- تابع اصلی برای دریافت و نمایش کانفیگ‌ها ---
    async function fetchAndDisplayConfigs(url) {
        configsContainer.innerHTML = '';
        messageArea.innerHTML = '';
        copyAllButton.style.display = 'none';
        lastFetchedBase64 = '';
        loadingSpinner.style.display = 'block';

        try {
            const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error(`Status: ${response.status}`);
            }
            const base64Data = await response.text();
            
            // ذخیره برای دکمه "کپی همه"
            lastFetchedBase64 = base64Data;
            copyAllButton.style.display = 'inline-flex';
            
            const decodedData = atob(base64Data);
            const configs = decodedData.split(/\r?\n/).filter(line => line.trim() !== '');
            processAndRenderConfigs(configs);

        } catch (error) {
            console.error('Fetch/Decode Error:', error);
            const errorMsg = `
                <strong>خطای atob:</strong> رشته دریافت شده به فرمت صحیح Base64 نیست. <br>
                این معمولا به معنی مشکل در لینک ساب اصلی است.
            `;
            messageArea.innerHTML = `<p style="color: var(--iran-red);">${errorMsg}</p>`;
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // --- تابع برای پردازش و رندر کردن کانفیگ‌ها ---
    function processAndRenderConfigs(configs) {
        if (configs.length === 0) {
            messageArea.innerHTML = `<p>هیچ کانفیگی برای نمایش یافت نشد.</p>`;
            return;
        }

        configs.forEach((config, index) => {
            const personalizedConfig = personalizeConfigName(config, index + 1);

            const configElement = document.createElement('div');
            configElement.className = 'config-item';
            configElement.innerHTML = `
                <span class="config-text">${personalizedConfig}</span>
                <button class="copy-btn">کپی</button>
            `;
            configsContainer.appendChild(configElement);
        });
    }

    // --- تابع برای تغییر نام کانفیگ‌ها ---
    function personalizeConfigName(config, number) {
        const newName = `pooriared${number}`;
        if (config.includes('#')) {
            return config.substring(0, config.indexOf('#') + 1) + newName;
        } else {
            return `${config}#${newName}`;
        }
    }
    
    // --- مدیریت رویدادهای کپی ---
    function handleCopy(button, textToCopy, originalText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            button.classList.add('copied');
            // For buttons with only icon or icon and text
            const textSpan = button.querySelector('span');
            if(textSpan) textSpan.textContent = 'کپی شد!';
            else button.textContent = 'کپی شد!';
            
            setTimeout(() => {
                button.classList.remove('copied');
                if(textSpan) textSpan.textContent = originalText;
                else button.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Error copying:', err);
            const textSpan = button.querySelector('span');
            if(textSpan) textSpan.textContent = 'خطا!';
            else button.textContent = 'خطا!';
        });
    }

    // Event listener for individual copy buttons
    configsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('copy-btn')) {
            const button = event.target;
            const configText = button.closest('.config-item').querySelector('.config-text').textContent;
            handleCopy(button, configText, 'کپی');
        }
    });

    // Event listener for "Copy All" button
    copyAllButton.addEventListener('click', () => {
        if(lastFetchedBase64) {
            handleCopy(copyAllButton, lastFetchedBase64, 'کپی همه (Base64)');
        }
    });
});
