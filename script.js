document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const themeToggle = document.getElementById('theme-toggle');
    const menuButtons = document.querySelectorAll('.menu-btn');
    const configListContainer = document.getElementById('config-list-container');
    const copyAllBtn = document.getElementById('copy-all-btn');
    const loader = document.getElementById('loader');
    const statusMessage = document.getElementById('status-message');

    // --- State ---
    let activeBtn = null;
    let currentConfigs = [];

    // *** CRITICAL FIX: Using jsDelivr CDN to fetch directly from GitHub without CORS issues ***
    const subLinks = {
        mix: 'https://cdn.jsdelivr.net/gh/arshiacomplus/v2rayExtractor@main/mix/sub.html',
        vless: 'https://cdn.jsdelivr.net/gh/arshiacomplus/v2rayExtractor@main/vless.html',
        vmess: 'https://cdn.jsdelivr.net/gh/arshiacomplus/v2rayExtractor@main/vmess.html',
        trojan: 'https://cdn.jsdelivr.net/gh/arshiacomplus/v2rayExtractor@main/trojan.html',
        ss: 'https://cdn.jsdelivr.net/gh/arshiacomplus/v2rayExtractor@main/ss.html',
        hy2: 'https://cdn.jsdelivr.net/gh/arshiacomplus/v2rayExtractor@main/hy2.html'
    };

    // --- Theme Switcher ---
    // Set default theme to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.dataset.theme = currentTheme;
    themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';

    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        document.body.dataset.theme = newTheme;
        themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('theme', newTheme);
    });

    // --- Core Logic ---
    function showStatus(message, type = 'error') {
        statusMessage.textContent = message;
        statusMessage.className = `status-${type}`;
        statusMessage.style.display = 'block';
    }

    function hideStatus() {
        statusMessage.style.display = 'none';
    }

    function updateActionButtonsState() {
        const hasConfigs = currentConfigs.length > 0;
        copyAllBtn.disabled = !hasConfigs;
    }

    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;
            if (button.classList.contains('active')) return;
            
            if (activeBtn) activeBtn.classList.remove('active');
            button.classList.add('active');
            activeBtn = button;

            fetchAndProcessConfigs(type);
        });
    });

    async function fetchAndProcessConfigs(type) {
        const url = subLinks[type];
        if (!url) return;

        configListContainer.innerHTML = '';
        hideStatus();
        loader.style.display = 'block';
        currentConfigs = [];
        updateActionButtonsState();

        try {
            // ** NO PROXY NEEDED ANYMORE **
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`خطا در شبکه: سرور پاسخی با کد ${response.status} برگرداند.`);
            }

            const rawContent = await response.text();
            
            if (!rawContent || rawContent.includes('<html')) {
                 throw new Error("فایل دریافت شده خالی است یا فرمت درستی ندارد.");
            }
            
            let decodedContent;
            try {
                decodedContent = atob(rawContent.trim());
            } catch (e) {
                console.error("atob error:", e);
                throw new Error("خطای atob: رشته دریافت شده به فرمت صحیح Base64 نیست. این معمولا به معنی مشکل در لینک ساب اصلی است.");
            }

            const configs = decodedContent.split(/\r?\n/).filter(Boolean);

            currentConfigs = configs.map((config, index) => {
                const hashIndex = config.indexOf('#');
                const newName = `pooriared${index + 1}`;
                const newConfig = (hashIndex !== -1)
                    ? config.substring(0, hashIndex) + '#' + encodeURIComponent(newName)
                    : config + '#' + encodeURIComponent(newName);
                
                return { name: newName, value: newConfig };
            });

            if(currentConfigs.length === 0){
                 showStatus("هیچ کانفیگ معتبری در این لینک یافت نشد.", 'warning');
            } else {
                displayConfigs(currentConfigs);
            }
            
        } catch (error) {
            console.error('خطای اصلی:', error);
            showStatus(error.message);
        } finally {
            loader.style.display = 'none';
            updateActionButtonsState();
        }
    }

    function displayConfigs(configs) {
        configListContainer.innerHTML = '';
        configs.forEach(config => {
            const item = document.createElement('div');
            item.className = 'config-item';
            // Simplified item, removed latency display
            item.innerHTML = `
                <span class="config-name">${config.name}</span>
                <div class="config-actions">
                    <button class="copy-single-btn" title="کپی کردن کانفیگ" data-config-value="${config.value}"><i class="fa-solid fa-paste"></i></button>
                </div>
            `;
            configListContainer.appendChild(item);
        });
        
        configListContainer.addEventListener('click', function(e) {
            const copyButton = e.target.closest('.copy-single-btn');
            if (copyButton) {
                e.preventDefault();
                e.stopPropagation();
                
                const configToCopy = copyButton.dataset.configValue;
                
                if (configToCopy) {
                    navigator.clipboard.writeText(configToCopy).then(() => {
                        copyButton.innerHTML = '<i class="fa-solid fa-check" style="color: var(--success-color);"></i>';
                        setTimeout(() => {
                           copyButton.innerHTML = '<i class="fa-solid fa-paste"></i>';
                        }, 2000);
                    }).catch(err => {
                        console.error("خطا در کپی کردن: ", err);
                        alert("خطا در کپی کردن کانفیگ!");
                    });
                }
            }
        });
    }

    // --- Copy All Logic ---
    copyAllBtn.addEventListener('click', () => {
        if (currentConfigs.length === 0) return;
        const allConfigsString = currentConfigs.map(c => c.value).join('\n');
        const finalBase64 = btoa(allConfigsString);
        navigator.clipboard.writeText(finalBase64);

        const originalText = copyAllBtn.innerHTML;
        copyAllBtn.innerHTML = '<i class="fa-solid fa-check"></i> کپی شد!';
        copyAllBtn.style.borderColor = 'var(--success-color)';
        setTimeout(() => {
            copyAllBtn.innerHTML = originalText;
            copyAllBtn.style.borderColor = '';
        }, 2000);
    });
});
