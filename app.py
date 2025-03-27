from flask import Flask, render_template, jsonify, redirect, url_for, send_from_directory
import random
import json
import os
from datetime import datetime

app = Flask(__name__)

# 卡片類型
CARD_TYPES = ['red_card', 'yellow_card', 'green_card', 'white_card', 'black_card']

# 載入卡片訊息
with open('data/card_messages.json', 'r', encoding='utf-8') as f:
    CARD_MESSAGES = json.load(f)

# 當前選擇的類別 (用於卡片詳情頁的分類解析)
current_category = None

@app.route('/')
def splash():
    """開場動畫頁面"""
    return render_template('splash.html')

@app.route('/main')
def main():
    """主頁面 (包含大K老師對話流程)"""
    return render_template('index.html')

@app.route('/draw_card/<category>')
def draw_card(category):
    """抽卡API
    Args:
        category: 抽卡類別 (health/love/fortune/wealth)
    Returns:
        JSON格式的卡片數據
    """
    global current_category
    current_category = category  # 保存當前類別供詳情頁使用
    
    # 隨機選擇卡片類型和訊息
    card_type = random.choice(CARD_TYPES)
    message = random.choice(CARD_MESSAGES[card_type])
    
    return jsonify({
        'card_type': card_type,
        'card_image': f'/static/images/{card_type}.png',
        'message': message['text'],
        'message_id': message['id'],
        'category': category,
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

@app.route('/card_detail/<card_type>/<int:message_id>')
def card_detail(card_type, message_id):
    """卡片詳細解析頁面
    Args:
        card_type: 卡片類型 (red_card/yellow_card等)
        message_id: 卡片訊息的ID
    """
    # 檢查卡片類型是否有效
    if card_type not in CARD_TYPES:
        return redirect(url_for('main'))
    
    # 查找對應的卡片訊息
    message = next((m for m in CARD_MESSAGES[card_type] if m['id'] == message_id), None)
    if not message:
        return redirect(url_for('main'))
    
    # 分類對應的標題和圖標
    category_info = {
        'health': ('健康運勢', '❤️'),
        'love': ('感情運勢', '💖'),
        'fortune': ('個人運勢', '✨'),
        'wealth': ('財富運勢', '💰')
    }
    
    # 獲取當前分類的標題和圖標，默認為全方位解析
    category_name, category_icon = category_info.get(
        current_category, 
        ('全方位解析', '🔍')
    )
    
    # 獲取當前分類的專屬內容
    category_content = message.get(current_category, '沒有相關解析')
    
    return render_template('card.html',
        card_type=card_type,
        message=message,
        card_image=f'/static/images/{card_type}.png',
        category_name=category_name,
        category_icon=category_icon,
        category_content=category_content,
        current_category=current_category
    )

@app.route('/static/images/<path:filename>')
def serve_images(filename):
    """靜態圖片服務"""
    return send_from_directory('static/images', filename)

@app.route('/static/<path:filename>')
def serve_static(filename):
    """通用靜態文件服務"""
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)