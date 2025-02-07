// ==UserScript==
// @name         豆包&即梦AI下载无水印图片视频
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  实现豆包&即梦生成的图片视频免费无水印下载，更好的右键下载体验，支持复制，新标签页打开，下载。修改自11208596
// @author       e
// @license      UNLICENSED
// @match        https://www.doubao.com/*
// @match        https://jimeng.jianying.com/ai-tool/*
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @downloadURL https://update.greasyfork.org/scripts/523527/%E8%B1%86%E5%8C%85%E5%8D%B3%E6%A2%A6AI%E4%B8%8B%E8%BD%BD%E6%97%A0%E6%B0%B4%E5%8D%B0%E5%9B%BE%E7%89%87%E8%A7%86%E9%A2%91.user.js
// @updateURL https://update.greasyfork.org/scripts/523527/%E8%B1%86%E5%8C%85%E5%8D%B3%E6%A2%A6AI%E4%B8%8B%E8%BD%BD%E6%97%A0%E6%B0%B4%E5%8D%B0%E5%9B%BE%E7%89%87%E8%A7%86%E9%A2%91.meta.js
// ==/UserScript==

(function () {
    'use strict';
    function blockOriginalContextMenu() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { 
                        if (node.classList?.contains('semi-portal-inner') || 
                            node.querySelector('.semi-portal-inner')) {
                            const menu = node.classList?.contains('semi-portal-inner') ? 
                                       node : node.querySelector('.semi-portal-inner');
                            if (menu) {
                                menu.remove();
                            }
                        }
                    }
                });
            });
        });

        const config = {
            childList: true, 
            subtree: true,
            attributes: false,
            characterData: false
        };

        observer.observe(document.body, config);
    }

    if (window.location.hostname.includes('doubao')) {
        blockOriginalContextMenu();
    }

    const style = document.createElement('style');
    style.textContent = `
        .download-confirm-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 10000;
            min-width: 320px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .download-confirm-dialog h3 {
            margin: 0 0 12px 0;
            color: #1f2329;
            font-size: 18px;
            font-weight: 600;
        }
        .download-confirm-dialog p {
            margin: 0 0 20px 0;
            color: #4e5969;
            font-size: 14px;
        }
        .download-confirm-dialog .button-group {
            display: flex;
            justify-content: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        .download-confirm-dialog button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            background: #f2f3f5;
            color: #4e5969;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .download-confirm-dialog button:hover {
            background: #e5e6eb;
            transform: translateY(-1px);
        }
        .download-confirm-dialog button svg {
            width: 16px;
            height: 16px;
            opacity: 0.85;
        }
        .download-confirm-dialog .confirm-btn {
            background: #1677ff;
            color: white;
        }
        .download-confirm-dialog .confirm-btn:hover {
            background: #0958d9;
        }
        .download-confirm-dialog .confirm-btn:disabled {
            background: #bfbfbf;
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .download-confirm-dialog .copy-btn {
            background: #52c41a;
            color: white;
        }
        .download-confirm-dialog .copy-btn:hover {
            background: #389e0d;
        }
        .download-confirm-dialog .open-btn {
            background: #722ed1;
            color: white;
        }
        .download-confirm-dialog .open-btn:hover {
            background: #531dab;
        }
        .download-confirm-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.45);
            backdrop-filter: blur(4px);
            z-index: 9999;
        }
    `;
    document.head.appendChild(style);

    const currentDomain = window.location.hostname;

    function createConfirmDialog(mediaUrl, mediaType, downloadFunction) {
        const overlay = document.createElement('div');
        overlay.className = 'download-confirm-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'download-confirm-dialog';

        const buttons = mediaType === 'image' ? `
            <div class="button-group">
                <button class="confirm-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M1 3.342a.333.333 0 0 0-.333.333v8.667c0 .184.149.333.333.333h.667c.184 0 .333-.15.333-.333V8.675h4v3.667c0 .184.15.333.333.333H7c.184 0 .333-.15.333-.333V3.675A.333.333 0 0 0 7 3.342h-.667A.333.333 0 0 0 6 3.675v3.667H2V3.675a.333.333 0 0 0-.333-.333H1Z" fill="currentColor" fill-opacity=".85"/>
                    </svg>
                    下载
                </button>
                <button class="copy-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M8.666 2.116a.177.177 0 0 0-.332 0l-.26.702a2.125 2.125 0 0 1-1.256 1.256l-.702.26a.177.177 0 0 0 0 .332l.702.26c.582.215 1.04.674 1.256 1.256l.26.702a.177.177 0 0 0 .332 0l.26-.702a2.125 2.125 0 0 1 1.255-1.256l.703-.26a.177.177 0 0 0 0-.332l-.703-.26a2.125 2.125 0 0 1-1.255-1.256l-.26-.702Z" fill="currentColor"/>
                    </svg>
                    复制
                </button>
                <button class="open-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm16 0H5v14h14V5Z" fill="currentColor"/>
                    </svg>
                    新标签页打开
                </button>
                <button class="cancel-btn">取消</button>
            </div>
        ` : `
            <div class="button-group">
                <button class="confirm-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M1 3.342a.333.333 0 0 0-.333.333v8.667c0 .184.149.333.333.333h.667c.184 0 .333-.15.333-.333V8.675h4v3.667c0 .184.15.333.333.333H7c.184 0 .333-.15.333-.333V3.675A.333.333 0 0 0 7 3.342h-.667A.333.333 0 0 0 6 3.675v3.667H2V3.675a.333.333 0 0 0-.333-.333H1Z" fill="currentColor" fill-opacity=".85"/>
                    </svg>
                    下载
                </button>
                <button class="cancel-btn">取消</button>
            </div>
        `;

        dialog.innerHTML = `
            <h3>请选择操作</h3>
            <p>您要如何处理此${mediaType === 'video' ? '视频' : '图片'}？</p>
            ${buttons}
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        const confirmBtn = dialog.querySelector('.confirm-btn');
        const cancelBtn = dialog.querySelector('.cancel-btn');
        const copyBtn = dialog.querySelector('.copy-btn');
        const openBtn = dialog.querySelector('.open-btn');

        function closeDialog() {
            document.body.removeChild(overlay);
            document.body.removeChild(dialog);
        }

        confirmBtn.addEventListener('click', () => {
            confirmBtn.disabled = true;
            confirmBtn.textContent = '下载中...';
            downloadFunction(mediaUrl, closeDialog);
        });

        cancelBtn.addEventListener('click', closeDialog);

        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch(mediaUrl, {
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
                        }
                    });
                    const blob = await response.blob();
                    
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    
                    img.onload = async () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        
                        try {
                            canvas.toBlob(async (blob) => {
                                try {
                                    await navigator.clipboard.write([
                                        new ClipboardItem({
                                            'image/png': blob
                                        })
                                    ]);
                                    menuContainer.remove();
                                } catch (err) {
                                    try {
                                        const item = new ClipboardItem({
                                            'image/png': blob
                                        });
                                        await navigator.clipboard.write([item]);
                                        menuContainer.remove();
                                    } catch (error) {
                                        try {
                                            canvas.toBlob(async (blob) => {
                                                const data = [new ClipboardItem({ [blob.type]: blob })];
                                                await navigator.clipboard.write(data);
                                                menuContainer.remove();
                                            }, 'image/png');
                                        } catch (finalError) {
                                            const link = document.createElement('a');
                                            link.href = canvas.toDataURL('image/png');
                                            link.download = getFileNameFromUrl(mediaUrl).replace(/\.[^/.]+$/, '.png');
                                            link.click();
                                            menuContainer.remove();
                                        }
                                    }
                                }
                            }, 'image/png');
                        } catch (err) {
                            console.error('复制失败:', err);
                            const link = document.createElement('a');
                            link.href = canvas.toDataURL('image/png');
                            link.download = getFileNameFromUrl(mediaUrl).replace(/\.[^/.]+$/, '.png');
                            link.click();
                            menuContainer.remove();
                        }
                    };

                    img.onerror = () => {
                        console.error('图片加载失败');
                        menuContainer.remove();
                    };

                    img.src = URL.createObjectURL(blob);
                } catch (err) {
                    console.error('复制失败:', err);
                    menuContainer.remove();
                }
            });
        }

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                window.open(mediaUrl, '_blank');
                menuContainer.remove();
            });
        }
    }

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

                console.log('处理后的视频URL:', urlObj.toString());
                return urlObj.toString();
            }
            return url;
        } catch (e) {
            console.error('处理视频URL时出错:', e);
            return url;
        }
    }

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

        console.log('原始视频URL:', videoUrl);

        return videoUrl;
    }

    function downloadImage(imageUrl, callback) {
        const fileName = getFileNameFromUrl(imageUrl).replace(/\.webp$/, '.png');

        function convertWebpToPng(blob) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((pngBlob) => {
                        resolve(pngBlob);
                    }, 'image/png');
                };
                img.onerror = reject;
                img.src = URL.createObjectURL(blob);
            });
        }

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
            onload: async function(response) {
                if (response.status === 200) {
                    try {
                        const blob = response.response;
                        if (blob.type === 'image/webp') {
                            const pngBlob = await convertWebpToPng(blob);
                            const url = URL.createObjectURL(pngBlob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            setTimeout(() => URL.revokeObjectURL(url), 100);
                        } else {
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            setTimeout(() => URL.revokeObjectURL(url), 100);
                        }
                        console.log('下载成功:', fileName);
                    } catch (error) {
                        console.error('转换或下载失败:', error);
                        alert('图片处理失败，请检查控制台获取详细信息');
                    }
                } else {
                    console.error('下载失败:', response.status);
                    alert('下载失败，请检查控制台获取详细信息');
                }
                if (callback) callback();
            },
            onerror: function(error) {
                console.error('请求失败:', error);
                alert('下载失败，请检查控制台获取详细信息');
                if (callback) callback();
            }
        });

        console.log(`正在下载图片: ${imageUrl}`);
    }

    function downloadVideo(videoUrl, callback) {
        const processedUrl = processVideoUrl(videoUrl);
        const fileName = getFileNameFromUrl(processedUrl);

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
                    link.download = fileName.endsWith('.mp4') ? fileName : fileName + '.mp4';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                    console.log('下载成功:', fileName);
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

        console.log(`正在下载视频: ${processedUrl}`);
    }

    function getFileNameFromUrl(url) {
        const now = new Date();
        const date = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/[\/]/g, '');
        
        const time = now.toLocaleString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/[:]/g, '_');

        const extension = url.split('?')[0].split('.').pop().toLowerCase();
        let fileType = '';

        if (['mp4', 'webm'].includes(extension)) {
            fileType = '.mp4';
        } else if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
            fileType = '.png'; // 统一使用png格式
        } else {
            fileType = url.includes('video') ? '.mp4' : '.png';
        }

        return `${date}_${time}${fileType}`;
    }

    function createCustomContextMenu(x, y, mediaType, mediaUrl, downloadFunction) {
        const existingMenu = document.querySelector('.mweb-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menuContainer = document.createElement('div');
        menuContainer.className = 'lv-trigger lv-trigger-position-bl fadeIn-appear-done fadeIn-enter-done';
        menuContainer.style.cssText = `
            opacity: 1;
            position: fixed;
            z-index: 1050;
            display: initial;
            pointer-events: auto;
            top: ${y}px;
            left: ${x}px;
        `;

        const menuContent = document.createElement('div');
        menuContent.className = 'contextMenu-u3ODxL mweb-context-menu';

        const downloadItem = document.createElement('div');
        downloadItem.className = 'contextMenuItem-HsqP2f mweb-context-menu-item';
        downloadItem.innerHTML = `
            <div class="contextMenuIcon-I9lFxB">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 12.586V3.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v9.086L8.353 9.939a.5.5 0 0 0-.707 0l-.707.707a.5.5 0 0 0 0 .708l4.354 4.353a1 1 0 0 0 1.414 0l4.354-4.353a.5.5 0 0 0 0-.708l-.707-.707a.5.5 0 0 0-.708 0L13 12.586Z" fill="currentColor"/>
                    <path d="M5 19v-2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5V19H5Z" fill="currentColor"/>
                </svg>
            </div>
            <div class="contextMenuText-wgUBd2">下载${mediaType === 'video' ? '视频' : '图片'}</div>
        `;

        if (mediaType === 'image') {
            const copyItem = document.createElement('div');
            copyItem.className = 'contextMenuItem-HsqP2f mweb-context-menu-item';
            copyItem.innerHTML = `
                <div class="contextMenuIcon-I9lFxB">
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 3H4c-1.1 0-2 .9-2 2v14h2V5h12V3zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 16H8V9h11v14z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="contextMenuText-wgUBd2">复制图片</div>
            `;

            const openItem = document.createElement('div');
            openItem.className = 'contextMenuItem-HsqP2f mweb-context-menu-item';
            openItem.innerHTML = `
                <div class="contextMenuIcon-I9lFxB">
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="contextMenuText-wgUBd2">新标签页打开</div>
            `;

            copyItem.addEventListener('click', async () => {
                try {
                    const response = await fetch(mediaUrl, {
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
                        }
                    });
                    const blob = await response.blob();
                    
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    
                    img.onload = async () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        
                        try {
                            canvas.toBlob(async (blob) => {
                                try {
                                    await navigator.clipboard.write([
                                        new ClipboardItem({
                                            'image/png': blob
                                        })
                                    ]);
                                    menuContainer.remove();
                                } catch (err) {
                                    try {
                                        const item = new ClipboardItem({
                                            'image/png': blob
                                        });
                                        await navigator.clipboard.write([item]);
                                        menuContainer.remove();
                                    } catch (error) {
                                        try {
                                            canvas.toBlob(async (blob) => {
                                                const data = [new ClipboardItem({ [blob.type]: blob })];
                                                await navigator.clipboard.write(data);
                                                menuContainer.remove();
                                            }, 'image/png');
                                        } catch (finalError) {
                                            const link = document.createElement('a');
                                            link.href = canvas.toDataURL('image/png');
                                            link.download = getFileNameFromUrl(mediaUrl).replace(/\.[^/.]+$/, '.png');
                                            link.click();
                                            menuContainer.remove();
                                        }
                                    }
                                }
                            }, 'image/png');
                        } catch (err) {
                            console.error('复制失败:', err);
                            const link = document.createElement('a');
                            link.href = canvas.toDataURL('image/png');
                            link.download = getFileNameFromUrl(mediaUrl).replace(/\.[^/.]+$/, '.png');
                            link.click();
                            menuContainer.remove();
                        }
                    };

                    img.onerror = () => {
                        console.error('图片加载失败');
                        menuContainer.remove();
                    };

                    img.src = URL.createObjectURL(blob);
                } catch (err) {
                    console.error('复制失败:', err);
                    menuContainer.remove();
                }
            });

            openItem.addEventListener('click', () => {
                window.open(mediaUrl, '_blank');
                menuContainer.remove();
            });

            menuContent.appendChild(downloadItem);
            menuContent.appendChild(copyItem);
            menuContent.appendChild(openItem);
        } else {
            menuContent.appendChild(downloadItem);
        }

        downloadItem.addEventListener('click', () => {
            downloadFunction(mediaUrl, () => menuContainer.remove());
        });

        menuContainer.appendChild(menuContent);
        document.body.appendChild(menuContainer);

        function handleClickOutside(event) {
            if (!menuContainer.contains(event.target)) {
                menuContainer.remove();
                document.removeEventListener('click', handleClickOutside);
            }
        }
        
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);
    }

    document.addEventListener('contextmenu', async function (event) {
        if (window.location.hostname.includes('doubao')) {
            const target = event.target;
            const contextMenuTrigger = target.closest('[data-testid="image_context_menu"]');
            if (contextMenuTrigger) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }

        const target = event.target;

        if (target.tagName.toLowerCase() === 'img') {
            const imageUrl = target.src;
            if (imageUrl) {
                event.preventDefault();
                event.stopPropagation(); 
                createCustomContextMenu(event.clientX, event.clientY, 'image', imageUrl, downloadImage);
            }
        }
        else if (target.tagName.toLowerCase() === 'video' || target.closest('video')) {
            const videoElement = target.tagName.toLowerCase() === 'video' ? target : target.closest('video');
            if (videoElement) {
                const videoUrl = await getRealVideoUrl(videoElement);
                if (videoUrl) {
                    event.preventDefault();
                    event.stopPropagation(); 
                    createCustomContextMenu(event.clientX, event.clientY, 'video', videoUrl, downloadVideo);
                }
            }
        }
    }, true);

    const additionalStyle = document.createElement('style');
    additionalStyle.textContent = `
        .mweb-context-menu {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            padding: 4px 0;
            min-width: 160px;
        }
        .mweb-context-menu-item {
            display: flex;
            align-items: center;
            padding: 8px 16px;
            cursor: pointer;
            color: #1f2329;
            transition: background-color 0.2s ease;
        }
        .mweb-context-menu-item:hover {
            background-color: #f5f6f7;
        }
        .contextMenuIcon-I9lFxB {
            margin-right: 8px;
            display: flex;
            align-items: center;
        }
        .contextMenuText-wgUBd2 {
            font-size: 14px;
            flex: 1;
        }
    `;
    document.head.appendChild(additionalStyle);
})();
