document.addEventListener('DOMContentLoaded', () => {

    const navButtons = document.querySelectorAll('.nav-btn');
    const messageArea = document.getElementById('message-area');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // استفاده از یک پراکسی دیگر به عنوان آخرین تلاش برای پایداری
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
        messageArea.innerHTML = `<p style="color: ${isError ? 'var(--iran-red)' : 'var(--success-color)'}; font-weight: bold;">${text}</p>`;
    }
    
    // بازگرداندن دکمه‌ها به حالت اولیه
    function resetButtons() {
        navButtons.forEach(btn => {
            btn.disabled = false;
            const buttonType = btn.getAttribute('data-key');
            btn.textContent = buttonType;
        });
    }

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
        
        // مرحله ۱: دریافت اطلاعات
        try {
            const encodedUrl = encodeURIComponent(url);
            const response = await fetch(CORS_PROXY + encodedUrl);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
            base64Data = (await response.text()).trim();
            if (!base64Data) throw new Error("پاسخ دریافتی از لینک ساب خالی است.");
        } catch (error) {
            console.error('Fetch Error:', error);
            showMessage("خطا در دریافت اطلاعات. لطفا از اتصال اینترنت خود مطمئن شوید و دوباره تلاش کنید.");
            resetButtons();
            return;
        }

        // مرحله ۲: پردازش و شخصی‌سازی با روش مدرن
        try {
            // رمزگشایی صحیح Base64 به رشته UTF-8 (برای پشتیبانی از ایموجی)
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

            // رمزگذاری صحیح رشته UTF-8 به Base64 (برای پشتیبانی از ایموجی)
            const newBytes = new TextEncoder().encode(newSubContent);
            let newBinaryString = '';
            newBytes.forEach((byte) => {
                newBinaryString += String.fromCharCode(byte);
            });
            const newSubBase64 = btoa(newBinaryString);


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
            button.classList.remove('copied');
            resetButtons();
        }, 2500);
    }

    // افزودن Event Listener به دکمه‌ها
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            processAndCopySubscription(button);
        });
    });
});
