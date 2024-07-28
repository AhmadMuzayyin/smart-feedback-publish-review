const express = require('express');
const Sentiment = require('sentiment');
const bodyParser = require('body-parser');
const axios = require('axios')
const Pusher = require('pusher')
const mongoose = require('mongoose');
const app = express();
const port = 3000;

const pusher = new Pusher({
    appId: '',
    key: '',
    secret: '',
    cluster: 'ap1',
    useTLS: true
});

app.use(bodyParser.json());

// Initialize the sentiment analysis library
const sentiment = new Sentiment();

// Define the common phrases for classification
const TOPIC_KEYWORDS = {
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
};

function analyzeSentiment(text, rating) {
    // Analyze sentiment based on text
    const result = sentiment.analyze(text);
    let score = result.score / 100 + 1; // Sentiment score in range -1 to 1

    // Determine sentiment label based on score and rating
    let label = 'NEUTRAL';
    if (score >= 0.7) {
        label = 'POSITIVE';
    } else if (score < 0.3) {
        label = 'NEGATIVE';
    }

    if (rating >= 4 && label !== 'POSITIVE') {
        label = 'POSITIVE';
        score = Math.max(score, 0.7);
    } else if (rating <= 2 && label !== 'NEGATIVE') {
        label = 'NEGATIVE';
        score = Math.min(score, 0.3);
    }

    return { label, score };
}
function classifyText(text) {
    if (!text) {
        return { category: "UNKNOWN", score: 0.0 };
    }

    for (const [category, phrases] of Object.entries(TOPIC_KEYWORDS)) {
        for (const phrase of phrases) {
            const regex = new RegExp(phrase, 'i');
            if (regex.test(text)) {
                return { category, score: 1.0 };
            }
        }
    }

    return { category: "UNKNOWN", score: 0.0 };
}
app.get('/', (req, res) => {
    res.json('Hello World!');
});
app.post('/predict', (req, res) => {
    const { text = '', rating = 3 } = req.body;
    const sentimentResult = analyzeSentiment(text, rating);
    res.json(sentimentResult);
});
app.post('/classify', (req, res) => {
    const { text = '' } = req.body;
    const classificationResult = classifyText(text);
    res.json(classificationResult);
});
app.get('/reviews', async (req, res) => {
    await mongoose.connect('');
    const result = await mongoose.connection.db.collection('reviews').findOne({});
    if (!result) {
        res.json({ error: 'No reviews found' });
    } else {
        res.json(result.reviews);
    }
})
app.get('/getreview', async (req, res) => {
    try {
        let uri = ""
        axios.get(uri)
            .then(async (response) => {
                const allReviews = response.data.reviews;
                await mongoose.connect('');
                const result = await mongoose.connection.db.collection('reviews').findOne({});
                if (!result) {
                    await mongoose.connection.db.collection('reviews').insertOne(allReviews);
                } else {
                    const oldReviews = result.reviews.slice(0, 1)
                    const oldReviewer = oldReviews.map(val => val.reviewer_name)
                    const newReviews = allReviews.slice(0, 1)
                    const newReviewer = newReviews.map(val => val.reviewer_name)
                    const matching = newReviewer[0] == oldReviewer[0] ? true : false
                    if (matching === true) {
                        res.json('Data is up to date')
                    }
                    if (matching === false) {
                        await mongoose.connection.db.collection('reviews').updateOne({ id: 1 }, { $set: { reviews: allReviews } });
                        pusher.trigger('new-reviews', 'update', {
                            message: 'New reviews have been updated',
                            reviews: newReviews
                        });
                        res.json(allReviews)
                    }

                }
            }).catch((error) => {
                res.json(error)
            })
    } catch (error) {
        res.json(error)
    }
})

// listen port and start app
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
