document.addEventListener('DOMContentLoaded', () => {
    const configUrls = {
        mix: "https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/mix/sub.html",
        vless: "https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/vless.html",
        vmess: "https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/vmess.html",
        trojan: "https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/trojan.html",
        ss: "https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/ss.html",
        hy2: "https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/hy2.html"
    };

    const navLinks = document.querySelectorAll('nav ul li a');
    const configsDisplay = document.getElementById('configs');
    const copyButton = document.getElementById('copy-button');
    let currentConfigs = ""; // برای نگهداری کانفیگ‌های فعلی برای کپی

    // تابعی برای شخصی‌سازی نام کانفیگ‌ها
    function personalizeConfigs(configs) {
        const lines = configs.split('\n');
        let personalizedLines = [];
        let counter = 1;

        for (const line of lines) {
            if (line.trim() !== '') {
                // تلاش برای یافتن نوع پروتکل و جایگزینی نام
                if (line.startsWith('vmess://')) {
                    try {
                        const decoded = JSON.parse(atob(line.substring(8)));
                        decoded.ps = `pooriared${counter}`;
                        personalizedLines.push('vmess://' + btoa(JSON.stringify(decoded)));
                    } catch (e) {
                        personalizedLines.push(line); // اگر مشکلی بود، خط اصلی را برگردان
                    }
                } else if (line.includes('#')) {
                    // برای VLESS, Trojan, SS, Hy2 که معمولا نام بعد از # میاد
                    const parts = line.split('#');
                    parts[parts.length - 1] = `pooriared${counter}`;
                    personalizedLines.push(parts.join('#'));
                } else {
                    personalizedLines.push(line); // اگر الگوی خاصی نداشت، خط را همانطور که هست اضافه کن
                }
                counter++;
            }
        }
        return personalizedLines.join('\n');
    }

    // تابعی برای دریافت و نمایش کانفیگ‌ها
    async function fetchAndDisplayConfigs(type) {
        const url = configUrls[type];
        if (!url) {
            configsDisplay.textContent = "نوع کانفیگ نامعتبر.";
            return;
        }

        configsDisplay.textContent = "در حال بارگذاری کانفیگ‌ها...";
        currentConfigs = ""; // ریست کردن کانفیگ‌های فعلی

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`خطا در دریافت کانفیگ‌ها: ${response.statusText}`);
            }
            const data = await response.text();
            const personalizedData = personalizeConfigs(data);
            configsDisplay.textContent = personalizedData;
            currentConfigs = personalizedData; // ذخیره برای کپی
        } catch (error) {
            configsDisplay.textContent = `خطا: ${error.message}`;
            console.error("Fetch error:", error);
        }
    }

    // اضافه کردن event listener به لینک‌های ناوبری
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            const type = e.target.dataset.type;
            fetchAndDisplayConfigs(type);
        });
    });

    // اضافه کردن event listener برای کپی دکمه
    copyButton.addEventListener('click', () => {
        if (currentConfigs) {
            navigator.clipboard.writeText(currentConfigs)
                .then(() => {
                    alert('کانفیگ‌ها با موفقیت کپی شدند!');
                })
                .catch(err => {
                    console.error('خطا در کپی کردن: ', err);
                    alert('خطا در کپی کردن کانفیگ‌ها.');
                });
        } else {
            alert('هیچ کانفیگی برای کپی کردن وجود ندارد.');
        }
    });

    // بارگذاری پیش‌فرض Mix در ابتدا
    const initialType = 'mix';
    const initialLink = document.querySelector(`[data-type="${initialType}"]`);
    if (initialLink) {
        initialLink.classList.add('active');
        fetchAndDisplayConfigs(initialType);
    }
});