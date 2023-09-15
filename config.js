'use strict'

require("dotenv").config();

const is_production = (process.env.NODE_ENV === 'production');
const no_auth_redirect_url = is_production ? process.env.OLAT_URL : '/logicjs/app/home';

module.exports.is_production = is_production;
module.exports.no_auth_redirect_url = no_auth_redirect_url;
