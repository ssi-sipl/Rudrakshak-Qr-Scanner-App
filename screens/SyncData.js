import React, { useState } from "react";

import {
  View,
  Text,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";

import axios from "axios";

import db from "../database/database";

export default function SyncData() {

  const [loading, setLoading] = useState(false);

  const syncToBackend = async () => {

    try {

      setLoading(true);

      const result = db.getAllSync(
        "SELECT * FROM scanned_data WHERE syncedCloud = 0"
      );

      console.log(result);

      if (result.length === 0) {

        Alert.alert("No new data to sync");
        return;

      }

      // SEND DATA TO YOUR BACKEND
      const response = await axios.post(
        "http://192.168.88.11:3000/sync",
        {
          data: result,
        }
      );

      console.log(response.data);

      // MARK AS SYNCED
      result.forEach((item) => {

        db.runSync(
          "UPDATE scanned_data SET syncedCloud = 1 WHERE id = ?",
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
  };

  return (

    <View style={{ padding: 20 }}>

      <Text>Sync Data</Text>

      {loading ? (

        <ActivityIndicator size="large" />

      ) : (

        <Button
          title="Sync Now"
          onPress={syncToBackend}
        />

      )}

    </View>
  );
}