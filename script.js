@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;600;700&display=swap');

:root {
    --bg-color: #0d1117;
    --primary-color: #161b22;
    --secondary-color: #21262d;
    --border-color: #30363d;
    --text-color: #c9d1d9;
    --text-secondary: #8b949e;
    --iran-green: #239f40;
    --iran-white: #ffffff;
    --iran-red: #da0037;
    --font-family: 'Vazirmatn', sans-serif;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    font-family: var(--font-family);
    margin: 0;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    overflow-x: hidden;
}

.background-animation {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(-45deg, #0d1117, #1a0c1e, #0d1117, #1e1a0c);
    background-size: 400% 400%;
    animation: gradientBG 15s ease infinite;
    z-index: -1;
}

@keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.container {
    width: 100%;
    max-width: 900px;
    background-color: rgba(22, 27, 34, 0.85);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    padding: 25px 35px;
    text-align: center;
    animation: fadeIn 0.8s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

.iran-flag-bar {
    height: 5px;
    width: 100%;
    background: linear-gradient(to left, var(--iran-green), var(--iran-white), var(--iran-red));
    border-radius: 5px 5px 0 0;
    position: absolute;
    top: 0;
    left: 0;
}

header h1 {
    font-weight: 700;
    font-size: 2.2em;
    color: var(--iran-white);
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    margin-top: 20px;
}

header p {
    color: var(--text-secondary);
    font-size: 1.1em;
}

.menu {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px; /* فاصله بیشتر بین دکمه ها */
    margin: 40px 0;
}

.menu-btn {
    background-color: transparent;
    color: var(--text-color);
    border: 2px solid var(--border-color);
    padding: 12px 30px;
    border-radius: 8px;
    cursor: pointer;
    font-family: var(--font-family);
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.menu-btn:before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background: linear-gradient(to left, var(--iran-green), var(--iran-red));
    transition: width 0.3s ease;
}

.menu-btn:hover, .menu-btn.active {
    border-color: var(--iran-green);
    color: var(--iran-white);
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(35, 159, 64, 0.2);
}

.menu-btn.active:before {
    width: 100%;
}

.main-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 25px;
}

.action-btn {
    background-color: var(--secondary-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-family: var(--font-family);
    font-size: 15px;
    transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
    border-color: var(--iran-red);
    color: var(--iran-white);
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.action-btn i {
    margin-left: 8px;
}

.loader {
    width: 50px;
    height: 50px;
    border: 5px solid var(--secondary-color);
    border-top: 5px solid var(--iran-green);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 40px auto;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

#config-list-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    text-align: right;
}

.config-item {
    background-color: var(--secondary-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    animation: slideInUp 0.5s ease-out;
    transition: all 0.3s ease;
}

@keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.config-item:hover {
    border-color: var(--iran-green);
    transform: scale(1.02);
}

.config-name {
    font-weight: 600;
    font-size: 1.1em;
    flex-grow: 1;
}

.config-latency {
    font-family: monospace;
    font-size: 1.1em;
    margin: 0 20px;
    padding: 5px 10px;
    border-radius: 6px;
    min-width: 80px;
    text-align: center;
}
.config-latency.fast { color: #4CAF50; }
.config-latency.medium { color: #FFC107; }
.config-latency.slow { color: #F44336; }
.config-latency.testing { color: #2196F3; }

.config-actions button {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 1.2em;
    cursor: pointer;
    margin: 0 5px;
    transition: color 0.3s;
}

.config-actions button:hover {
    color: var(--iran-white);
}

footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
    color: var(--text-secondary);
}

footer a {
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.3s;
}

footer a:hover {
    color: var(--iran-white);
}

footer i {
    color: var(--iran-red);
    margin-left: 5px;
}
