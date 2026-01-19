// ==UserScript==
// @name         豆包&即梦AI下载无水印图片视频
// @namespace    http://tampermonkey.net/
// @version      2.11
// @description  实现豆包&即梦生成的图片视频免费无水印下载
// @author       11208596
// @license      UNLICENSED
// @match        https://www.doubao.com/*
// @match        https://jimeng.jianying.com/ai-tool/*
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @downloadURL https://cdn.jsdelivr.net/gh/Jouleken/Hello-World/js/jm-silent.user.js
// @updateURL https://cdn.jsdelivr.net/gh/Jouleken/Hello-World/js/jm-silent.user.js
// ==/UserScript==

(function () {
    'use strict';

    // 修改确认对话框样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes dialogShow {
            from {
                opacity: 0;
                transform: translate(-50%, -48%) scale(0.96);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }

        @keyframes overlayShow {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .download-confirm-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            padding: 28px 24px;
            border-radius: 14px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
                        0 0 0 1px rgba(0, 0, 0, 0.05);
            z-index: 10000;
            min-width: 320px;
            max-width: 400px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
            animation: dialogShow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .download-confirm-dialog h3 {
            margin: 0 0 8px 0;
            color: #1d1d1f;
            font-size: 19px;
            font-weight: 600;
            letter-spacing: -0.022em;
        }

        .download-confirm-dialog p {
            margin: 0 0 20px 0;
            color: #86868b;
            font-size: 14px;
            line-height: 1.4;
            letter-spacing: -0.016em;
        }

        .download-confirm-dialog .input-container {
            margin: 20px 0;
            text-align: left;
        }

        .download-confirm-dialog label {
            display: block;
            margin-bottom: 8px;
            color: #1d1d1f;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: -0.016em;
        }

        .download-confirm-dialog input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            font-size: 15px;
            color: #1d1d1f;
            background: rgba(255, 255, 255, 0.8);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-sizing: border-box;
        }

        .download-confirm-dialog input:focus {
            outline: none;
            border-color: #0071e3;
            box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.15);
            background: #ffffff;
        }

        .download-confirm-dialog .buttons {
            margin-top: 28px;
            display: flex;
            gap: 12px;
            justify-content: center;
        }

        .download-confirm-dialog button {
            min-width: 128px;
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: -0.016em;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .download-confirm-dialog .confirm-btn {
            background: #0071e3;
            color: white;
            transform: scale(1);
        }

        .download-confirm-dialog .confirm-btn:hover {
            background: #0077ED;
            transform: scale(1.02);
        }

        .download-confirm-dialog .confirm-btn:active {
            transform: scale(0.98);
        }

        .download-confirm-dialog .confirm-btn:disabled {
            background: #999999;
            cursor: not-allowed;
            opacity: 0.7;
            transform: scale(1);
        }

        .download-confirm-dialog .cancel-btn {
            background: rgba(0, 0, 0, 0.05);
            color: #1d1d1f;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }

        .download-confirm-dialog .cancel-btn:hover {
            background: rgba(0, 0, 0, 0.1);
        }

        .download-confirm-dialog .cancel-btn:active {
            background: rgba(0, 0, 0, 0.15);
        }

        .download-confirm-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            z-index: 9999;
            animation: overlayShow 0.3s ease-out;
        }

        @media (prefers-color-scheme: dark) {
            .download-confirm-dialog {
                background: rgba(40, 40, 45, 0.8);
            }

            .download-confirm-dialog h3 {
                color: #ffffff;
            }

            .download-confirm-dialog p {
                color: #98989d;
            }

            .download-confirm-dialog label {
                color: #ffffff;
            }

            .download-confirm-dialog input {
                background: rgba(60, 60, 65, 0.8);
                border-color: rgba(255, 255, 255, 0.1);
                color: #ffffff;
            }

            .download-confirm-dialog input:focus {
                background: rgba(70, 70, 75, 0.8);
            }

            .download-confirm-dialog .cancel-btn {
                background: rgba(255, 255, 255, 0.1);
                color: #ffffff;
            }

            .download-confirm-dialog .cancel-btn:hover {
                background: rgba(255, 255, 255, 0.15);
            }
        }

        .download-confirm-dialog .tip {
            font-size: 12px;
            color: #86868b;
            margin-top: 6px;
            text-align: left;
        }

        .download-confirm-dialog .progress-text {
            margin-top: 12px;
            font-size: 13px;
            color: #1d1d1f;
            letter-spacing: -0.016em;
        }

        .download-confirm-dialog .success-icon {
            display: inline-block;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #00c853;
            position: relative;
            margin-right: 6px;
            transform: scale(0);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .download-confirm-dialog .success-icon:after {
            content: '';
            position: absolute;
            width: 8px;
            height: 4px;
            border: 2px solid white;
            border-top: 0;
            border-right: 0;
            transform: rotate(-45deg);
            top: 4px;
            left: 4px;
        }

        .download-confirm-dialog .success-icon.show {
            transform: scale(1);
        }

        @media (prefers-color-scheme: dark) {
            .download-confirm-dialog .tip {
                color: #98989d;
            }
            .download-confirm-dialog .progress-text {
                color: #ffffff;
            }
        }

        .floating-tip {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            padding: 12px 20px;
            border-radius: 10px;
            color: white;
            font-size: 14px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
            display: flex;
            align-items: center;
            gap: 8px;
            pointer-events: none;
        }

        .floating-tip.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }

        .floating-tip .icon {
            width: 18px;
            height: 18px;
            background: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            color: #000;
        }

        @media (prefers-color-scheme: dark) {
            .floating-tip {
                background: rgba(255, 255, 255, 0.9);
                color: #1d1d1f;
            }
            .floating-tip .icon {
                background: #1d1d1f;
                color: #fff;
            }
        }

        .usage-tip {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            padding: 16px 24px;
            border-radius: 12px;
            color: white;
            font-size: 15px;
            line-height: 1.4;
            z-index: 9999;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            max-width: 90%;
            width: auto;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .usage-tip.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }

        .usage-tip .icon {
            font-size: 24px;
            flex-shrink: 0;
        }

        .usage-tip .content {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .usage-tip .main-text {
            font-weight: 500;
        }

        .usage-tip .contact {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.8);
        }

        @media (prefers-color-scheme: dark) {
            .usage-tip {
                background: rgba(255, 255, 255, 0.95);
                color: #1d1d1f;
                border: 1px solid rgba(0, 0, 0, 0.1);
            }
            .usage-tip .contact {
                color: rgba(0, 0, 0, 0.6);
            }
        }
    `;
    document.head.appendChild(style);

    // 获取当前网站域名
    const currentDomain = window.location.hostname;

    // 创建确认对话框
    function createConfirmDialog(mediaUrl, mediaType, downloadFunction) {
        const overlay = document.createElement('div');
        overlay.className = 'download-confirm-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'download-confirm-dialog';

        // 获取当前日期时间
        const now = new Date();
        const dateStr = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}`;

        // 获取提示词
        let promptText = '';
        // 根据不同类型使用不同的选择器
        let promptElement;
        if (mediaType === 'video') {
            // 视频页面的提示词选择器
            promptElement = document.querySelector('span.lv-typography[class*="promptText-sTGKI"]');
        } else {
            // 图片页面的提示词选择器 - 添加豆包新的选择器
            promptElement = document.querySelector('span.lv-typography[class*="promptText-"]') ||
                           document.querySelector('.message-text-aF_36u[data-testid="message_text_content"]');
        }

        if (promptElement) {
            // 获取完整的提示词文本
            let text = promptElement.textContent.trim();

            // 如果是豆包的提示词，移除"帮我生成图片："前缀
            if (text.startsWith('帮我生成图片：')) {
                text = text.replace('帮我生成图片：', '');
            }

            promptText = text
                // 移除多余的空格和换行
                .replace(/\s+/g, ' ')
                // 移除引号和破折号
                .replace(/^[""]-|[""]$/g, '')
                // 移除文件名中的非法字符
                .replace(/[\\/:*?"<>|]/g, '_')
                // 移除比例信息
                .replace(/比例「\d+:\d+」/, '')
                .trim()
                .substring(0, 100); // 限制长度

            console.log(`获取到的${mediaType}提示词:`, promptText); // 调试用
        } else {
            console.log(`未找到${mediaType}提示词元素`); // 调试用
        }

        // 默认文件名使用提示词，如果没有提示词则使用日期
        const defaultFileName = promptText || dateStr;

        dialog.innerHTML = `
            <h3>下载${mediaType === 'video' ? '视频' : '图片'}</h3>
            <p>请确认下载信息</p>
            <div class="input-container">
                <label for="fileName">文件名称</label>
                <input type="text"
                       id="fileName"
                       value="${defaultFileName}"
                       placeholder="请输入文件名称"
                       spellcheck="false"
                       autocomplete="off">
                <div class="tip">提示：右键点击${mediaType === 'video' ? '视频' : '图片'}即可下载，文件名将自动使用AI提示词</div>
            </div>
            <div class="progress-text" style="display: none;">
                <span class="success-icon"></span>
                <span class="status-text"></span>
            </div>
            <div class="buttons">
                <button class="cancel-btn">取消</button>
                <button class="confirm-btn">下载</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        const confirmBtn = dialog.querySelector('.confirm-btn');
        const cancelBtn = dialog.querySelector('.cancel-btn');
        const fileNameInput = dialog.querySelector('#fileName');

        const progressText = dialog.querySelector('.progress-text');
        const statusText = dialog.querySelector('.status-text');
        const successIcon = dialog.querySelector('.success-icon');

        function closeDialog() {
            document.body.removeChild(overlay);
            document.body.removeChild(dialog);
        }

        function handleDownloadProgress(percent) {
            if (percent) {
                progressText.style.display = 'block';
                statusText.textContent = `正在下载...${percent}%`;
            }
        }

        function handleDownloadSuccess() {
            confirmBtn.style.display = 'none';
            progressText.style.display = 'block';
            successIcon.classList.add('show');
            statusText.textContent = '下载完成';
            setTimeout(() => {
                closeDialog();
            }, 1500);
        }

        function handleDownloadError(error) {
            progressText.style.display = 'block';
            statusText.textContent = `下载失败: ${error}`;
            statusText.style.color = '#ff3b30';
            confirmBtn.disabled = false;
            confirmBtn.textContent = '重试';
        }

        confirmBtn.addEventListener('click', () => {
            confirmBtn.disabled = true;
            confirmBtn.textContent = '准备下载...';
            const customFileName = fileNameInput.value.trim();

            downloadFunction(
                mediaUrl,
                handleDownloadSuccess,
                customFileName,
                handleDownloadProgress,
                handleDownloadError
            );
        });

        cancelBtn.addEventListener('click', closeDialog);
    }

    // 处理视频URL,移除水印
    function processVideoUrl(url) {
        try {
            if (url.includes('vlabvod.com')) {
                const urlObj = new URL(url);
                const paramsToRemove = [
                    'lr', 'watermark', 'display_watermark_busi_user',
                    'cd', 'cs', 'ds', 'ft', 'btag', 'dy_q', 'feature_id'
                ];

                paramsToRemove.forEach(param => {
                    urlObj.searchParams.delete(param);
                });

                if (urlObj.searchParams.has('br')) {
                    const br = parseInt(urlObj.searchParams.get('br'));
                    urlObj.searchParams.set('br', Math.max(br, 6000).toString());
                    urlObj.searchParams.set('bt', Math.max(br, 6000).toString());
                }

                urlObj.searchParams.delete('l');
                return urlObj.toString();
            }
            return url;
        } catch (e) {
            console.error('处理视频URL时出错:', e);
            return url;
        }
    }

    // 获取真实视频URL
    async function getRealVideoUrl(videoElement) {
        let videoUrl = videoElement.src;
        if (!videoUrl) {
            const sourceElement = videoElement.querySelector('source');
            if (sourceElement) {
                videoUrl = sourceElement.src;
            }
        }
        if (!videoUrl) {
            videoUrl = videoElement.getAttribute('data-src');
        }
        return videoUrl;
    }

    // 获取文件扩展名
    function getFileExtension(url) {
        const extension = url.split('?')[0].match(/\.(jpg|jpeg|png|gif|mp4|webm)$/i);
        return extension ? extension[0] : '.jpg';
    }

    // 下载图片的函数
    function downloadImage(imageUrl, callback, customFileName, onProgress, onError) {
        const fileExtension = getFileExtension(imageUrl);
        const fileName = customFileName ? `${customFileName}${fileExtension}` : getFileNameFromUrl(imageUrl);

        GM_xmlhttpRequest({
            method: 'GET',
            url: imageUrl,
            responseType: 'blob',
            headers: {
                'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Referer': currentDomain.includes('doubao') ?
                          'https://www.doubao.com/' :
                          'https://jimeng.jianying.com/',
                'Origin': currentDomain.includes('doubao') ?
                         'https://www.doubao.com' :
                         'https://jimeng.jianying.com',
                'User-Agent': navigator.userAgent
            },
            onprogress: function(progress) {
                if (progress.lengthComputable) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    if (onProgress) onProgress(percent);
                }
            },
            onload: function(response) {
                if (response.status === 200) {
                    const blob = response.response;
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                    if (callback) callback();
                } else {
                    if (onError) onError(`HTTP ${response.status}`);
                }
            },
            onerror: function(error) {
                if (onError) onError(error.message || '网络错误');
            }
        });
    }

    // 下载视频的函数
    function downloadVideo(videoUrl, callback, customFileName, onProgress, onError) {
        const processedUrl = processVideoUrl(videoUrl);
        const fileExtension = '.mp4';
        const fileName = customFileName ? `${customFileName}${fileExtension}` : getFileNameFromUrl(processedUrl);

        let progressDialog = document.querySelector('.download-confirm-dialog');
        let progressBtn = progressDialog?.querySelector('.confirm-btn');

        GM_xmlhttpRequest({
            method: 'GET',
            url: processedUrl,
            responseType: 'blob',
            headers: {
                'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Range': 'bytes=0-',
                'Referer': currentDomain.includes('doubao') ?
                          'https://www.doubao.com/' :
                          'https://jimeng.jianying.com/',
                'Origin': currentDomain.includes('doubao') ?
                         'https://www.doubao.com' :
                         'https://jimeng.jianying.com',
                'User-Agent': navigator.userAgent
            },
            onprogress: function(progress) {
                if (progress.lengthComputable && progressBtn) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    progressBtn.textContent = `下载中 ${percent}%`;
                }
            },
            onload: function(response) {
                if (response.status === 200 || response.status === 206) {
                    const blob = response.response;
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                    if (callback) callback();
                } else {
                    console.error('下载失败:', response.status);
                    alert('下载失败，请检查控制台获取详细信息');
                    if (callback) callback();
                }
            },
            onerror: function(error) {
                console.error('请求失败:', error);
                alert('下载失败，请检查控制台获取详细信息');
                if (callback) callback();
            }
        });
    }

    // 从 URL 中提取文件名
    function getFileNameFromUrl(url) {
        url = url.split('?')[0];
        const urlParts = url.split('/');
        let fileName = urlParts[urlParts.length - 1];

        if (fileName.includes('~')) {
            fileName = fileName.split('~')[0];
        }

        if (!fileName.match(/\.(mp4|webm|jpg|jpeg|png)$/i)) {
            fileName += url.includes('video') ? '.mp4' : '.jpeg';
        }

        return fileName;
    }

    // 监听右键点击事件
    document.addEventListener('contextmenu', async function (event) {
        const target = event.target;

        if (target.tagName.toLowerCase() === 'img') {
            const imageUrl = target.src;
            if (imageUrl) {
                createConfirmDialog(imageUrl, 'image', downloadImage);
                event.preventDefault();
            }
        }
        else if (target.tagName.toLowerCase() === 'video' ||
                 target.closest('video')) {
            const videoElement = target.tagName.toLowerCase() === 'video' ?
                               target : target.closest('video');

            if (videoElement) {
                const videoUrl = await getRealVideoUrl(videoElement);
                if (videoUrl) {
                    createConfirmDialog(videoUrl, 'video', downloadVideo);
                    event.preventDefault();
                }
            }
        }
    }, true);

    // 修改显示提示的函数
    function showUsageTip() {
        // 移除检查localStorage的逻辑，每次都显示提示
        const tip = document.createElement('div');
        tip.className = 'usage-tip';
        tip.innerHTML = `
            <span class="icon">💡</span>
            <div class="content">
                <span class="main-text">点击图片或视频，单击鼠标右键即可免费下载无水印的图片或视频</span>
                <span class="contact"></span>
            </div>
        `;
        document.body.appendChild(tip);

        // 显示提示
//        setTimeout(() => {
//            tip.classList.add('show');
//        }, 500);

        // 10秒后自动隐藏提示
        setTimeout(() => {
            tip.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(tip);
            }, 600);
        }, 10000);

        // 点击可以提前关闭提示
        tip.addEventListener('click', () => {
            tip.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(tip);
            }, 600);
        });
    }

    // 修改页面加载时的提示逻辑
    function initUsageTip() {
        if (window.location.hostname.includes('doubao.com') ||
            window.location.hostname.includes('jimeng.jianying.com')) {

            // 页面加载完成后显示提示
            if (document.readyState === 'complete') {
                showUsageTip();
            } else {
                window.addEventListener('load', showUsageTip);
            }

            // 监听页面可见性变化
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    showUsageTip();
                }
            });

            // 监听页面焦点变化
            window.addEventListener('focus', showUsageTip);
        }
    }

    // 初始化提示
    initUsageTip();
})();
