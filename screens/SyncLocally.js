import React, { useState, useEffect, useRef } from "react";

import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  Animated,
  TextInput,
  ScrollView,
} from "react-native";

import axios from "axios";

import { db } from "../database/database";

export default function SyncLocally() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(false);

  const [syncedCount, setSyncedCount] = useState(0);

  const [serverIp, setServerIp] = useState("");

  const [connectionStatus, setConnectionStatus] = useState(null);

  const [projects, setProjects] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);

  const [areas, setAreas] = useState([]);

  const [selectedAreas, setSelectedAreas] = useState([]);

  const [sensorCount, setSensorCount] = useState(0);

  useEffect(() => {
    const result = db.getAllSync(`
      SELECT *
      FROM projects
      ORDER BY id DESC
    `);

    setProjects(result);
  }, []);
  // SCREEN ANIMATION
  useEffect(() => {
    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  //VERIFY CONNECTION
  const verifyConnection = async () => {
    if (!serverIp.trim()) {
      Alert.alert("Error", "Enter Server IP");

      return;
    }

    try {
      await axios.get(`http://${serverIp}:5001/health`);

      setConnectionStatus(true);

      Alert.alert("Success", "Server Connected");
    } catch(error) {
      setConnectionStatus(false);
      console.log(error);

      Alert.alert("Failed", "Server Unreachable");
    }
  };

  //LOAD AREAS
  const loadAreas = (projectId) => {
    setSelectedProject(projectId);

    const result = db.getAllSync(
      `
      SELECT *
      FROM areas
      WHERE project_id = ?
      ORDER BY area_name
      `,
      [projectId],
    );

    setAreas(result);

    setSelectedAreas([]);

    setSensorCount(0);
  };
  //
  const toggleArea = (areaId) => {
    let updated;

    if (selectedAreas.includes(areaId)) {
      updated = selectedAreas.filter((id) => id !== areaId);
    } else {
      updated = [...selectedAreas, areaId];
    }

    setSelectedAreas(updated);

    if (updated.length === 0) {
      setSensorCount(0);

      return;
    }

    const placeholders = updated.map(() => "?").join(",");

    const sensors = db.getAllSync(
      `
      SELECT *
FROM sensors
WHERE syncedCloud = 0
AND area_id IN (${placeholders})`,
      updated,
    );

    setSensorCount(sensors.length);
  };
  // SYNC FUNCTION
  const syncToBackend = async () => {
    try {
      if (connectionStatus !== true) {
        Alert.alert("Error", "Verify connection first");
        return;
      }

      if (selectedAreas.length === 0) {
        Alert.alert("Error", "Select at least one area");

        return;
      }

      setLoading(true);

      const placeholders = selectedAreas.map(() => "?").join(",");

      const selectedAreaData = db.getAllSync(
        `
        SELECT *
        FROM areas
        WHERE id IN (${placeholders})
        `,
        selectedAreas,
      );

      const sensors = db.getAllSync(
        `
        SELECT *
        FROM sensors
        WHERE area_id IN (${placeholders})
        `,
        selectedAreas,
      );

      const response = await axios.post(`http://${serverIp}:5001/api/sync`, {
        areas: selectedAreaData,

        sensors,
      });

      sensors.forEach((item) => {
        db.runSync(
          `
          UPDATE sensors
          SET syncedCloud = 1
          WHERE id = ?
          `,
          [item.id],
        );
      });

      setSyncedCount(sensors.length);

      Alert.alert("Success", `${sensors.length} sensors synced`);
    } catch (error) {
      console.log(error);

      Alert.alert("Sync Failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
      }}
      style={{
        backgroundColor: "#EEF3F4",
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          flex: 1,
        }}
      >
        {/* HEADER */}
        <Text
          className="text-4xl font-bold"
          style={{
            color: "#111827",
          }}
        >
          Cloud Sync
        </Text>

        <Text
          className="mt-2 text-sm"
          style={{
            color: "#6B7280",
          }}
        >
          Upload local sensor data to cloud
        </Text>

        {/* STATUS CARD */}
        <View
          className="mt-10 rounded-[32px] p-6"
          style={{
            backgroundColor: "#FFFFFF",

            shadowColor: "#000",

            shadowOpacity: 0.04,

            shadowRadius: 10,

            shadowOffset: {
              width: 0,
              height: 4,
            },

            elevation: 2,
          }}
        >
          {/* ICON */}
          <View
            className="h-16 w-16 items-center justify-center rounded-full self-center"
            style={{
              backgroundColor: "#DDF4F5",
            }}
          >
            <Text className="text-2xl">☁️</Text>
          </View>

          {/* TITLE */}
          <Text
            className="mt-5 text-center text-xl font-semibold"
            style={{
              color: "#111827",
            }}
          >
            Sync Sensor Data
          </Text>

          {/* DESCRIPTION */}
          <Text
            className="mt-3 text-center text-sm leading-6"
            style={{
              color: "#6B7280",
            }}
          >
            Securely transfer locally stored sensor information to your backend
            server.
          </Text>
        </View>

        <TextInput
          placeholder="192.168.1.100"
          value={serverIp}
          onChangeText={setServerIp}
          className="mt-4 rounded-full px-5 py-4"
          style={{
            backgroundColor: "#F3F7F8",
          }}
        />

        <Pressable
          onPress={verifyConnection}
          className="mt-3 rounded-full py-3"
          style={{
            backgroundColor: "#DDF4F5",
          }}
        >
          <Text
            className="text-center font-semibold"
            style={{
              color: "#0F9BA8",
            }}
          >
            Verify Connection
          </Text>
        </Pressable>

        {connectionStatus !== null && (
          <Text
            className="mt-3 text-center"
            style={{
              color: connectionStatus ? "green" : "red",
            }}
          >
            {connectionStatus ? "Connected" : "Disconnected"}
          </Text>
        )}
        {/* PROJECTS */}
        <View
          className="mt-6 rounded-[24px] p-4"
          style={{
            backgroundColor: "#FFFFFF",
          }}
        >
          <Text
            className="mb-3 text-sm font-semibold"
            style={{
              color: "#111827",
            }}
          >
            Select Project
          </Text>

          {projects.length === 0 ? (
            <Text
              style={{
                color: "#6B7280",
              }}
            >
              No Projects Found
            </Text>
          ) : (
            projects.map((project) => (
              <Pressable
                key={project.id}
                onPress={() => loadAreas(project.id)}
                className="mb-2 rounded-2xl px-4 py-3"
                style={{
                  backgroundColor:
                    selectedProject === project.id ? "#0F9BA8" : "#F3F7F8",
                }}
              >
                <Text
                  style={{
                    color:
                      selectedProject === project.id ? "#FFFFFF" : "#111827",

                    fontWeight: "600",
                  }}
                >
                  {project.project_name}
                </Text>
              </Pressable>
            ))
          )}
        </View>
        {/* AREAS */}
        {selectedProject && (
          <View
            className="mt-4 rounded-[24px] p-4"
            style={{
              backgroundColor: "#FFFFFF",
            }}
          >
            <Text
              className="mb-3 text-sm font-semibold"
              style={{
                color: "#111827",
              }}
            >
              Select Areas
            </Text>

            {areas.length === 0 ? (
              <Text
                style={{
                  color: "#6B7280",
                }}
              >
                No Areas Found
              </Text>
            ) : (
              areas.map((area) => (
                <Pressable
                  key={area.id}
                  onPress={() => toggleArea(area.id)}
                  className="mb-2 flex-row items-center rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor: selectedAreas.includes(area.id)
                      ? "#DDF4F5"
                      : "#F3F7F8",
                  }}
                >
                  <Text className="mr-3 text-lg">
                    {selectedAreas.includes(area.id) ? "☑" : "☐"}
                  </Text>

                  <Text
                    style={{
                      color: "#111827",
                      fontWeight: "500",
                    }}
                  >
                    {area.area_name}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        )}

        {/* SUMMARY */}
        {selectedAreas.length > 0 && (
          <View
            className="mt-4 rounded-[24px] p-4"
            style={{
              backgroundColor: "#FFFFFF",
            }}
          >
            <Text
              className="text-center text-sm"
              style={{
                color: "#6B7280",
              }}
            >
              Selected Areas
            </Text>

            <Text
              className="mt-2 text-center text-3xl font-bold"
              style={{
                color: "#0F9BA8",
              }}
            >
              {selectedAreas.length}
            </Text>

            <Text
              className="mt-4 text-center text-sm"
              style={{
                color: "#6B7280",
              }}
            >
              Sensors Found
            </Text>

            <Text
              className="mt-2 text-center text-3xl font-bold"
              style={{
                color: "#0F9BA8",
              }}
            >
              {sensorCount}
            </Text>
          </View>
        )}
        {/* BUTTONS */}
        <View className="mt-8">
          {/* MAIN BUTTON */}
          <Pressable
            onPress={syncToBackend}
            disabled={loading}
            className="rounded-full py-4 active:scale-95"
            style={{
              backgroundColor: "#0F9BA8",

              shadowColor: "#0F9BA8",

              shadowOpacity: 0.18,

              shadowRadius: 8,

              shadowOffset: {
                width: 0,
                height: 4,
              },

              elevation: 4,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-center text-base font-semibold text-white">
                Sync Now
              </Text>
            )}
          </Pressable>

          {/* SECONDARY BUTTON */}
        </View>
      </Animated.View>
    </ScrollView>
  );
}
