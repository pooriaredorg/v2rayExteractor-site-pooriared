document.addEventListener('DOMContentLoaded', () => {

    // --- انتخاب عناصر DOM ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const configsContainer = document.getElementById('configs-container');
    const loadingSpinner = document.getElementById('loading');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // --- URL پراکسی برای دور زدن محدودیت CORS ---
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
    
    let activeBtn = null;

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

    // بارگذاری تم ذخیره شده در اولین ورود
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);


    // --- افزودن Event Listener به دکمه‌های منو ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const subUrl = button.dataset.url;
            
            // مدیریت استایل دکمه فعال
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
        loadingSpinner.style.display = 'block';

        try {
            // استفاده از پراکسی برای جلوگیری از خطای CORS
            const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error(`خطا در دریافت اطلاعات: ${response.statusText}`);
            }
            const base64Data = await response.text();
            
            // رمزگشایی از Base64
            const decodedData = atob(base64Data);
            
            // جداسازی کانفیگ‌ها بر اساس خط جدید
            const configs = decodedData.split(/\r?\n/).filter(line => line.trim() !== '');

            // شخصی‌سازی و نمایش کانفیگ‌ها
            processAndRenderConfigs(configs);

        } catch (error) {
            console.error('یک خطا رخ داد:', error);
            configsContainer.innerHTML = `<p style="color: var(--iran-red); text-align: center;">متاسفانه در دریافت کانفیگ‌ها مشکلی پیش آمد. لطفا دوباره تلاش کنید.</p>`;
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // --- تابع برای پردازش و رندر کردن کانفیگ‌ها در صفحه ---
    function processAndRenderConfigs(configs) {
        if (configs.length === 0) {
            configsContainer.innerHTML = `<p style="text-align: center;">هیچ کانفیگی برای نمایش یافت نشد.</p>`;
            return;
        }

        configs.forEach((config, index) => {
            // شخصی‌سازی نام کانفیگ
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
        
        // پیدا کردن قسمت نام (بعد از #) و جایگزینی آن
        if (config.includes('#')) {
            return config.substring(0, config.indexOf('#') + 1) + newName;
        } else {
            // اگر کانفیگ نام نداشت، نام جدید به آن اضافه می‌شود
            return `${config}#${newName}`;
        }
    }

    // --- مدیریت رویداد کپی ---
    configsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('copy-btn')) {
            const button = event.target;
            const configItem = button.closest('.config-item');
            const configText = configItem.querySelector('.config-text').textContent;

            // کپی کردن متن در کلیپ‌بورد
            navigator.clipboard.writeText(configText).then(() => {
                // اطلاع‌رسانی به کاربر
                button.textContent = 'کپی شد!';
                button.classList.add('copied');

                // بازگرداندن دکمه به حالت اولیه بعد از ۲ ثانیه
                setTimeout(() => {
                    button.textContent = 'کپی';
                    button.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('خطا در کپی کردن:', err);
                button.textContent = 'خطا!';
            });
        }
    });

});
