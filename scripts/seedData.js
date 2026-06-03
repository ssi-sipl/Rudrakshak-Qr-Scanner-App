import { db } from "../database/database";

export const seedData = async () => {
  try {
    const start = Date.now();

    let projects = 0;
    let areas = 0;
    let sensors = 0;

    await db.withTransactionAsync(async () => {

      for (let p = 1; p <= 10; p++) {

        const project = await db.runAsync(
          `INSERT INTO projects (project_name)
           VALUES (?)`,
          [`Project ${Date.now()}-${p}`]
        );

        projects++;

        const projectId = project.lastInsertRowId;

        for (let a = 1; a <= 10; a++) {

          const area = await db.runAsync(
            `INSERT INTO areas (
              project_id,
              areaId,
              area_name
            )
            VALUES (?, ?, ?)`,
            [
              projectId,
              `AREA-${p}-${a}`,
              `Area ${p}-${a}-${Date.now()}`
            ]
          );

          areas++;

          const areaId = area.lastInsertRowId;

          for (let s = 1; s <= 10; s++) {

            await db.runAsync(
              `INSERT INTO sensors (
                area_id,
                sensorId,
                name,
                sensorType,
                ipAddress,
                rtspUrl,
                battery,
                status
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                areaId,
                `SENSOR-${p}-${a}-${s}-${Date.now()}`,
                `Camera ${s}`,
                "CCTV",
                `192.168.${a}.${s}`,
                `rtsp://camera-${s}`,
                "100%",
                "Active"
              ]
            );

            sensors++;
          }
        }
      }
    });

    const end = Date.now();

    console.log("========== RESULTS ==========");
    console.log("Projects:", projects);
    console.log("Areas:", areas);
    console.log("Sensors:", sensors);
    console.log("Time:", (end - start) / 1000, "seconds");
    console.log("============================");

  } catch (error) {
    console.log("Seed Error:", error);
  }
};