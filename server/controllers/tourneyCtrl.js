const app = require('../server');
const db = app.get('db');

// console.log(db);

let createSwissPairings = (players) => {
    players = players.sort((a, b) => {
        console.log(a.fullName, b.fullName)
        if (a.prestige === b.prestige) return b.strength_of_schedule - a.strength_of_schedule;
        else return b.prestige - a.prestige;
    });

    players.map((e, i) => {
        e.swiss_place = i + 1;
    });
    
};

module.exports = {
    //Get functions
    getTournament: (req, res, next) => {

    },
    //Create functions
    createNewTournament: (req, res, next) => {

    },
    createNewSwissRound: (req, res, next) => {

    },
    //Uodate functions
    updateTournamentStandings: (req, res, next) => {

    },
    //Delete functions
    deleteTournamentRound: (req, res, next) => {

    }

};