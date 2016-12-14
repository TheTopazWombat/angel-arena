const server = require('../server');
const config = require('../_config');
import axios from 'axios';

module.exports = {

  flightsFrom: (req, res) => {
    axios.get('http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/us/usd/en-us/' + req.body.origin + '/anywhere/anytime/anytime?apiKey=' + config.skyscanner.API_KEY)
    //NOTE: market / currency / locale / origin / destination / outbound date / inbound date
    .then(function (response) {
      console.log(response.data);
      res.send(response.data);
    })
    .catch(function (error) {
      console.log(error);
      res.send(error);
    });
  }

};
