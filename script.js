document.addEventListener('DOMContentLoaded', () => {

    const navButtons = document.querySelectorAll('.nav-btn');
    const messageArea = document.getElementById('message-area');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // پراکسی برای دریافت اطلاعات
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

    // --- نمایش پیام به کاربر ---
    function showMessage(text, isError = true) {
        const color = isError ? 'var(--iran-red)' : 'var(--success-color)';
        messageArea.innerHTML = `<p style="color: ${color}; font-weight: bold;">${text}</p>`;
    }

    // --- تابع اصلی برای کپی کردن لینک ساب اصلی ---
    async function copyOriginalSubscription(button) {
        const originalText = button.textContent;

        // قرار دادن دکمه‌ها در حالت انتظار
        navButtons.forEach(btn => btn.disabled = true);
        button.textContent = 'در حال دریافت...';
        messageArea.innerHTML = '';

        const url = button.dataset.url;

        try {
            // ۱. دریافت محتوای خام (که همان لینک Base64 است)
            const encodedUrl = encodeURIComponent(url);
            const response = await fetch(CORS_PROXY + encodedUrl);

            if (!response.ok) {
                throw new Error('خطا در شبکه یا پاسخ ناموفق از سرور پراکسی.');
            }

            const base64Content = (await response.text()).trim();

            if (!base64Content) {
                throw new Error('محتوای دریافتی از لینک ساب خالی است.');
            }

            // ۲. کپی کردن محتوای خام و دست‌نخورده در کلیپ‌بورد
            await navigator.clipboard.writeText(base64Content);

            // ۳. نمایش پیام موفقیت
            button.classList.add('copied');
            button.textContent = 'کپی شد!';
            showMessage(`لینک اصلی ساب ${originalText} با موفقیت کپی شد!`, false);

        } catch (error) {
            console.error('Error in copyOriginalSubscription:', error);
            showMessage('خطا در دریافت یا کپی لینک. لطفاً اتصال اینترنت خود را بررسی کنید.');
            button.textContent = originalText; // بازگرداندن متن دکمه در صورت خطا
        } finally {
            // ۴. بازگرداندن همه دکمه‌ها به حالت اولیه پس از چند ثانیه
            setTimeout(() => {
                button.classList.remove('copied');
                navButtons.forEach(btn => {
                    btn.disabled = false;
                    // برای بازگرداندن نام اصلی دکمه‌ها
                    if (btn.dataset.key) {
                        btn.textContent = btn.dataset.key;
                    }
                });
                 // اطمینان از اینکه متن دکمه کلیک شده هم درست می‌شود
                 button.textContent = originalText;
            }, 2500);
        }
    }

    // افزودن Event Listener به هر دکمه
    navButtons.forEach(button => {
        // ذخیره نام اصلی دکمه برای استفاده در آینده
        button.dataset.key = button.textContent;
        button.addEventListener('click', () => {
            copyOriginalSubscription(button);
        });
    });
});
