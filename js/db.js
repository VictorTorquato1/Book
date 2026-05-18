// Configuração do banco de dados SQLite para usuários
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db');

// Criação da tabela de usuários, se não existir
const createUsersTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);
};

createUsersTable();

module.exports = db;