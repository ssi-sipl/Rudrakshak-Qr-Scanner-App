import {
  View,
  Text,
  Pressable,
  Animated,
  FlatList,
  TextInput,
  Alert,
} from "react-native";

import {
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

import {
  useFocusEffect,
} from "@react-navigation/native";

import { db } from "../database/database";

export default function SensorScreen({
  navigation,
  route,
}) {

  const fadeAnim =
    useRef(new Animated.Value(0)).current;

  const {
    projectId,
    projectName,
    areaId,
    areaName,
  } = route.params;

  const [sensors, setSensors] =
    useState([]);

  const [search, setSearch] =
    useState("");

  // FETCH SENSORS
  const fetchSensors = async () => {

    try {

      const result =
        await db.getAllAsync(
          `
          SELECT *
          FROM sensors
          WHERE area_id = ?
          ORDER BY id DESC
          `,
          [areaId]
        );

      setSensors(result);

    } catch (error) {
      console.log(error);
    }
  };

  // DELETE SENSOR
  const deleteSensor = (
    sensorId,
    sensorName
  ) => {

    Alert.alert(
      "Delete Sensor",
      `Delete "${sensorName}" ?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: () => {

            Alert.alert(
              "Final Confirmation",
              "This sensor will be permanently deleted.",
              [
                {
                  text: "No",
                  style: "cancel",
                },

                {
                  text: "Yes Delete",
                  style: "destructive",

                  onPress: async () => {

                    try {

                      await db.runAsync(
                        `
                        DELETE FROM sensors
                        WHERE id = ?
                        `,
                        [sensorId]
                      );

                      await fetchSensors();

                      Alert.alert(
                        "Success",
                        "Sensor deleted successfully"
                      );

                    } catch (error) {

                      console.log(error);

                      Alert.alert(
                        "Error",
                        "Failed to delete sensor"
                      );
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // FILTER
  const filteredSensors =
    useMemo(() => {

      return sensors.filter((item) =>

        item.name
          ?.toLowerCase()
          .includes(search.toLowerCase())

        ||

        item.sensorType
          ?.toLowerCase()
          .includes(search.toLowerCase())

        ||

        item.sensorId
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );

    }, [sensors, search]);

  useFocusEffect(
    useCallback(() => {

      fetchSensors();

      fadeAnim.setValue(0);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

    }, [])
  );

  return (

    <View
      className="flex-1 px-5 pt-16"
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

        <Text
          className="text-4xl font-bold"
          style={{
            color: "#111827",
          }}
        >
          Sensors
        </Text>

        <Text
          className="mt-2 text-sm"
          style={{
            color: "#6B7280",
          }}
        >
          {projectName} • {areaName}
        </Text>

        {/* SEARCH */}
        <View
          className="mt-5 flex-row items-center rounded-full px-5 py-4"
          style={{
            backgroundColor: "#FFFFFF",
          }}
        >

          <Text className="mr-3">
            🔍
          </Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search sensor"
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base"
          />

        </View>

        {/* TOP BUTTONS */}
        <View className="mt-5 flex-row">

          <Pressable
            onPress={fetchSensors}
            className="mr-3 rounded-full px-4 py-3"
            style={{
              backgroundColor: "#DDF4F5",
            }}
          >
            <Text
              style={{
                color: "#0F9BA8",
              }}
            >
              Refresh
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              navigation.navigate(
                "QRScanner",
                {
                  projectId,
                  projectName,
                  areaId,
                  areaName,
                }
              )
            }

            className="rounded-full px-4 py-3"

            style={{
              backgroundColor: "#0F9BA8",
            }}
          >
            <Text className="text-white">
              + Scan QR
            </Text>
          </Pressable>

        </View>

        {/* LIST */}
        <FlatList
          data={filteredSensors}
          keyExtractor={(item) =>
            item.id.toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: 40,
          }}
          renderItem={({ item }) => (

            <View
              className="mb-4 rounded-[28px] p-5"
              style={{
                backgroundColor: "#FFFFFF",
              }}
            >

              <Text
                className="text-lg font-semibold"
                style={{
                  color: "#111827",
                }}
              >
                {item.name}
              </Text>

              <Text
                className="mt-1 text-sm"
                style={{
                  color: "#6B7280",
                }}
              >
                {item.sensorType}
              </Text>

              <Text
                className="mt-3 text-xs"
                style={{
                  color: "#94A3B8",
                }}
              >
                Sensor ID
              </Text>

              <Text
                style={{
                  color: "#374151",
                }}
              >
                {item.sensorId}
              </Text>

              <View className="mt-5 flex-row">

                {/* EDIT */}
                <Pressable
                  onPress={() =>
                    navigation.navigate(
                      "ScannedData",
                      {
                        editMode: true,
                        sensorData: item,
                        projectId,
                        projectName,
                        areaId,
                        areaName,
                      }
                    )
                  }

                  className="mr-2 flex-1 rounded-full py-3"

                  style={{
                    backgroundColor: "#F3F7F8",
                  }}
                >

                  <Text
                    className="text-center font-semibold"
                    style={{
                      color: "#111827",
                    }}
                  >
                    Edit
                  </Text>

                </Pressable>

                {/* VIEW */}
                <Pressable
                  onPress={() =>
                    navigation.navigate(
                      "ScannedData",
                      {
                        editMode: false,
                        sensorData: item,
                        projectId,
                        projectName,
                        areaId,
                        areaName,
                      }
                    )
                  }

                  className="mr-2 flex-1 rounded-full py-3"

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
                    View
                  </Text>

                </Pressable>

                {/* DELETE */}
                <Pressable
                  onPress={() =>
                    deleteSensor(
                      item.id,
                      item.name
                    )
                  }

                  className="flex-1 rounded-full py-3"

                  style={{
                    backgroundColor: "#FEE2E2",
                  }}
                >

                  <Text
                    className="text-center font-semibold"
                    style={{
                      color: "#DC2626",
                    }}
                  >
                    Delete
                  </Text>

                </Pressable>

              </View>

            </View>
          )}

          ListEmptyComponent={() => (

            <View className="mt-20 items-center">

              <Text
                style={{
                  color: "#94A3B8",
                }}
              >
                No Sensors Found
              </Text>

            </View>
          )}
        />

      </Animated.View>

    </View>
  );
}