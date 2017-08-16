export default (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    access: {
      type: DataTypes.ENUM,
      values: ['Public', 'Private', 'Role']
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  });
  Document.associate = (models) => {
    Document.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });
  };
  return Document;
};
