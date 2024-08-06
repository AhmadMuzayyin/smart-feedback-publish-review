const express = require('express');
const Sentiment = require('sentiment');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios')
const Pusher = require('pusher')
const cheerio = require('cheerio')
const mongoose = require('mongoose');
const DotEnv = require('dotenv')

DotEnv.config()

// app
const app = express();
const port = 3000;

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: 'ap1',
    useTLS: true
});

app.use(bodyParser.json());
app.use(cors());
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
async function getReviews(req, res) {
    try {
        console.log("Get reviews from api is being runing");
        let uri = process.env.API_REVIEWS_URL
        axios.get(uri)
            .then(async (response) => {
                const allReviews = response.data.reviews;
                await mongoose.connect(process.env.MONGO_URL);
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
                        console.log('Data is up to date')
                    }
                    if (matching === false) {
                        await mongoose.connection.db.collection('reviews').updateOne({ id: 1 }, { $set: { reviews: allReviews } });
                        pusher.trigger('new-reviews', 'update', {
                            message: 'New reviews have been updated',
                            reviews: newReviews
                        });
                        console.log("Successfully sending data to pusher");
                    }

                }
            }).catch((error) => {
                console.log(error);
            })
    } catch (error) {
        console.log(error)
    }
}
setInterval(getReviews, 60000)
const openaiApiKey = process.env.OPENAI_API_KEY;
async function generateResponse(reviewText) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: `Jawab ulasan ini: ${reviewText} \n dengan jawaban menggunakan bahasa manusia atau jawaban seolah olah anda adalah pemilik publish agency, (tidak terdeteksi menggunakan AI atau chat GPT). sesuaikan jawaban anda dengan sentimen ulasan yang diberikan dan sesuaikan maksimal jawaban ulasan sebanyak 150 tokens.` }],
                temperature: 0.7,
                max_tokens: 150,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiApiKey}`,
                },
            }
        );
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating response:', error);
        return 'Sorry, something went wrong.';
    }
}

app.get('/', (req, res) => {
    res.json('Hello World!');
});
app.post('/predict', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const response = await mongoose.connection.db.collection('reviews').findOne({});
    if (!response) {
        response.json({ error: 'No reviews found' });
    } else {
        const reviews = response.reviews
        const dataSet = []
        reviews.map(val => {
            dataSet.push({
                reviewer_name: val.reviewer_name,
                reviewer_photo_link: val.reviewer_photo_link,
                text: val.review_text,
                rating: val.rating,
            })
        })
        const collection = []
        dataSet.map(element => {
            const $ = cheerio.load(element.text);
            const spanText = $('span.wiI7pd').text();
            const result = sentiment.analyze(spanText);
            let score = result.score / 100 + 1;
            let label = 'NEUTRAL';
            if (score >= 0.7) {
                label = 'POSITIVE';
            } else if (score < 0.3) {
                label = 'NEGATIVE';
            }
            if (element.rating >= 4 && label !== 'POSITIVE') {
                label = 'POSITIVE';
                score = Math.max(score, 0.7);
            } else if (element.rating <= 2 && label !== 'NEGATIVE') {
                label = 'NEGATIVE';
                score = Math.min(score, 0.3);
            }
            collection.push({
                reviewer_name: element.reviewer_name,
                reviewer_photo_link: element.reviewer_photo_link,
                text: spanText,
                rating: element.rating,
                sentiment: {
                    label,
                    score
                }
            })
        })
        res.json(collection);
    }
});
app.post('/classify', (req, res) => {
    const { text = '' } = req.body;
    const classificationResult = classifyText(text);
    res.json(classificationResult);
});
app.get('/reviews', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const result = await mongoose.connection.db.collection('reviews').findOne({});
    if (!result) {
        res.json({ error: 'No reviews found' });
    } else {
        const reviews = []
        result.reviews.map(val => {
            const $ = cheerio.load(val.review_text);
            const review_text = $('span.wiI7pd').text();
            reviews.push({
                reviewer_name: val.reviewer_name,
                reviewer_photo_link: val.reviewer_photo_link,
                review_text: review_text,
                rating: val.rating,
                review_date_time: val.review_date_time
            })
        })
        res.json(reviews);
    }
})
app.get('/getreview', async (req, res) => {
    try {
        await getReviews();
    } catch (error) {
        res.json(error)
    }
})
app.get('/autorespons', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const Reviews = mongoose.connection.db.collection('reviews');
    try {
        const result = await Reviews.findOne({});
        if (!result) {
            res.json({ error: 'No reviews found' });
        } else {
            const reviews = result.reviews;
            const dataSet = [];
            reviews.forEach(val => {
                if (val.review_text != '') {
                    dataSet.push({
                        reviewer_name: val.reviewer_name,
                        reviewer_photo_link: val.reviewer_photo_link,
                        text: val.review_text,
                        rating: val.rating,
                        owners_response: val.owners_response
                    });
                }
            });
            const dataCollection = [];
            for (const element of dataSet) {
                const $ = cheerio.load(element.text);
                const spanText = $('span.wiI7pd').text();
                const result = sentiment.analyze(spanText);
                let score = result.score / 100 + 1;
                let label = 'NEUTRAL';
                if (score >= 0.7) {
                    label = 'POSITIVE';
                } else if (score < 0.3) {
                    label = 'NEGATIVE';
                }
                if (element.rating >= 4 && label !== 'POSITIVE') {
                    label = 'POSITIVE';
                    score = Math.max(score, 0.7);
                } else if (element.rating <= 2 && label !== 'NEGATIVE') {
                    label = 'NEGATIVE';
                    score = Math.min(score, 0.3);
                }
                const oneReviewer = await Reviews.findOne(
                    { id: 1, "reviews.reviewer_name": element.reviewer_name },
                    { projection: { "reviews.$": 1 } });
                if (oneReviewer && oneReviewer.reviews.length > 0) {
                    if (!oneReviewer.reviews[0].owners_response && oneReviewer.reviews[0].reviewer_text != '') {
                        const owners_response = await generateResponse(`Nama reviewer: ${element.reviewer_name} \n Review: ${spanText} \n sentimen: ${label}`);
                        const updateResult = await Reviews.updateOne(
                            { id: 1, "reviews.reviewer_name": element.reviewer_name },
                            { $set: { "reviews.$[elem].owners_response": owners_response } },
                            { arrayFilters: [{ "elem.reviewer_name": element.reviewer_name }] }
                        );
                        if (updateResult.modifiedCount > 0) {
                            console.log("Update successful");
                        } else {
                            console.log(updateResult);
                        }
                    }
                } else {
                    console.log("Document or reviewer not found");
                }
                dataCollection.push({
                    reviewer_name: element.reviewer_name,
                    reviewer_photo_link: element.reviewer_photo_link,
                    text: spanText,
                    owners_response: element.owners_response,
                    rating: element.rating,
                    sentiment: {
                        label,
                        score
                    }
                });
            }
            res.json(dataCollection);
        }
    } catch (error) {
        res.json(error);
    }
});



// listen port and start app
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
