const {Sequelize} = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

export const Client = sequelize.define('gpt_dock_client_data', {
  client_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  product_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  _updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  max_quota: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 500000
  },
  token_quota: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 500000
  },
  version: {
    type: Sequelize.BIGINT,
    allowNull: false
  }
}, {
  timestamps: false,
  underscored: true
});

export const User = sequelize.define('gpt_dock_user_data', {
  user_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  org_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  _updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  token_used: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  version: {
    type: Sequelize.BIGINT,
    allowNull: false,
    defaultValue: 1
  }
}, {
  timestamps: false,
  underscored: true
});

export const Diagram = sequelize.define('gpt_dock_diagram_data', {
  content_id: {
    type: Sequelize.STRING,
    allowNull: false
  },
  dsl_code: {
    type: Sequelize.STRING,
    allowNull: true
  },
  creator_id: {
    type: Sequelize.STRING,
    allowNull: false
  },
  _updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  org_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  version: {
    type: Sequelize.BIGINT,
    allowNull: false,
    defaultValue: 1
  }
}, {
  timestamps: false,
  underscored: true
});

async function init() {
  await Client.sync();
  await User.sync();
  await Diagram.sync();
}

init();
