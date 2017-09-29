const db = require('../db');

db.defineModel('pets', {
    name: db.STRING(50),
    birth: db.STRING(10),
    gender: db.BOOLEAN
});