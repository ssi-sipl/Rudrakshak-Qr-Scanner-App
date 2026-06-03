import { View, Button } from "react-native";
import { useEffect } from "react";

import { db } from "../database/database";
import { seedData } from "../scripts/seedData";

export default function DataSeed() {

  useEffect(() => {
    const getCounts = async () => {
      try {
        const projectCount = await db.getFirstAsync(
          "SELECT COUNT(*) as count FROM projects"
        );

        const areaCount = await db.getFirstAsync(
          "SELECT COUNT(*) as count FROM areas"
        );

        const sensorCount = await db.getFirstAsync(
          "SELECT COUNT(*) as count FROM sensors"
        );

        console.log("Projects:", projectCount?.count);
        console.log("Areas:", areaCount?.count);
        console.log("Sensors:", sensorCount?.count);

      } catch (error) {
        console.log("Count Error:", error);
      }
    };

    getCounts();
  }, );

  return (
    <View style={{ marginTop: 100 }}>
      <Button
        title="Seed 1000 Sensors"
        onPress={async () => {
          try {
            await seedData();

            const projectCount = await db.getFirstAsync(
              "SELECT COUNT(*) as count FROM projects"
            );

            const areaCount = await db.getFirstAsync(
              "SELECT COUNT(*) as count FROM areas"
            );

            const sensorCount = await db.getFirstAsync(
              "SELECT COUNT(*) as count FROM sensors"
            );

            console.log("===== AFTER SEED =====");
            console.log("Projects:", projectCount?.count);
            console.log("Areas:", areaCount?.count);
            console.log("Sensors:", sensorCount?.count);
            console.log("======================");

          } catch (error) {
            console.log("Seed Error:", error);
          }
        }}
      />
    </View>
  );
}