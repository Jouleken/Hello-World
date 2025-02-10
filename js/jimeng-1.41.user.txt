// ==UserScript==
// @name         豆包&即梦AI下载无水印图片视频
// @namespace    http://tampermonkey.net/
// @version      1.41
// @description  实现豆包&即梦生成的图片视频免费无水印下载
// @author       11208596
// @license      UNLICENSED
// @match        https://www.doubao.com/*
// @match        https://jimeng.jianying.com/ai-tool/*
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @downloadURL https://update.greasyfork.org/scripts/521264/%E8%B1%86%E5%8C%85%E5%8D%B3%E6%A2%A6AI%E4%B8%8B%E8%BD%BD%E6%97%A0%E6%B0%B4%E5%8D%B0%E5%9B%BE%E7%89%87%E8%A7%86%E9%A2%91.user.js
// @updateURL https://update.greasyfork.org/scripts/521264/%E8%B1%86%E5%8C%85%E5%8D%B3%E6%A2%A6AI%E4%B8%8B%E8%BD%BD%E6%97%A0%E6%B0%B4%E5%8D%B0%E5%9B%BE%E7%89%87%E8%A7%86%E9%A2%91.meta.js
// ==/UserScript==

(function () {
    'use strict';

    // 创建确认对话框样式
    const style = document.createElement('style');
    style.textContent = `
        .download-confirm-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            min-width: 300px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .download-confirm-dialog h3 {
            margin: 0 0 15px 0;
            color: #333;
        }
        .download-confirm-dialog .buttons {
            margin-top: 20px;
        }
        .download-confirm-dialog button {
            margin: 0 10px;
            padding: 8px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .download-confirm-dialog .confirm-btn {
            background: #1890ff;
            color: white;
        }
        .download-confirm-dialog .confirm-btn:disabled {
            background: #b4b4b4;
            cursor: not-allowed;
        }
        .download-confirm-dialog .cancel-btn {
            background: #f5f5f5;
            color: #333;
        }
        .download-confirm-dialog button:hover {
            opacity: 0.8;
        }
        .download-confirm-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
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

        dialog.innerHTML = `
            <h3>确认下载</h3>
            <p>是否下载此${mediaType === 'video' ? '视频' : '图片'}？</p>
            <div class="buttons">
                <button class="confirm-btn">确认</button>
                <button class="cancel-btn">取消</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        const confirmBtn = dialog.querySelector('.confirm-btn');
        const cancelBtn = dialog.querySelector('.cancel-btn');

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
    }

    // 处理视频URL,移除水印
    function processVideoUrl(url) {
        try {
            // 如果是即梦/豆包视频 (vlabvod.com域名)
            if (url.includes('vlabvod.com')) {
                const urlObj = new URL(url);

                // 移除所有可能的水印参数
                const paramsToRemove = [
                    'lr', 'watermark', 'display_watermark_busi_user',
                    'cd', 'cs', 'ds', 'ft', 'btag', 'dy_q', 'feature_id'
                ];

                paramsToRemove.forEach(param => {
                    urlObj.searchParams.delete(param);
                });

                // 设置最高质量参数
                if (urlObj.searchParams.has('br')) {
                    // 使用更高的比特率
                    const br = parseInt(urlObj.searchParams.get('br'));
                    urlObj.searchParams.set('br', Math.max(br, 6000).toString());
                    urlObj.searchParams.set('bt', Math.max(br, 6000).toString());
                }

                // 移除任何额外的跟踪或水印参数
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

    // 获取真实视频URL
    async function getRealVideoUrl(videoElement) {
        // 首先尝试获取video元素的src
        let videoUrl = videoElement.src;

        // 如果没有src，尝试获取source标签
        if (!videoUrl) {
            const sourceElement = videoElement.querySelector('source');
            if (sourceElement) {
                videoUrl = sourceElement.src;
            }
        }

        // 如果还是没有，尝试data-src属性
        if (!videoUrl) {
            videoUrl = videoElement.getAttribute('data-src');
        }

        // 记录原始URL
        console.log('原始视频URL:', videoUrl);

        return videoUrl;
    }

    // 下载图片的函数
    function downloadImage(imageUrl, callback) {
        const fileName = getFileNameFromUrl(imageUrl);

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
                    console.log('下载成功:', fileName);
                    if (callback) callback();
                } else {
                    console.error('下载失败:', response.status);
                    if (callback) callback();
                }
            },
            onerror: function(error) {
                console.error('请求失败:', error);
                if (callback) callback();
            }
        });

        console.log(`正在下载图片: ${imageUrl}`);
    }

    // 下载视频的函数
    function downloadVideo(videoUrl, callback) {
        // 处理URL,移除水印
        const processedUrl = processVideoUrl(videoUrl);
        const fileName = getFileNameFromUrl(processedUrl);

        // 添加下载进度显示
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

    // 从 URL 中提取文件名
    function getFileNameFromUrl(url) {
        url = url.split('?')[0];
        const urlParts = url.split('/');
        let fileName = urlParts[urlParts.length - 1];

        if (fileName.includes('~')) {
            fileName = fileName.split('~')[0];
        }

        // 处理视频和图片的扩展名
        if (!fileName.match(/\.(mp4|webm|jpg|jpeg|png)$/i)) {
            fileName += url.includes('video') ? '.mp4' : '.jpeg';
        }

        return fileName;
    }

    // 监听右键点击事件
    document.addEventListener('contextmenu', async function (event) {
        const target = event.target;

        // 处理图片下载
        if (target.tagName.toLowerCase() === 'img') {
            const imageUrl = target.src;
            if (imageUrl) {
                createConfirmDialog(imageUrl, 'image', downloadImage);
                event.preventDefault();
            }
        }
        // 处理视频下载
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
})();
