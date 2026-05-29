import * as SQLite from 'expo-sqlite';

const db= SQLite.openDatabaseSync('sensors.db');
const getDataFromDatabase = () => {
    const result = db.getAllSync(`SELECT * FROM sensors`);
    console.log("Database Query Result:", result);
  };

export { db, getDataFromDatabase};