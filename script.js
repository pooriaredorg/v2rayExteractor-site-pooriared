document.addEventListener('DOMContentLoaded', () => {
    const subLinks = {
        mix: 'https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/mix/sub.html',
        vless: 'https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/vless.html',
        vmess: 'https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/vmess.html',
        trojan: 'https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/trojan.html',
        ss: 'https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/ss.html',
        hy2: 'https://raw.githubusercontent.com/arshiacomplus/v2rayExtractor/refs/heads/main/hy2.html'
    };

    const menuButtons = document.querySelectorAll('.menu-btn');
    const configListContainer = document.getElementById('config-list-container');
    const testConfigsBtn = document.getElementById('test-configs-btn');
    const copyAllBtn = document.getElementById('copy-all-btn');
    const loader = document.getElementById('loader');

    let activeBtn = null;
    let currentConfigs = [];

    // Event listeners for menu buttons
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
        loader.style.display = 'block';
        testConfigsBtn.disabled = true;
        copyAllBtn.disabled = true;
        currentConfigs = [];

        try {
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const response = await fetch(proxyUrl + encodeURIComponent(url));
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const base64Content = await response.text();
            const decodedContent = atob(base64Content.trim());
            const configs = decodedContent.split(/\r?\n/).filter(Boolean);

            currentConfigs = configs.map((config, index) => {
                const hashIndex = config.indexOf('#');
                const newName = `pooriared${index + 1}`;
                let newConfig;
                if (hashIndex !== -1) {
                    newConfig = config.substring(0, hashIndex) + '#' + encodeURIComponent(newName);
                } else {
                    newConfig = config + '#' + encodeURIComponent(newName);
                }
                return { name: newName, value: newConfig };
            });

            displayConfigs(currentConfigs);
            testConfigsBtn.disabled = false;
            copyAllBtn.disabled = false;

        } catch (error) {
            console.error('Fetch error:', error);
            configListContainer.innerHTML = `<p style="color:var(--iran-red);">خطا در دریافت کانفیگ‌ها: ${error.message}</p>`;
        } finally {
            loader.style.display = 'none';
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
        
        // Add event listeners for new copy buttons
        document.querySelectorAll('.copy-single-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const configValue = e.currentTarget.closest('.config-item').dataset.configValue;
                navigator.clipboard.writeText(configValue);
                e.currentTarget.innerHTML = '<i class="fa-solid fa-check" style="color: var(--iran-green);"></i>';
                setTimeout(() => {
                   e.currentTarget.innerHTML = '<i class="fa-solid fa-paste"></i>';
                }, 2000);
            });
        });
    }

    // --- Latency Test Logic ---
    async function getLatency(address) {
        const url = `https://${address}/cdn-cgi/trace`;
        const startTime = performance.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        try {
            const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, { signal: controller.signal });
            const endTime = performance.now();
            clearTimeout(timeoutId);
            return Math.round(endTime - startTime);
        } catch (error) {
            clearTimeout(timeoutId);
            return -1; // Indicate error/timeout
        }
    }

    testConfigsBtn.addEventListener('click', async () => {
        testConfigsBtn.disabled = true;
        const promises = currentConfigs.map(async (config) => {
            const latencyEl = document.getElementById(`latency-${config.name}`);
            latencyEl.textContent = 'تست...';
            latencyEl.className = 'config-latency testing';

            // Extract server address from config
            let address = '';
            try {
                const urlPart = config.value.split('://')[1];
                address = urlPart.split('@')[1].split(':')[0].split('?')[0];
            } catch (e) {
                // If parsing fails
            }

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
                if (latency < 300) latencyEl.className = 'config-latency fast';
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
        setTimeout(() => {
            copyAllBtn.innerHTML = originalText;
        }, 2000);
    });

});
