document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const themeToggle = document.getElementById('theme-toggle');
    const menuButtons = document.querySelectorAll('.menu-btn');
    const configListContainer = document.getElementById('config-list-container');
    const testConfigsBtn = document.getElementById('test-configs-btn');
    const copyAllBtn = document.getElementById('copy-all-btn');
    const loader = document.getElementById('loader');
    const statusMessage = document.getElementById('status-message');

    // --- State ---
    let activeBtn = null;
    let currentConfigs = [];
    const subLinks = {
        mix: 'https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/mix/sub.html',
        vless: 'https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/vless.html',
        vmess: 'https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/vmess.html',
        trojan: 'https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/trojan.html',
        ss: 'https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/ss.html',
        hy2: 'https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/hy2.html'
    };

    // --- Theme Switcher ---
    const currentTheme = localStorage.getItem('theme') || 'dark';
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
        statusMessage.className = type;
        statusMessage.style.display = 'block';
    }

    function hideStatus() {
        statusMessage.style.display = 'none';
    }

    function updateActionButtonsState() {
        const hasConfigs = currentConfigs.length > 0;
        testConfigsBtn.disabled = !hasConfigs;
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
            // Using a more reliable CORS proxy
            const proxyUrl = 'https://api.cors.lol/raw?url=';
            const response = await fetch(proxyUrl + encodeURIComponent(url));
            
            if (!response.ok) {
                throw new Error(`خطا در شبکه: سرور پاسخی با کد ${response.status} برگرداند.`);
            }

            const rawContent = await response.text();
            
            // Check if the content is likely Base64 before decoding
            // This is a simple check; a more robust one might be needed if issues persist
            if (rawContent.includes('<html')) {
                 throw new Error("محتوای دریافت شده یک فایل HTML است، نه رشته Base64.");
            }
            
            let decodedContent;
            try {
                decodedContent = atob(rawContent.trim());
            } catch (e) {
                console.error("atob error:", e);
                throw new Error("خطای atob: رشته دریافت شده به فرمت صحیح Base64 نیست.");
            }

            const configs = decodedContent.split(/\r?\n/).filter(Boolean); // filter(Boolean) removes empty lines

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
            item.dataset.configValue = config.value;
            item.innerHTML = `
                <span class="config-name">${config.name}</span>
                <span class="config-latency" id="latency-${config.name}">- ms</span>
                <div class="config-actions">
                    <button class="copy-single-btn" title="کپی کردن کانفیگ"><i class="fa-solid fa-paste"></i></button>
                </div>
            `;
            configListContainer.appendChild(item);
        });
        
        document.querySelectorAll('.copy-single-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const configValue = e.currentTarget.closest('.config-item').dataset.configValue;
                navigator.clipboard.writeText(configValue);
                e.currentTarget.innerHTML = '<i class="fa-solid fa-check" style="color: var(--success-color);"></i>';
                setTimeout(() => {
                   e.currentTarget.innerHTML = '<i class="fa-solid fa-paste"></i>';
                }, 2000);
            });
        });
    }

    // --- Latency Test Logic ---
    async function getLatency(address) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

        const startTime = performance.now();
        try {
            // We ping a known lightweight endpoint on the server address.
            // Using a proxy to bypass browser CORS limitations for this test too.
            await fetch(`https://api.cors.lol/raw?url=https://${address}/cdn-cgi/trace`, { signal: controller.signal, method: 'HEAD' });
            const endTime = performance.now();
            return Math.round(endTime - startTime);
        } catch (error) {
            return -1; // Indicate error/timeout
        } finally {
            clearTimeout(timeoutId);
        }
    }

    testConfigsBtn.addEventListener('click', async () => {
        testConfigsBtn.disabled = true;
        const promises = currentConfigs.map(async (config) => {
            const latencyEl = document.getElementById(`latency-${config.name}`);
            if (!latencyEl) return;
            
            latencyEl.textContent = '...';
            latencyEl.className = 'config-latency testing';

            let address = '';
            try {
                // Improved parsing for vless, vmess, trojan etc.
                const urlPart = config.value.split('://')[1];
                const atIndex = urlPart.indexOf('@');
                address = urlPart.substring(atIndex + 1).split(/[:?#]/)[0];
            } catch (e) { /* Parsing failed */ }
            
            if (!address) {
                 latencyEl.textContent = 'نامعتبر';
                 latencyEl.className = 'config-latency slow';
                 return;
            }

            const latency = await getLatency(address);
            
            if (latency === -1) {
                latencyEl.textContent = 'Timeout';
                latencyEl.className = 'config-latency slow';
            } else {
                latencyEl.textContent = `${latency} ms`;
                if (latency < 350) latencyEl.className = 'config-latency fast';
                else if (latency < 800) latencyEl.className = 'config-latency medium';
                else latencyEl.className = 'config-latency slow';
            }
        });

        await Promise.all(promises);
        testConfigsBtn.disabled = false;
    });

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
