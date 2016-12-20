let match = {
    bye: false,
    players: [1, 2],
    game_1: {
        winner: 1,
        win_type: 'flatline',
        winning_side: 'corp',
        prestige: 2
    },
    game_2: {
        winner: 2,
        win_type: 'points',
        winning_side: 'corp',
        prestige: 4
    },

}

let players = [
    {
        id: 1,
        fullName: 'Josh Ely',
        superBye: false,
        corpId: 'Cerebral Imaging',
        runnerId: 'Valencia Estevez',
        swiss_place: 1,
        overall_place: null,
        strength_of_schedule: 0,
        prestige: 4,
        opponents: [2],
        swissMatches: [
            {
                bye: false,
                players: [1, 2],
                games: [{
                    winner: 1,
                    win_type: 'points',
                    winning_side: 'corp',
                    prestige: 2
                  },
                  {
                    winner: 1,
                    win_type: 'points',
                    winning_side: 'runner',
                    prestige: 2
                }],
            },
        ],
        elimMatches: [

        ],
        used_bye: false,
    },
    {
        id: 2,
        fullName: 'Cory Tillotson',
        superBye: false,
        corpId: 'Titan Transnational',
        runnerId: 'Sunny Lebeau',
        swiss_place: 4,
        overall_place: null,
        strength_of_schedule: 4,
        prestige: 0,
        opponents: [1],
        swissMatches: [
            {
                bye: false,
                players: [1, 2],
                games: [{
                    winner: 1,
                    win_type: 'points',
                    winning_side: 'corp',
                    prestige: 2
                  },
                  {
                    winner: 1,
                    win_type: 'points',
                    winning_side: 'runner',
                    prestige: 2
                }],
            },
        ],
        elimMatches: [

        ],
        used_bye: false,
    },
    {
        id: 3,
        fullName: 'Philip Leavitt',
        superBye: false,
        corpId: 'Making News',
        runnerId: 'Exile: Streethawk',
        swiss_place: 3,
        overall_place: null,
        strength_of_schedule: 2,
        opponents: [4],
        prestige: 2,
        swissMatches: [
            {
                bye: false,
                players: [3, 4],
                games: [{
                    winner: 3,
                    win_type: 'points',
                    winning_side: 'runner',
                    prestige: 2
                  },
                  {
                    winner: 4,
                    win_type: 'points',
                    winning_side: 'runner',
                    prestige: 2
                }],
            },
        ],
        elimMatches: [

        ],
        used_bye: false,
    },
    {
        id: 4,
        fullName: 'Isaac Leavitt',
        superBye: false,
        corpId: 'Engineering the Future',
        runnerId: 'Andromeda: Dispossessed Ristie',
        swiss_place: 3,
        overall_place: null,
        strength_of_schedule: 2,
        prestige: 4,
        opponents: [3],
        swissMatches: [
            {
                bye: false,
                players: [3, 4],
                games: [
                    {
                      winner: 4,
                      win_type: 'points',
                      winning_side: 'runner',
                      prestige: 2
                    },
                    {
                      winner: 3,
                      win_type: 'points',
                      winning_side: 'runner',
                      prestige: 2
                    },
                  ]
            },
        ],
        elimMatches: [

        ],
        used_bye: false,
    },
    {
        id: 5,
        fullName: 'Elmon Apgood',
        superBye: false,
        corpId: 'Engineering the Future',
        runnerId: 'Andromeda: Dispossessed Ristie',
        swiss_place: 3,
        overall_place: null,
        strength_of_schedule: 2,
        prestige: 4,
        opponents: [6],
        swissMatches: [
            {
                bye: false,
                players: [5, 6],
                games: [
                    {
                      winner: 5,
                      win_type: 'points',
                      winning_side: 'runner',
                      prestige: 2
                    },
                    {
                      winner: 5,
                      win_type: 'points',
                      winning_side: 'runner',
                      prestige: 2
                    },
                  ]
            },
        ],
        elimMatches: [

        ],
        used_bye: false,
    },
    {
        id: 6,
        fullName: 'Austin Anderson',
        superBye: false,
        corpId: 'Engineering the Future',
        runnerId: 'Andromeda: Dispossessed Ristie',
        swiss_place: 3,
        overall_place: null,
        strength_of_schedule: 2,
        prestige: 0,
        opponents: [5],
        swissMatches: [
            {
                bye: false,
                players: [5, 6],
                games: [
                    {
                      winner: 5,
                      win_type: 'points',
                      winning_side: 'runner',
                      prestige: 2
                    },
                    {
                      winner: 5,
                      win_type: 'points',
                      winning_side: 'runner',
                      prestige: 2
                    },
                  ]
            },
        ],
        elimMatches: [

        ],
        used_bye: false,
    },
    {
        id: 7,
        fullName: 'Spencer Healey',
        superBye: false,
        corpId: 'Near Earth Hub',
        runnerId: 'Professor',
        swiss_place: 3,
        overall_place: null,
        strength_of_schedule: 2,
        prestige: 4,
        opponents: [8],
        swissMatches: [
            {
                bye: false,
                players: [7, 8],
                games: [
                    {
                      winner: 7,
                      win_type: 'points',
                      winning_side: 'runner',
                      prestige: 2
                    },
                    {
                      winner: 7,
                      win_type: 'points',
                      winning_side: 'runner',
                      prestige: 2
                    },
                  ]
            },
        ],
        elimMatches: [

        ],
        used_bye: false,
    },
    {
        id: 8,
        fullName: 'Jan Jansen',
        superBye: false,
        corpId: 'Architects of Tomorrow',
        runnerId: 'Edward Kim: Humanity\'s Hammer',
        swiss_place: 3,
        overall_place: null,
        strength_of_schedule: 2,
        prestige: 0,
        opponents: [7],
        swissMatches: [
            {
                bye: false,
                players: [7, 8],
                games: [
                    {
                      winner: 7,
                      win_type: 'points',
                      winning_side: 'runner',
                      prestige: 2
                    },
                    {
                      winner: 7,
                      win_type: 'points',
                      winning_side: 'runner',
                      prestige: 2
                    },
                  ]
            },
        ],
        elimMatches: [

        ],
        used_bye: false,
    }
];



