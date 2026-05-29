export const initDatabase = async () => {
  try {

    await db.execAsync(`
      PRAGMA foreign_keys = ON;
    `);

    // PROJECTS TABLE
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // AREAS TABLE
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS areas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        project_id INTEGER NOT NULL,

        area_name TEXT NOT NULL,

        UNIQUE(project_id, area_name),

        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE
      );
    `);

    // SENSORS TABLE
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sensors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        area_id INTEGER NOT NULL,

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
        syncedCloud INTEGER DEFAULT 0,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (area_id)
        REFERENCES areas(id)
        ON DELETE CASCADE
      );
    `);

    console.log("Database initialized successfully");

  } catch (error) {
    console.log(error);
  }
};