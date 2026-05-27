import * as SQLite from 'expo-sqlite';

const db= SQLite.openDatabaseSync('scanned_data.db');

const getDataFromDatabase = () => {
    const result = db.getAllSync(`SELECT * FROM scanned_data`);
    console.log("Database Query Result:", result);
  };

export {db, getDataFromDatabase};