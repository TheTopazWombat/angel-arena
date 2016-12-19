const app = require('../server');
const db = app.get('db');

module.exports = {
    getAllCards: (req, res, next) => {
        db.get_all_cards([], (err, response) => {
            res.status(200).json(response);
        });
    },
    insertNewCard: (req, res, next) => {
        let obj = req.body;
        db.insert_new_card([obj.code, obj.cost, obj.deck_limit, obj.faction_code, obj.side_code, obj.flavor, obj.img_src, obj.keywords, obj.text, obj.type_code, obj.uniqueness, obj.cycle, (obj.minimum_deck_size || null), (obj.faction_cost || obj.influence_limit)], (err, response) => {
            if (err) {
                console.log("error adding card to db");
                res.status(500).send('Error adding card to db');
            } else {
                res.send('Card successfully added to db');
            }
        });
    },
};