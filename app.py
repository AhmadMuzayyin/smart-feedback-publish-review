from flask import Flask, request, jsonify
from transformers import pipeline
import re
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
from bson.json_util import dumps, loads
import json

app = Flask(__name__)

client = MongoClient('mongodb://localhost:32768/')
db = client['smart_feedback']  # Ganti 'your_database' dengan nama database Anda

# Load the sentiment analysis pipeline
sentiment_pipeline = pipeline("sentiment-analysis")
# Define the common phrases for classification
TOPIC_KEYWORDS = {
    "Mendapatkan sampel gratis": [
        "bisa ngerasain dapet sampel",
        "dapat membantu saya dalam mendapatkan sampel gratis",
        "selain kalian bisa dapat sampel gratis",
        "Dapat sampel gratis"
    ],
    "Kolaborasi dengan brand": [
        "bisa berkolaborasi sama seller",
        "bisa kolaborasi dengan banyak brand",
        "sangat membantu para kreator dan affiliate untuk menghasilkan cuan yg maksimal apalagi menjadi wadah untuk berkolaborasi dengan brand",
    ],
    "Dukungan dan bimbingan": [
        "sangat support kreator pemula",
        "sangat suport konten konten kreator pemula",
        "sangat support buat kreator pemula kayak aku",
        "Sangat membantu adanya publish agency bagi saya sebagi konten kreator biasa"
    ],
    "Peningkatan penghasilan": [
        "memperluas pengalaman bahkan pertemanan selain itu bisa berkolaborasi dengan banyak brand",
        "peningkatan gmv meningkat",
        "Aku dpt tmbhan penghasilan dr agency ini"
    ],
    "Kemudahan mendapatkan proyek": [
        "Invite ACC project nya juga langsung diarahkan dengan cepat",
        "Projectnya juga banyak pilihan"
    ],
    "Bantuan dengan masalah teknis": [
        "agensi ini juga akan bantu trafik buat konten atau live streaming",
        "bisa dibantu ketika kena PL ketika komisi beku"
    ],
    "Kualitas layanan": [
        "admin nya sabar banget klo kita banyak nanya",
        "Agency yg ngertiin talent dan treatment admin2 nya juga fast respon"
    ],
    "Peningkatan keterampilan": [
        "Dengan publish agency banyak ilmu yang saya dapat",
        "bisa mengembangkan potensi saya di bidang influencer"
    ],
    "Rekomendasi untuk bergabung": [
        "Buat kalian yg belum gabung, buruan gabung ya jangan sampe nyesel",
        "Yuk gabung di publish agency"
    ],
    "Ekspresi kepuasan": [
        "Seneng banget bisa join di agency ini",
        "Alhamdulillah semenjak ikut agency publish",
        "Masya Allah Alhamdulillah setelah gabung dg publish agency"
    ]
}

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

    # Tentukan label sentimen berdasarkan skor dan rating
    if score >= 0.7:
        result['label'] = 'POSITIVE'
    elif 0.5 <= score < 0.7:
        result['label'] = 'NEUTRAL'
    else:
        result['label'] = 'NEGATIVE'

    # Adjust the score based on the rating
    if rating >= 4:
        # If rating is positive but the sentiment analysis is not
        if result['label'] != 'POSITIVE':
            result['label'] = 'POSITIVE'
            result['score'] = max(score, 0.7)
    elif rating <= 2:
        # If rating is negative but the sentiment analysis is not
        if result['label'] != 'NEGATIVE':
            result['label'] = 'NEGATIVE'
            result['score'] = min(score, 0.3)

    return result
def classify_text(text):
    if not text:
        return {"category": "UNKNOWN", "score": 0.0}

    for category, phrases in TOPIC_KEYWORDS.items():
        for phrase in phrases:
            if re.search(re.escape(phrase), text, re.IGNORECASE):
                return {"category": category, "score": 1.0}

    return {"category": "UNKNOWN", "score": 0.0}

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    text = data.get('text', '')
    rating = data.get('rating', 3)

    sentiment = analyze_sentiment(text, rating)

    return jsonify(sentiment)
@app.route('/classify', methods=['POST'])
def classify():
    data = request.get_json(force=True)
    text = data.get('text', '')

    classification = classify_text(text)
    return jsonify(classification)

@app.route('/save_reviews', methods=['POST'])
def save_reviews():
    try:
        collection = db['reviews']
        new_data = {
            "author_name": "Ahmad Muzayyin",
            "author_url": None,
            "language": None,
            "profile_photo_url": "https://lh3.googleusercontent.com/a-/ALV-UjVm0ZoH1TtHXOw6vn8D1gSdfG-GEApoepZdOTtgNYoyODHBbYt1=w36-h36-p-rp-mo-br100",
            "rating": 5,
            "relative_time_description": "sebulan lalu",
            "text": "selalu terbaik"
        }
        doc_id = ObjectId('66a31b3a3530c43870e5578c')
        document = collection.find_one({"_id": doc_id})
        if document:
            # document["reviews"].append(new_data)
            collection.update_one({"_id": doc_id}, {"$set": {"reviews":document['reviews']}})
            # if "reviews" in document:
            # else:
            #     document["reviews"] = [new_data]
        
        documents = collection.find()
        documents_list = list(documents)
        json_data = json.dumps(documents_list, default=str)
        json_string = json_data.rstrip(',]') + ']'
        return json.loads(json_string)
        # data = request.json
        
        # if not data or not isinstance(data, list):
        #     return jsonify({'error': 'Invalid data format'}), 400
        
        # # Menambahkan tanggal jika tidak ada
        # for item in data:
        #     if 'tanggal' not in item:
        #         item['tanggal'] = datetime.now().isoformat()

        # # Periksa apakah ada data dengan id yang sama
        # result = collection.find_one({'id': 1})
        # if not result:
        #     # Jika tidak ada data, tambahkan data baru
        #     collection.insert_many(data)
        # else:
        #     # Jika ada data, perbarui data yang ada
        #     collection.delete_many({'id': 1})  # Menghapus data sebelumnya dengan id 1
        #     collection.insert_many(data)
        
        # return jsonify({'status': 'success', 'data': data})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
