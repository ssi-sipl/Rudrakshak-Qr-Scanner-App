import * as SQLite from 'expo-sqlite';

const db= SQLite.openDatabaseSync('scanned_data.db');

export default db;