document.addEventListener('DOMContentLoaded', () => {

    const navButtons = document.querySelectorAll('.nav-btn');
    const messageArea = document.getElementById('message-area');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // پراکسی جدید و پایدار
    const CORS_PROXY = 'https://api.codetabs.com/v1/proxy?quest=';
    
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
        const originalText = button.textContent;
        button.addEventListener('click', () => {
            processAndCopySubscription(button, originalText);
        });
    });

    // --- تابع اصلی برای پردازش و کپی لینک ساب ---
    async function processAndCopySubscription(button, originalText) {
        // غیرفعال کردن همه دکمه‌ها و نمایش حالت لودینگ
        navButtons.forEach(btn => {
            btn.disabled = true;
            if (btn === button) {
                btn.textContent = 'در حال آماده‌سازی...';
            }
        });
        messageArea.innerHTML = '';
        
        const url = button.dataset.url;
        let base64Data;
        
        // مرحله ۱: دریافت اطلاعات
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

        // مرحله ۲: پردازش و شخصی‌سازی
        try {
            const decodedData = atob(base64Data);
            const configs = decodedData.split(/\r?\n/).filter(line => line.trim() !== '');
            
            const personalizedConfigs = configs.map((config, index) => {
                const newName = `pooriared${index + 1}`;
                return config.includes('#') 
                    ? config.substring(0, config.indexOf('#') + 1) + newName 
                    : `${config}#${newName}`;
            });
            
            const newSubContent = personalizedConfigs.join('\n');
            const newSubBase64 = btoa(newSubContent);

            // مرحله ۳: کپی در کلیپ‌بورد
            await navigator.clipboard.writeText(newSubBase64);
            
            button.classList.add('copied');
            button.textContent = 'کپی شد!';
            showMessage('لینک ساب جدید با موفقیت کپی شد!', false);

        } catch (error) {
            console.error('Processing/Copying Error:', error);
            showMessage("خطا در پردازش یا کپی. ممکن است محتوای لینک ساب استاندارد نباشد.");
        }

        // مرحله ۴: بازگرداندن دکمه‌ها به حالت اولیه
        setTimeout(() => {
            resetButtons();
            button.classList.remove('copied');
        }, 2500);
    }
    
    function resetButtons() {
        navButtons.forEach(btn => {
            btn.disabled = false;
            // پیدا کردن متن اصلی دکمه از یک منبع ثابت یا بازنویسی آن
            const buttonType = btn.getAttribute('data-url').match(/([^/]+)\.html/);
            if (buttonType && buttonType[1] === 'sub') {
                 btn.textContent = "MIX";
            } else if (buttonType) {
                 btn.textContent = buttonType[1].toUpperCase();
            }
        });
    }
});
