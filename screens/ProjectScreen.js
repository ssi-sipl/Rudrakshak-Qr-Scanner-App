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

export default function ProjectScreen({
  navigation,
}) {

  const fadeAnim =
    useRef(new Animated.Value(0)).current;

  const [projects, setProjects] =
    useState([]);

  const [search, setSearch] =
    useState("");

  // FETCH PROJECTS
  const fetchProjects = async () => {

    try {

      const result =
        await db.getAllAsync(`
          SELECT *
          FROM projects
          ORDER BY id DESC
        `);

      setProjects(result);

    } catch (error) {
      console.log(error);
    }
  };

  // DELETE PROJECT
  
  const deleteProject = (
  projectId,
  projectName
) => {

  Alert.alert(
    "Delete Project",
    `Delete "${projectName}" ?`,
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
            "All areas and sensors inside this project will be deleted permanently.",
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
                      DELETE FROM projects
                      WHERE id = ?
                      `,
                      [projectId]
                    );

                    await fetchProjects();

                    Alert.alert(
                      "Success",
                      "Project deleted successfully"
                    );

                  } catch (error) {

                    console.log(error);

                    Alert.alert(
                      "Error",
                      "Failed to delete project",
                      error
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
  // FILTER PROJECTS
  const filteredProjects =
    useMemo(() => {

      return projects.filter((item) =>
        item.project_name
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );

    }, [projects, search]);

  // SCREEN LOAD
  useFocusEffect(
    useCallback(() => {

      fetchProjects();

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

        {/* HEADER */}
        <Text
          className="text-4xl font-bold"
          style={{
            color: "#111827",
          }}
        >
          Explore
        </Text>

        <Text
          className="mt-2 text-sm"
          style={{
            color: "#6B7280",
          }}
        >
          Select your project
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
            placeholder="Search project"
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base"
          />

        </View>

        {/* TOP BUTTONS */}
        <View className="mt-5 flex-row">

          <Pressable
            onPress={fetchProjects}
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

          <Pressable
            onPress={() =>
              navigation.navigate(
                "AddProjectScreen"
              )
            }
            className="rounded-full px-4 py-3 active:scale-95"
            style={{
              backgroundColor: "#0F9BA8",
            }}
          >
            <Text className="text-sm font-semibold text-white">
              + Project
            </Text>
          </Pressable>

        </View>

        {/* PROJECT LIST */}
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) =>
            item.id.toString()
          }
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
                No Projects Found
              </Text>
            </View>
          )}

          renderItem={({ item }) => (

            <Pressable
              onPress={() =>
                navigation.navigate(
                  "AreaScreen",
                  {
                    projectId: item.id,
                    projectName:
                      item.project_name,
                  }
                )
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
                    {item.project_name}
                  </Text>

                  <Text
                    className="mt-1 text-xs"
                    style={{
                      color: "#6B7280",
                    }}
                  >
                    Tap to open project
                  </Text>

                </View>

                <View className="flex-row">

                  <View
                    className="rounded-full px-4 py-2 mr-2"
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

                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      deleteProject(
                        item.id,
                        item.project_name
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

        {/* BOTTOM ACTIONS */}
        <View className="pb-8">

          <Pressable
            onPress={() =>
              navigation.navigate(
                "SyncLocally"
              )
            }

            className="rounded-[24px] px-5 py-4 active:scale-95"

            style={{
              backgroundColor: "#FFFFFF",
            }}
          >

            <Text
              className="text-center text-sm font-semibold"
              style={{
                color: "#111827",
              }}
            >
              Local Sync
            </Text>

            <Text
              className="mt-1 text-center text-xs"
              style={{
                color: "#6B7280",
              }}
            >
              Sync without internet
            </Text>

          </Pressable>

          
        </View>

      </Animated.View>

    </View>
  );
}