const Sequelize = require('sequelize');
const config = require('./config');
const uuid = require('node-uuid');

console.log('init sequelize...');

//生成uuid的方法
function generateId() {
    return uuid.v4;
}

//根据配置创建 sequelize 实例
const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

//监听数据库连接状态
sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(e => {
        console.error('Unable to connect to the database:', e);
    });

//定义统一的 id 类型
const ID_TYPE = Sequelize.STRING(50);
//定义字段的所有类型
const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN'];

//要对外暴露的定义 model 的方法
function defineModel(name, attributes) {
    var attrs = {};
    //解析外部传入的属性
    Object.keys(attributes).forEach(key => {
        var value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            //默认字段不能为 null
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    });
    //定义通用的属性
    attrs.id = {
        type: ID_TYPE,
        primaryKey: true
    };
    attrs.createAt = {
        type: Sequelize.BIGINT,
        allowNull: false
    };
    attrs.updateAt = {
        type: Sequelize.BIGINT,
        allowNull: false
    };
    attrs.version = {
        type: Sequelize.BIGINT,
        allowNull: false
    };

    //真正去定义 model
    return sequelize.define(name, attrs, {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeValidate: obj => {
                var now = Date.now();
                if (obj.isNewRecord) {
                    console.log('will create entity...' + obj);
                    if (!obj.id) {
                        obj.id = generateId();
                    }
                    obj.createAt = now;
                    obj.updateAt = now;
                    obj.version = 0;
                } else {
                    console.log('will update entity...' + obj);
                    obj.updateAt = now;
                    obj.version++;
                }
            }
        }
    });
}

//模块对外暴露的属性
var exp = {
    //定义 model 的方法
    defineModel: defineModel,
    //自动创建数据表的方法，注意：这是个异步函数
    sync: async () => {
        // only allow create ddl in non-production environment:
        if (process.env.NODE_ENV !== 'production') {
            await sequelize
                .sync({ force: true })//注意：这是个异步函数
                .then(() => {
                    console.log('Create the database tables automatically succeed.');
                })
                .catch(e => {
                    console.error('Automatically create the database table failed:', e);
                });
        } else {
            throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
        }
    }
};

//模块输出所有字段的类型
TYPES.forEach(type => {
    exp[type] = Sequelize[type];
});

exp.ID = ID_TYPE;
exp.generateId = generateId;

module.exports = exp;
