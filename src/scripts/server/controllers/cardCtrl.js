const server = require('../server');
const db = require(server.db);

module.exports = {
    getAllCards: (req, res, next) => {
        db.get_all_cards([], (err, response) => {
            res.status(200).json(response);
        });
    },
    insertNewCard: () => {
        db.add_card_to_db([], (err, response) => {
            
        });
    },
};