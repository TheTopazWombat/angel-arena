import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import massive from 'massive';

const config = require('./_config');

const connectionString = config.connectionString;

const app = module.exports = express();
const port = config.port;

//middleware
app.use(bodyParser.json());
var corsOptions = {
    origin: 'http://localhost:9000'
};
app.use(cors(corsOptions));
app.use(session({
    secret: config.SESSION_SECRET,
    saveUninitialized: true,
    resave: false
}));

var massiveInstance = massive.connectSync({
    connectionString: connectionString
});


app.set('db', massiveInstance);

var db = app.get('db');

app.use(express.static(__dirname + '/../../../dist')); //serve all of our static front-end files from our server.

const skyscanner = require('./api/skyscanner.js');

app.post('/api/skyscanner/from/', skyscanner.flightsFrom);

// app.post('/api/cards/refresh', )
let cycles = ['core', 'genesis', 'spin', 'lunar', 'sansan', 'mumbad', 'flashpoint', 'red sand'];
let cards = require('./api/cardData.js');

cards = cards.cardData;

let insertCardToDb = (obj) => {
    db.insert_new_card([obj.position, obj.cost, obj.deck_limit, obj.faction_code, obj.side_code, obj.flavor, obj.img_src, obj.keywords, obj.text, obj.type_code, obj.uniqueness, obj.cycle, (obj.minimum_deck_size || false), (obj.faction_cost || obj.influence_limit)], (err, res) => {
        if (err) console.log(err);
        else console.log("Successfully added card");
    });
};

let cardFlag;

cards.map(insertCardToDb);

cards.map((e, i) => {
    let code = e.code.substring(0, 2);
    if (e.keywords) {
        e.keywords = e.keywords.split(' - ');
        // console.log(e.keywords.prototype);
    } else e.keywords = '';
    switch (code) {
        case '01':
            e.cycle = 'core';
            break;
        case '02' || '03':
            e.cycle = 'genesis';
            break;
        case '04' || '05':
            e.cycle = 'spin';
            break;
        case '06' || '07':
            e.cycle = 'lunar';
            break;
        case '08' || '09':
            e.cycle = 'sansan';
            break;
        case '10':
            e.cycle = 'mumbad';
            break;
        case '11':
            e.cycle = 'flashpoint';
            break;
    }
});

console.log('eyyyyy', cards[100].keywords);


let insertCardsToDb = () => {
    console.log(cards[0]);
    let qs = `INSERT INTO cards (id, cost, deck_limit, faction, side, flavor, img_src, subtypes, text_box, type, is_unique, cycle, min_deck_size, influence) VALUES `,
        batchSave = false,
        count = 0,

        flag;
    cards.map((e, i) => {
        let code = e.code.substring(0, 2);
        if (e.keywords) e.keywords = e.keywords.split(' - ');
        else e.keywords = '';
        switch (code) {
            case '01':
                e.cycle = 'core';
                break;
            case '02' || '03':
                e.cycle = 'genesis';
                break;
            case '04' || '05':
                e.cycle = 'spin';
                break;
            case '06' || '07':
                e.cycle = 'lunar';
                break;
            case '08' || '09':
                e.cycle = 'sansan';
                break;
            case '10':
                e.cycle = 'mumbad';
                break;
            case '11':
                e.cycle = 'flashpoint';
                break;
        }
        if (count < 100) {
            qs += `(${e.position}, ${e.cost}, ${e.deck_limit}, '${e.faction_code}', '${e.side_code}', '${e.flavor}', '${e.img_src}', '${e.keywords}', '${e.text}', '${e.uniqueness}', '${e.cycle}', ${e.minimum_deck_size || 'false'}, ${e.faction_cost || e.influence_limit})`;
            if (count < 99 && i !== cards.length - 1) qs += ',';
            count++;
        } else {
            count = 0;
            // if (!flag) console.log(qs);
            flag = true;
            qs = `INSERT INTO cards (id, cost, deck_limit, faction, side, flavor, img_src, subtypes, text_box, type, is_unique, cycle, min_deck_size, influence) VALUES `;
        }
    });
    // console.log('***********************', qs);
};

// insertCardsToDb();

app.listen(port, function() {
    console.log('Listening on port ', port);
});