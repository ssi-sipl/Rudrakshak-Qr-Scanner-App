import React, {
  useState,
} from "react";

import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";

import {
  useRef,
  useEffect,
} from "react";

import { db } from "../database/database.js";

import axios from "axios";

export default function SyncLocally() {

  const fadeAnim =
    useRef(new Animated.Value(0)).current;

  const [loading, setLoading] =
    useState(false);

  const [insertedCount, setInsertedCount] =
    useState(0);

  const [duplicateCount, setDuplicateCount] =
    useState(0);

  // SCREEN ANIMATION
  useEffect(() => {

    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

  }, []);

  // LOCAL SYNC
  const syncLocally = async () => {

    try {

      setLoading(true);

      // FETCH UNSYNCED DATA
      const result = db.getAllSync(
        `
        SELECT *
        FROM scanned_data
        WHERE syncedLocally = 0
        `
      );

      console.log(result);

      // NO DATA
      if (result.length === 0) {

        Alert.alert(
          "Already Synced",
          "No new data available"
        );

        return;
      }

      // REMOVE LOCAL ID
      const cleanedData =
        result.map(
          ({ id, ...rest }) => rest
        );

      // SEND TO BACKEND
      const response =
        await axios.post(
          `http://${process.env.EXPO_PUBLIC_BACKEND_IP}:${process.env.EXPO_PUBLIC_PORT}/api/sync`,
          {
            data: cleanedData,
          }
        );

      console.log(response.data);

      const {
        insertedCount,
        duplicateCount,
        duplicates,
      } = response.data;

      // UPDATE UI COUNTS
      setInsertedCount(insertedCount);

      setDuplicateCount(duplicateCount);

      // MARK INSERTED ONLY
      result.forEach((item) => {

        if (
          !duplicates.includes(
            item.sensorId
          )
        ) {

          db.runSync(
            `
            UPDATE scanned_data
            SET syncedLocally = 1
            WHERE id = ?
            `,
            [item.id]
          );
        }
      });

      Alert.alert(
        "Sync Complete",
        `${insertedCount} inserted\n${duplicateCount} duplicates skipped`
      );

    } catch (error) {

      console.log(
        error?.response?.data || error
      );

      const errorMessage =
        error?.response?.data?.message
        || "Something went wrong";

      Alert.alert(
        "Sync Failed",
        errorMessage
      );

    } finally {

      setLoading(false);

    }
  };

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
          Local Sync
        </Text>

        <Text
          className="mt-2 text-sm"

          style={{
            color: "#6B7280",
          }}
        >
          Sync sensor data inside local network
        </Text>

        {/* MAIN CARD */}
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
            className="h-16 w-16 self-center items-center justify-center rounded-full"

            style={{
              backgroundColor: "#DDF4F5",
            }}
          >

            <Text className="text-2xl">
              📡
            </Text>

          </View>

          {/* TITLE */}
          <Text
            className="mt-5 text-center text-xl font-semibold"

            style={{
              color: "#111827",
            }}
          >
            Network Data Sync
          </Text>

          {/* DESCRIPTION */}
          <Text
            className="mt-3 text-center text-sm leading-6"

            style={{
              color: "#6B7280",
            }}
          >
            Transfer sensor records securely
            across devices connected on the
            same local network.
          </Text>

          {/* STATS */}
          <View className="mt-6 flex-row justify-between">

            {/* INSERTED */}
            <View
              className="flex-1 rounded-[24px] p-4 mr-2"

              style={{
                backgroundColor: "#F3F7F8",
              }}
            >

              <Text
                className="text-center text-xs"

                style={{
                  color: "#94A3B8",
                }}
              >
                INSERTED
              </Text>

              <Text
                className="mt-2 text-center text-3xl font-bold"

                style={{
                  color: "#0F9BA8",
                }}
              >
                {insertedCount}
              </Text>

            </View>

            {/* DUPLICATES */}
            <View
              className="flex-1 rounded-[24px] p-4 ml-2"

              style={{
                backgroundColor: "#FDF2F2",
              }}
            >

              <Text
                className="text-center text-xs"

                style={{
                  color: "#F87171",
                }}
              >
                DUPLICATES
              </Text>

              <Text
                className="mt-2 text-center text-3xl font-bold"

                style={{
                  color: "#DC2626",
                }}
              >
                {duplicateCount}
              </Text>

            </View>

          </View>

        </View>

        {/* ACTION BUTTON */}
        <View className="mt-8">

          <Pressable
            onPress={syncLocally}

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

            {
              loading ? (

                <ActivityIndicator
                  color="#FFFFFF"
                />

              ) : (

                <Text className="text-center text-base font-semibold text-white">
                  Start Local Sync
                </Text>

              )
            }

          </Pressable>

          {/* SECONDARY BUTTON */}
          <Pressable
            onPress={() =>
              Alert.alert(
                "Network Status",
                "Backend server reachable"
              )
            }

            className="mt-4 rounded-full py-4 active:scale-95"

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
              Check Network
            </Text>

          </Pressable>

        </View>

      </Animated.View>

    </View>
  );
}