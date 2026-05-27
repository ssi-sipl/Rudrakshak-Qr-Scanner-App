import {db} from "./database.js";

export const initDatabase = () => {
  try {

    // db.execSync(`
    //     // DROP TABLE IF EXISTS scanned_data;
    //     // `)


    db.execSync(`
      CREATE TABLE IF NOT EXISTS scanned_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensorId TEXT UNIQUE,
        name TEXT,
        sensorType TEXT,
        ipAddress TEXT,
        rtspUrl TEXT,
        battery TEXT,
        status TEXT,
        latitude REAL,
        longitude REAL,
        activeShuruMode TEXT,
        syncedLocally INTEGER DEFAULT 0,
        syncedCloud INTEGER DEFAULT 0
      )
    `);

    console.log("Database initialized");
  } catch (err) {
    console.log(err);
  }
};