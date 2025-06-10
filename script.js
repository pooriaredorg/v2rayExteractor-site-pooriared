document.addEventListener('DOMContentLoaded', () => {

    // --- انتخاب عناصر DOM ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const configsContainer = document.getElementById('configs-container');
    const loadingSpinner = document.getElementById('loading');
    const messageArea = document.getElementById('message-area');
    const copyAllButton = document.getElementById('copy-all-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // پراکسی جدید و قابل اعتمادتر
    const CORS_PROXY = 'https://proxy.cors.sh/';
    
    let activeBtn = null;
    let lastFetchedBase64 = '';

    // --- مدیریت تم (روشن/تاریک) ---
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

    // --- نمایش پیام خطا ---
    function showMessage(text, isError = true) {
        messageArea.innerHTML = `<p style="color: ${isError ? 'var(--iran-red)' : 'var(--text-color)'};">${text}</p>`;
    }

    // --- افزودن Event Listener به دکمه‌های منو ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (activeBtn) {
                activeBtn.classList.remove('active');
            }
            button.classList.add('active');
            activeBtn = button;
            fetchAndDisplayConfigs(button.dataset.url);
        });
    });

    // --- تابع اصلی برای دریافت و نمایش کانفیگ‌ها ---
    async function fetchAndDisplayConfigs(url) {
        configsContainer.innerHTML = '';
        messageArea.innerHTML = '';
        copyAllButton.style.display = 'none';
        lastFetchedBase64 = '';
        loadingSpinner.style.display = 'block';

        let response;
        try {
            response = await fetch(CORS_PROXY + url, {
                headers: {
                  // کلید موقت برای استفاده از پراکسی
                  'x-cors-api-key': 'temp_8314648e815d4893a749914755a5933d'
                }
            });
            if (!response.ok) {
                throw new Error(`خطای شبکه یا پراکسی: ${response.status}`);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            showMessage("متاسفانه در دریافت کانفیگ‌ها مشکلی پیش آمد. لطفا از اتصال اینترنت و عملکرد صحیح پراکسی اطمینان حاصل کنید و دوباره تلاش کنید.");
            loadingSpinner.style.display = 'none';
            return;
        }

        try {
            const base64Data = (await response.text()).trim();
            if (!base64Data) {
                throw new Error("پاسخ دریافتی از لینک ساب خالی است.");
            }
            lastFetchedBase64 = base64Data;
            copyAllButton.style.display = 'inline-flex';
            
            const decodedData = atob(base64Data);
            const configs = decodedData.split(/\r?\n/).filter(line => line.trim() !== '');
            
            if (configs.length === 0) {
                 showMessage("کانفیگی در این لینک یافت نشد.", false);
            } else {
                processAndRenderConfigs(configs);
            }

        } catch (error) {
            console.error('Decode Error:', error);
            showMessage("محتوای لینک ساب دریافت شد اما فرمت آن صحیح (Base64) نیست. این معمولا به معنی مشکل در لینک ساب اصلی است.");
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // --- تابع برای پردازش و رندر کردن کانفیگ‌ها ---
    function processAndRenderConfigs(configs) {
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
        return config.includes('#') ? config.substring(0, config.indexOf('#') + 1) + newName : `${config}#${newName}`;
    }
    
    // --- مدیریت رویدادهای کپی ---
    function handleCopy(button, textToCopy, originalText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            const textSpan = button.querySelector('span');
            if (textSpan) textSpan.textContent = 'کپی شد!';
            else button.textContent = 'کپی شد!';
            button.classList.add('copied');
            
            setTimeout(() => {
                if (textSpan) textSpan.textContent = originalText;
                else button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Error copying:', err);
            const textSpan = button.querySelector('span');
            if (textSpan) textSpan.textContent = 'خطا!';
            else button.textContent = 'خطا!';
        });
    }

    configsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-btn')) {
            const button = e.target;
            const configText = button.closest('.config-item').querySelector('.config-text').textContent;
            handleCopy(button, configText, 'کپی');
        }
    });

    copyAllButton.addEventListener('click', () => {
        if(lastFetchedBase64) {
            handleCopy(copyAllButton, lastFetchedBase64, 'کپی همه (Base64)');
        }
    });
});
