(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // 元素引用
        const elements = {
            introAnimation: document.getElementById('intro-animation'),
            skipIntroBtn: document.getElementById('skip-intro'),
            meditationSection: document.getElementById('meditation-section'),
            categoryButtons: document.querySelectorAll('.category-btn'),
            bubbleText: document.getElementById('bubble-text'),
            cardSection: document.getElementById('card-section'),
            card: document.getElementById('card'),
            cardBack: document.getElementById('card-back'),
            cardMessage: document.getElementById('card-message'),
            drawAgainBtn: document.getElementById('draw-again')
        };

        // 全局變量
        let currentCardType = '';
        let currentMessageId = 0;
        let currentCategory = '';
        let isAnimating = false;

        // 初始化事件監聽
        function initEventListeners() {
            // 跳過開場動畫
            if (elements.skipIntroBtn) {
                elements.skipIntroBtn.addEventListener('click', skipIntro);
            }

            // 類別選擇按鈕
            if (elements.categoryButtons) {
                elements.categoryButtons.forEach(btn => {
                    btn.addEventListener('click', function() {
                        currentCategory = this.dataset.category;
                        startDrawing(currentCategory);
                    });
                });
            }

            // 卡片點擊事件
            if (elements.card) {
                elements.card.addEventListener('click', handleCardClick);
            }

            // 再抽一次按鈕
            if (elements.drawAgainBtn) {
                elements.drawAgainBtn.addEventListener('click', function() {
                    window.location.href = '/main';
                });
            }
        }

        // 跳過開場動畫
        function skipIntro() {
            elements.introAnimation.style.animation = 'fadeOut 0.5s forwards';
            setTimeout(() => {
                elements.introAnimation.classList.add('hidden');
            }, 500);
        }

        // 開始抽牌流程
        function startDrawing(category) {
            if (isAnimating) return;
            isAnimating = true;

            elements.meditationSection.classList.add('hidden');
            elements.cardSection.classList.remove('hidden');
            elements.bubbleText.textContent = '正在為您抽取卡牌...';
            
            // 重置卡片狀態
            elements.card.classList.remove('flipped');
            elements.card.style.pointerEvents = 'none';

            setTimeout(async () => {
                try {
                    const response = await fetch(`/draw_card/${category}`);
                    const data = await response.json();
                    
                    // 保存當前卡片信息
                    currentCardType = data.card_type;
                    currentMessageId = data.message_id;
                    currentCategory = data.category;
                    
                    // 設置卡片內容
                    elements.cardBack.style.backgroundImage = `url('${data.card_image}')`;
                    elements.cardMessage.textContent = data.message;
                    
                    // 更新對話
                    elements.bubbleText.innerHTML = `牌已經準備好了！<br>請點擊卡片翻開你的命運之牌...`;
                    
                    // 啟用卡片點擊
                    elements.card.style.pointerEvents = 'auto';
                } catch (error) {
                    console.error('抽卡失敗:', error);
                    elements.bubbleText.innerHTML = `抽卡失敗，請刷新頁面重試`;
                } finally {
                    isAnimating = false;
                }
            }, 2000);
        }

        // 點擊卡牌查看詳情
        function handleCardClick() {
            if (isAnimating) return;
            
            if (this.classList.contains('flipped')) {
                // 已經翻開的卡片，跳轉到詳情頁
                window.location.href = `/card_detail/${currentCardType}/${currentMessageId}`;
                return;
            }
            
            // 翻牌動畫
            this.classList.add('flipped');
        }

        // 自動播放開場動畫
        setTimeout(() => {
            if (elements.introAnimation && !elements.introAnimation.classList.contains('hidden')) {
                elements.introAnimation.style.animation = 'fadeOut 1s forwards';
                setTimeout(() => {
                    elements.introAnimation.classList.add('hidden');
                }, 1000);
            }
        }, 3000);

        // 預加載圖片
        function preloadImages() {
            const images = [
                '/static/images/red_card.png',
                '/static/images/yellow_card.png',
                '/static/images/green_card.png',
                '/static/images/white_card.png',
                '/static/images/black_card.png'
            ];
            images.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        }

        initEventListeners();
        preloadImages();
    });
})();