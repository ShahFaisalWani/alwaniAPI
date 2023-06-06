'use strict';

/**
 * pre-tour service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::pre-tour.pre-tour');
