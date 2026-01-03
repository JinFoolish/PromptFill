// 导出服务：处理图片导出功能
import html2canvas from 'html2canvas';
import { waitForImageLoad, getLocalized } from '../utils/helpers';

/**
 * 导出图片
 * @param {Object} options - 导出选项
 * @param {HTMLElement} options.element - 要导出的元素
 * @param {Object} options.activeTemplate - 当前活动模板
 * @param {string} options.activeTemplateId - 活动模板ID
 * @param {Array} options.INITIAL_TEMPLATES_CONFIG - 初始模板配置
 * @param {string} options.language - 当前语言
 * @param {Function} options.setIsExporting - 设置导出状态的函数
 * @param {Function} options.showToast - Toast 提示函数
 */
export const exportImage = async ({
  element,
  activeTemplate,
  activeTemplateId,
  INITIAL_TEMPLATES_CONFIG,
  language,
  setIsExporting,
  showToast = alert
}) => {
  if (!element) return;

  setIsExporting(true);
  
  const templateDefault = INITIAL_TEMPLATES_CONFIG.find(t => t.id === activeTemplateId);
  const originalImageSrc = activeTemplate.imageUrl || templateDefault?.imageUrl || "";
  let tempBase64Src = null;
  const imgElement = element.querySelector('img');

  if (imgElement && originalImageSrc) {
    // 如果当前 img 没有正确的 src，先补上默认 src
    if (!imgElement.src || imgElement.src.trim() === "" || imgElement.src.includes("data:image") === false) {
      imgElement.src = originalImageSrc;
    }
  }

  if (imgElement && originalImageSrc && originalImageSrc.startsWith('http')) {
    try {
      // 尝试通过 fetch 获取图片数据
      const response = await fetch(originalImageSrc);
      const blob = await response.blob();
      tempBase64Src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      
      // 临时替换为 Base64
      imgElement.src = tempBase64Src;
      await waitForImageLoad(imgElement);
    } catch (e) {
      console.warn("图片 Base64 转换失败，尝试直接导出", e);
    }
  } else if (imgElement) {
    await waitForImageLoad(imgElement);
  }

  // 预加载二维码
  const websiteUrl = 'https://promptfill.tanshilong.com/';
  const localQrCodePath = '/QRCode.png';
  let qrCodeBase64 = null;
  
  try {
    console.log('正在加载本地二维码...', localQrCodePath);
    const qrResponse = await fetch(localQrCodePath);
    if (!qrResponse.ok) throw new Error('本地二维码加载失败');
    const qrBlob = await qrResponse.blob();
    qrCodeBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('本地二维码加载成功');
        resolve(reader.result);
      };
      reader.readAsDataURL(qrBlob);
    });
  } catch (e) {
    console.error("本地二维码加载失败", e);
  }

  try {
    // 创建一个临时的导出容器
    const exportContainer = document.createElement('div');
    exportContainer.id = 'export-container-temp';
    exportContainer.style.position = 'fixed';
    exportContainer.style.left = '-99999px';
    exportContainer.style.top = '0';
    exportContainer.style.width = '900px'; 
    exportContainer.style.minHeight = '800px';
    exportContainer.style.padding = '20px'; 
    exportContainer.style.background = '#fafafa';
    exportContainer.style.display = 'flex';
    exportContainer.style.alignItems = 'center';
    exportContainer.style.justifyContent = 'center';
    document.body.appendChild(exportContainer);
    
    // 创建橙色渐变背景层
    const bgLayer = document.createElement('div');
    bgLayer.style.position = 'absolute';
    bgLayer.style.inset = '0';
    bgLayer.style.background = 'linear-gradient(180deg, #F08F62 0%, #EB7A54 100%)';
    bgLayer.style.zIndex = '0';
    exportContainer.appendChild(bgLayer);
    
    // 克隆 preview-card
    const clonedCard = element.cloneNode(true);
    clonedCard.style.position = 'relative';
    clonedCard.style.zIndex = '10';
    clonedCard.style.background = 'rgba(255, 255, 255, 0.98)';
    clonedCard.style.borderRadius = '24px';
    clonedCard.style.boxShadow = '0 8px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 16px -2px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)'; 
    clonedCard.style.border = '1px solid rgba(255, 255, 255, 0.8)';
    clonedCard.style.padding = '40px 45px';
    clonedCard.style.margin = '0 auto';
    clonedCard.style.width = '860px'; 
    clonedCard.style.boxSizing = 'border-box';
    clonedCard.style.fontFamily = '"PingFang SC", "Microsoft YaHei", sans-serif';
    clonedCard.style.webkitFontSmoothing = 'antialiased';
    exportContainer.appendChild(clonedCard);
    
    const canvas = await html2canvas(exportContainer, {
      scale: 2.0, 
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById('export-container-temp');
        if (clonedElement) {
          const card = clonedElement.querySelector('#preview-card');
          if (!card) return;

          // 获取原始数据
          const originalImg = card.querySelector('img');
          const imgSrc = tempBase64Src || (originalImg ? originalImg.src : '');
          const titleElement = card.querySelector('h2');
          const titleText = titleElement ? titleElement.textContent.trim() : getLocalized(activeTemplate.name, language);
          const contentElement = card.querySelector('#final-prompt-content');
          const contentHTML = contentElement ? contentElement.innerHTML : '';
          
          // 获取版本号（动态从原始DOM）
          const metaContainer = card.querySelector('.flex.flex-wrap.gap-2');
          const versionElement = metaContainer ? metaContainer.querySelector('.bg-orange-50') : null;
          const versionText = versionElement ? versionElement.textContent.trim() : '';
          
          // 清空卡片内容
          card.innerHTML = '';
          
          // --- 1. 图片区域 ---
          if (imgSrc) {
            const imgContainer = clonedDoc.createElement('div');
            imgContainer.style.width = '100%';
            imgContainer.style.marginBottom = '30px';
            imgContainer.style.display = 'flex';
            imgContainer.style.justifyContent = 'center';
            imgContainer.style.alignItems = 'center';
            
            const img = clonedDoc.createElement('img');
            img.src = imgSrc;
            img.style.width = '100%'; 
            img.style.height = 'auto'; 
            img.style.objectFit = 'contain'; 
            img.style.borderRadius = '12px'; 
            img.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            img.style.boxSizing = 'border-box';
            
            imgContainer.appendChild(img);
            card.appendChild(imgContainer);
          }
          
          // --- 2. 标题区域 ---
          const titleContainer = clonedDoc.createElement('div');
          titleContainer.style.marginBottom = '25px';
          
          const title = clonedDoc.createElement('h2');
          title.textContent = titleText;
          title.style.fontSize = '32px'; 
          title.style.fontWeight = '700';
          title.style.color = '#1f2937';
          title.style.margin = '0';
          title.style.lineHeight = '1.2';
          
          titleContainer.appendChild(title);
          card.appendChild(titleContainer);
          
          // --- 3. 正文区域 ---
          if (contentHTML) {
            const contentContainer = clonedDoc.createElement('div');
            contentContainer.innerHTML = contentHTML;
            contentContainer.style.fontSize = '18px'; 
            contentContainer.style.lineHeight = '1.8';
            contentContainer.style.color = '#374151';
            contentContainer.style.marginBottom = '40px';
            
            // 修复胶囊样式
            const variables = contentContainer.querySelectorAll('[data-export-pill="true"]');
            variables.forEach(v => {
              if (v.parentElement && v.parentElement.classList.contains('inline-block')) {
                v.parentElement.style.display = 'inline';
                v.parentElement.style.margin = '0';
              }

              v.style.display = 'inline-flex';
              v.style.alignItems = 'center';
              v.style.justifyContent = 'center';
              v.style.padding = '4px 12px'; 
              v.style.margin = '2px 4px';
              v.style.borderRadius = '6px'; 
              v.style.fontSize = '17px'; 
              v.style.fontWeight = '600';
              v.style.lineHeight = '1.5';
              v.style.verticalAlign = 'middle';
              v.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              v.style.color = '#ffffff'; 
              v.style.border = 'none'; 
            });
            
            card.appendChild(contentContainer);
          }
          
          // --- 4. 底部水印区域 ---
          const footer = clonedDoc.createElement('div');
          footer.style.marginTop = '40px';
          footer.style.paddingTop = '25px';
          footer.style.paddingBottom = '15px';
          footer.style.borderTop = '2px solid #e2e8f0';
          footer.style.display = 'flex';
          footer.style.justifyContent = 'space-between';
          footer.style.alignItems = 'center';
          footer.style.fontFamily = 'sans-serif';
          
          const qrCodeHtml = qrCodeBase64 
            ? `<img src="${qrCodeBase64}" 
                    style="width: 80px; height: 80px; border: 3px solid #e2e8f0; border-radius: 8px; display: block; background: white;" 
                    alt="QR Code" />`
            : `<div style="width: 80px; height: 80px; border: 3px dashed #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-size: 10px; color: #94a3b8; font-weight: 500;">QR Code</div>`;
          
          footer.innerHTML = `
            <div style="flex: 1; padding-right: 20px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                <div style="font-size: 15px; font-weight: 600; color: #1f2937;">
                  Generated by <span style="color: #6366f1; font-weight: 700;">Prompt Fill</span>
                </div>
                ${versionText ? `<span style="font-size: 11px; padding: 3px 10px; background: #fff7ed; color: #f97316; border-radius: 5px; font-weight: 600; border: 1px solid #fed7aa;">${versionText}</span>` : ''}
              </div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px; font-weight: 500;">提示词填空器</div>
              <div style="font-size: 11px; color: #3b82f6; font-weight: 500; background: #eff6ff; padding: 4px 8px; border-radius: 4px; display: inline-block; letter-spacing: 0.3px;">
                ${websiteUrl}
              </div>
            </div>
            <div style="display: flex; align-items: center;">
              <div style="text-align: center;">
                ${qrCodeHtml}
                <div style="font-size: 9px; color: #94a3b8; margin-top: 4px; font-weight: 500;">扫码访问</div>
              </div>
            </div>
          `;
          
          card.appendChild(footer);
        }
      }
    });

    const image = canvas.toDataURL('image/jpeg', 0.92);
    const activeTemplateName = getLocalized(activeTemplate.name, language);
    const filename = `${activeTemplateName.replace(/\s+/g, '_')}_prompt.jpg`;
    const link = document.createElement('a');
    link.href = image;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✅ 图片导出成功！');
    
  } catch (err) {
    console.error("Export failed:", err);
    showToast('❌ 导出失败，请重试');
  } finally {
    const tempContainer = document.getElementById('export-container-temp');
    if (tempContainer) {
      document.body.removeChild(tempContainer);
    }
    if (imgElement && originalImageSrc) {
      imgElement.src = originalImageSrc;
    }
    setIsExporting(false);
  }
};

