import {
  View,
  Text,
  Pressable,
  Animated,
  FlatList,
  TextInput,
  Alert
} from "react-native";

import { useRef, useState, useCallback, useMemo } from "react";

import { useFocusEffect } from "@react-navigation/native";

import { db } from "../database/database";

export default function AreaScreen({ navigation, route }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ROUTE PARAMS
  const { projectId, projectName } = route.params;

  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);

  const [search, setSearch] = useState("");

  // FETCH AREAS
  const fetchAreas = async () => {
    try {
      const result = await db.getAllAsync(
        `
          SELECT *
          FROM areas
          WHERE project_id = ?
          ORDER BY id DESC
          `,
        [projectId],
      );

      setAreas(result);
    } catch (error) {
      console.log(error);
    }
  };

  // FILTER AREAS
  const filteredAreas = useMemo(() => {
    return areas.filter((item) =>
      item.area_name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [areas, search]);

  // AUTO REFRESH
  useFocusEffect(
    useCallback(() => {
      fetchAreas();

      fadeAnim.setValue(0);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, []),
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
        {/* HEADER */}
        <Text
          className="text-4xl font-bold"
          style={{
            color: "#111827",
          }}
        >
          Areas
        </Text>

        <Text
          className="mt-2 text-sm"
          style={{
            color: "#6B7280",
          }}
        >
          {projectName}
        </Text>

        {/* SEARCH */}
        <View
          className="mt-5 flex-row items-center rounded-full px-5 py-4"
          style={{
            backgroundColor: "#FFFFFF",
          }}
        >
          <Text
            className="mr-3 text-base"
            style={{
              color: "#9CA3AF",
            }}
          >
            🔍
          </Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search area"
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base"
          />
        </View>

        {/* ACTION BUTTONS */}
        <View className="mt-5 flex-row">
          {/* REFRESH */}
          <Pressable
            onPress={fetchAreas}
            className="mr-3 rounded-full px-4 py-3 active:scale-95"
            style={{
              backgroundColor: "#DDF4F5",
            }}
          >
            <Text
              className="text-sm font-semibold"
              style={{
                color: "#0F9BA8",
              }}
            >
              Refresh
            </Text>
          </Pressable>

          {/* ADD AREA */}
          <Pressable
            onPress={() =>
              navigation.navigate("AddAreaScreen", {
                projectId,
                projectName,
              })
            }
            className="rounded-full px-4 py-3 active:scale-95"
            style={{
              backgroundColor: "#0F9BA8",
            }}
          >
            <Text className="text-sm font-semibold text-white">+ Area</Text>
          </Pressable>
        </View>

        {/* AREA LIST */}
        <FlatList
          data={filteredAreas}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: 40,
          }}
          ListEmptyComponent={() => (
            <View className="mt-20 items-center">
              <Text
                style={{
                  color: "#94A3B8",
                }}
              >
                No Areas Found
              </Text>
            </View>
          )}
          //
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate("SensorScreen", {
                  areaId: item.id,
                  areaName: item.area_name,

                  projectId,
                  projectName,
                })
              }
              className="mb-4 rounded-[28px] p-4 active:scale-95"
              style={{
                backgroundColor: "#FFFFFF",

                shadowColor: "#000",

                shadowOpacity: 0.04,

                shadowRadius: 8,

                shadowOffset: {
                  width: 0,
                  height: 3,
                },

                elevation: 2,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text
                    className="text-lg font-semibold"
                    style={{
                      color: "#111827",
                    }}
                  >
                    {item.area_name}
                  </Text>

                  <Text
                    className="mt-1 text-xs"
                    style={{
                      color: "#6B7280",
                    }}
                  >
                    Tap to open area
                  </Text>
                </View>

                <View className="flex-row">
                  {/* OPEN */}
                  <View
                    className="mr-2 rounded-full px-4 py-2"
                    style={{
                      backgroundColor: "#E8F7F8",
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{
                        color: "#0F9BA8",
                      }}
                    >
                      Open
                    </Text>
                  </View>

                  {/* DELETE */}
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();

                      Alert.alert(
                        "Delete Area",
                        `Delete "${item.area_name}" ?`,
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
                                "All sensors inside this area will be deleted permanently.",
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
                                DELETE FROM areas
                                WHERE id = ?
                                `,
                                          [item.id],
                                        );

                                        await fetchAreas();

                                        Alert.alert(
                                          "Success",
                                          "Area deleted successfully",
                                        );
                                      } catch (error) {
                                        console.log(error);

                                        Alert.alert(
                                          "Error",
                                          "Failed to delete area",
                                        );
                                      }
                                    },
                                  },
                                ],
                              );
                            },
                          },
                        ],
                      );
                    }}
                    className="rounded-full px-4 py-2"
                    style={{
                      backgroundColor: "#FEE2E2",
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{
                        color: "#DC2626",
                      }}
                    >
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          )}
        />
      </Animated.View>
    </View>
  );
}
