'use strict';

/**
 * full-tour service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::full-tour.full-tour');