newRound = (players) => {
  let round = [];
  players = players.sort((a, b) => {
    // console.log(a.fullName, b.fullName);
    if (a.prestige === b.prestige) return b.strength_of_schedule - a.strength_of_schedule;
    else return b.prestige - a.prestige;
  });
  
  players.map((e, i) => {
    e.swiss_place = i + 1;
  });
  
  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < players.length; j++) {
      if (players[i].opponents.indexOf(players[j].id) === -1 && players[i].id !== players[j].id) {
        console.log(i, j);
        console.log(players[i].fullName, players[j].fullName);
        round.push([players[i], players[j]]);
        players.splice(j, 1);
        players.splice(i, 1);
        i = 0;
        j = 0;
      }
    }
  }
  return round;
  
};

let randomResult = function(pair) {
  let loser;
  let winner = Math.floor((Math.random() * 2));
  winner === 1 ? loser = 0 : loser = 1;
  pair[winner].prestige+=2;
  pair[winner].strength_of_schedule+=pair[loser].prestige;
  pair[loser].strength_of_schedule+=pair[winner].prestige;
  winner = Math.floor((Math.random() * 2));
  winner === 1 ? loser = 0 : loser = 1;
  pair[winner].prestige+=2;
  pair[winner].strength_of_schedule+=pair[loser].prestige;
  pair[loser].strength_of_schedule+=pair[winner].prestige;
  pair[loser].opponents.push(pair[winner].id);
  pair[winner].opponents.push(pair[loser].id);
  return pair;
};

// randomResult(currentRound[0]);

let roundCount = 0;

while (roundCount < 3) {
  if (!players[0]) console.log("Houston the players are ded");
  let currentRound = newRound(players);
  console.log(`${roundCount} before`, currentRound);
  for(let i = 0; i < currentRound.length; i++) {
    currentRound[i] = randomResult(currentRound[i]);
  }
  console.log(`${roundCount} after`, currentRound);
  players = currentRound.reduce(function(a, b) {
    return a.concat(b);
  }, []);
  roundCount++;
}

let createElimBracket = (players, bracketSize) => {
  players = players.slice(0, bracketSize);
  let elimBracket = {};
  let backtrack = (bracketSize / 2);
  let j = players.length;
  for (let i = 0; i < backtrack; i++) {
    j--;
    elimBracket[i+1] = [players[i], players[j]];
  }
  console.log(elimBracket);
};

createElimBracket(players, 8);

var topEight = createElimBracket(players, 8);
this.elimBracketStructure = {
  upperBracket: {
    round1: []
  }
}
// console.log('hi', topEight);

let resolveElimMatch = (matchId, matchData) => {
  // console.log(topEight || undefined)
  let winner;
  topEight[matchId][0].id === matchData.winner ? winner = topEight[matchId][0] : winner = topEight[matchId][1];
  topEight[matchId].map((e, i) => {
    e.elimMatches.push(matchData);
  });
  console.log('match 4', topEight[matchId]);
};

let pants = resolveElimMatch(3, {winner:1});

// players = players.sort((a, b) => {
//   console.log(a.fullName, b.fullName);
//   if (a.prestige === b.prestige) return b.strength_of_schedule - a.strength_of_schedule;
//   else return b.prestige - a.prestige;
// });

// players.map((e, i) => {
//   e.swiss_place = i + 1;
// });

// console.log(players);

    //swiss_place integer,
    // overall_place integer,
    // strength_of_schedule integer,
    // used_bye boolean