import { useState } from "react";
import {Text, View, ActivityIndicator, Button ,Alert} from "react-native";
import {db} from "../database/database.js";
import axios from "axios";

export default function SyncLocally()
{
    const [loading, setLoading] = useState(false);
    
    const syncLocally = async () =>
    {

    try {

      setLoading(true);

      const result = db.getAllSync(
        "SELECT * FROM scanned_data WHERE syncedLocally = 0"
      );

      console.log(result);

      if (result.length === 0) {

        Alert.alert("No new data to sync");
        return;

      }

      // SEND DATA TO YOUR BACKEND
     const cleanedData = result.map(({ id, ...rest }) => rest);

     const response = await axios.post(
     "http://192.168.88.11:5001/api/sync",
     {
         data: cleanedData,
     }
     );

      console.log(response.data);

      // MARK AS SYNCED
      result.forEach((item) => {

        db.runSync(
          "UPDATE scanned_data SET syncedLocally = 1 WHERE id = ?",
          [item.id]
        );

      });

      Alert.alert("Data synced successfully");

    } catch (error) {

      console.log(error?.response?.data || error);

      Alert.alert("Sync failed");

    } finally {

      setLoading(false);

    }

    }

    return (
    
        <View style={{ padding: 20 }}>
    
          <Text>Sync Data</Text>
    
          {loading ? (
    
            <ActivityIndicator size="large" />
    
          ) : (
    
            <Button
              title="Sync Now"
              onPress={syncLocally}
            />
    
          )}
    
        </View>
      );
}