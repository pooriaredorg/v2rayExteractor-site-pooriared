document.addEventListener('DOMContentLoaded', () => {

    const navButtons = document.querySelectorAll('.nav-btn');
    const messageArea = document.getElementById('message-area');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // پراکسی پایدار
    const CORS_PROXY = 'https://api.codetabs.com/v1/proxy?quest=';
    
    // --- توابع کمکی برای کار با کاراکترهای خاص و ایموجی (UTF-8) ---
    function btoa_utf8(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    function atob_utf8(str) {
        return decodeURIComponent(escape(atob(str)));
    }

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

    // --- نمایش پیام به کاربر ---
    function showMessage(text, isError = true) {
        messageArea.innerHTML = `<p style="color: ${isError ? 'var(--iran-red)' : 'var(--success-color)'}; font-weight: bold;">${text}</p>`;
    }

    // --- افزودن Event Listener به دکمه‌ها ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            processAndCopySubscription(button);
        });
    });

    // --- تابع اصلی برای پردازش و کپی لینک ساب ---
    async function processAndCopySubscription(button) {
        const originalText = button.textContent;
        navButtons.forEach(btn => {
            btn.disabled = true;
            if (btn === button) btn.textContent = 'در حال آماده‌سازی...';
        });
        messageArea.innerHTML = '';
        
        const url = button.dataset.url;
        let base64Data;
        
        try {
            const response = await fetch(CORS_PROXY + url);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
            base64Data = (await response.text()).trim();
            if (!base64Data) throw new Error("پاسخ دریافتی از لینک ساب خالی است.");
        } catch (error) {
            console.error('Fetch Error:', error);
            showMessage("خطا در دریافت اطلاعات. لطفا از اتصال اینترنت خود مطمئن شوید و دوباره تلاش کنید.");
            resetButtons();
            return;
        }

        try {
            const decodedData = atob_utf8(base64Data); // استفاده از تابع جدید
            const configs = decodedData.split(/\r?\n/).filter(line => line.trim() !== '');
            
            const personalizedConfigs = configs.map((config, index) => {
                const newName = `pooriared${index + 1}`;
                return config.includes('#') 
                    ? config.substring(0, config.indexOf('#') + 1) + encodeURIComponent(newName)
                    : `${config}#${encodeURIComponent(newName)}`;
            });
            
            const newSubContent = personalizedConfigs.join('\n');
            const newSubBase64 = btoa_utf8(newSubContent); // استفاده از تابع جدید

            await navigator.clipboard.writeText(newSubBase64);
            
            button.classList.add('copied');
            button.textContent = 'کپی شد!';
            showMessage('لینک ساب جدید با موفقیت کپی شد!', false);

        } catch (error) {
            console.error('Processing/Copying Error:', error);
            showMessage("خطا در پردازش یا کپی. ممکن است محتوای لینک ساب استاندارد نباشد.");
        }

        setTimeout(() => {
            button.classList.remove('copied');
            resetButtons(originalText);
        }, 2500);
    }
    
    function resetButtons() {
        navButtons.forEach(btn => {
            btn.disabled = false;
            // پیدا کردن متن اصلی دکمه از یک منبع ثابت
            const buttonType = btn.getAttribute('data-url').match(/([^/]+)\.html/);
            if (buttonType) {
                 const name = buttonType[1];
                 if (name === 'sub') btn.textContent = "MIX";
                 else if (name === 'ss') btn.textContent = "SS";
                 else if (name === 'hy2') btn.textContent = "HY2";
                 else btn.textContent = name.toUpperCase();
            }
        });
    }
});
