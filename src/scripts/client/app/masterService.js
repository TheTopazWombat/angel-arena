angular.module("angel-arena").service("masterService", ['$http', function($http) {

    this.getAllCards = () => {
        return $http({
            method: 'GET',
            url: 'localhost:9000/api/cards/all'
        }).then(response => {
            console.log(response);
            let cardData = response.data.map((e, i) => {
                e.img_src = `https://netrunnerdb.com/card_image/${e.code}.png`;
                return e;
            });
            return cardData;
        });
    };

    //   this.fillCardDb = () => {
    //     return $http({
    //         method: 'GET',
    //         url: 'https://netrunnerdb.com/api/2.0/public/cards'
    //     }).then(response => {
    //         console.log(response);
    //         newData = response.data.data.map((e, i) => {
    //             e.img_src = `https://netrunnerdb.com/card_image/${e.code}.png`;
    //         });
    //         $http({
    //             method: 'POST'
    //         });
    //     });
    //   };

}]);