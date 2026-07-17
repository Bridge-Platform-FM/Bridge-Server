'use strict';

const { Faq } = require('../models');

const getActiveFaqs = async () => {
    return await Faq.findAll({
        where: {
            is_active: true,
            is_deleted: false
        },
        attributes: ['id', 'question', 'answer'],
        order: [['id', 'ASC']]
    });
};

module.exports = {
    getActiveFaqs
};