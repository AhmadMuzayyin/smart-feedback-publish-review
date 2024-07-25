from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

# Load the sentiment analysis pipeline
sentiment_pipeline = pipeline("sentiment-analysis")

def analyze_sentiment(text, rating):
    if not text:
        # Jika teks kosong, gunakan rating untuk menentukan sentimen
        if rating >= 4:
            return {"label": "POSITIVE", "score": 1.0}
        elif rating <= 2:
            return {"label": "NEGATIVE", "score": 0}
        else:
            return {"label": "NEUTRAL", "score": 0.5}

    # Analisis sentimen berdasarkan teks
    result = sentiment_pipeline(text)[0]

    # Konversi score menjadi angka desimal
    score = float(result['score'])

    # Tentukan label sentimen berdasarkan skor
    if 0.7 <= score <= 1.0:
        result['label'] = 'POSITIVE'
    elif 0.5 <= score < 0.7:
        result['label'] = 'NEUTRAL'
    else:
        result['label'] = 'NEGATIVE'

    return result

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    text = data.get('text', '')
    rating = data.get('rating', 3)

    sentiment = analyze_sentiment(text, rating)

    return jsonify(sentiment)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
