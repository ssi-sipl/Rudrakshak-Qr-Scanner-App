import {
  Pressable,
  Text,
  View,
  TextInput,
  ScrollView,
  Animated,
  Alert,
} from "react-native";

import {
  useState,
  useRef,
  useEffect,
} from "react";

import { db } from "../database/database.js";

import * as Location from "expo-location";


// INPUT COMPONENT
const InputField = ({
  label,
  value,
  setValue,
  editableInput = true,
}) => (

  <View className="mb-5">

    <Text
      className="mb-2 text-sm font-medium"
      style={{
        color: "#6B7280",
      }}
    >
      {label}
    </Text>

    <TextInput
      value={value}

      onChangeText={setValue}

      editable={editableInput}

      placeholderTextColor="#9CA3AF"

      className="rounded-full px-5 py-4 text-base"

      style={{
        backgroundColor: editableInput
          ? "#F3F7F8"
          : "#E8EEF0",

        color: "#111827",

        opacity: editableInput
          ? 1
          : 0.7,
      }}
    />

  </View>
);

export default function ScannedData({
  route,
  navigation,
}) {

  const fadeAnim =
    useRef(new Animated.Value(0)).current;

  // ROUTE PARAMS
  const {
    qrData,
    sensorData,
    editMode = false,

    projectId,
    projectName,

    areaId,
    areaName,
  } = route.params;

  // EDITABLE STATE
  const [editable, setEditable] =
    useState(editMode);

  // PARSE DATA
 let parsedData;

if (sensorData) {

  parsedData = sensorData;

} else if (qrData) {

  parsedData = JSON.parse(qrData);

} else {

  parsedData = {};
}

  // STATES
  const [sensorId, setSensorId] =
    useState(parsedData.sensorId);

  const [name, setName] =
    useState(parsedData.name);

  const [sensorType, setSensorType] =
    useState(parsedData.sensorType);

  const [ipAddress, setIpAddress] =
    useState(parsedData.ipAddress);

  const [rtspUrl, setRtspUrl] =
    useState(parsedData.rtspUrl);

  const [battery, setBattery] =
    useState(parsedData.battery);

  const [status, setStatus] =
    useState(parsedData.status);

  const [latitude, setLatitude] =
    useState(parsedData.latitude || null);

  const [longitude, setLongitude] =
    useState(parsedData.longitude || null);

  const [activeShuruMode, setActiveShuruMode] =
    useState(parsedData.activeShuruMode);

  const [fetching, setFetching] =
    useState(false);

  const [accuracy, setAccuracy] =
    useState(null);

  // ANIMATION
  useEffect(() => {

    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

  }, []);

  // SAVE SENSOR
  const saveDataIntoDatabase = () => {

    try {

      // VALIDATION
      if (
        !sensorId ||
        !name ||
        !sensorType ||
        !ipAddress ||
        !rtspUrl ||
        !battery ||
        !status ||
        !activeShuruMode
      ) {

        Alert.alert(
          "Missing Fields",
          "Please fill all fields"
        );

        return;
      }

      // IP VALIDATION
      const ipRegex =
        /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;

      if (!ipRegex.test(ipAddress)) {

        Alert.alert(
          "Invalid IP",
          "Please enter valid IP address"
        );

        return;
      }

      // RTSP VALIDATION
      const rtspRegex =
        /^rtsp:\/\/.+/;

      if (!rtspRegex.test(rtspUrl)) {

        Alert.alert(
          "Invalid RTSP URL",
          "RTSP URL must start with rtsp://"
        );

        return;
      }

      // BATTERY VALIDATION
      const batteryRegex =
        /^(100|[1-9]?[0-9])$/;

      if (!batteryRegex.test(battery)) {

        Alert.alert(
          "Invalid Battery",
          "Battery should be between 0 to 100"
        );

        return;
      }

      // LOCATION CHECK
      if (
        latitude == null ||
        longitude == null
      ) {

        Alert.alert(
          "Location Missing",
          "Please fetch location first"
        );

        return;
      }

      // SAVE SENSOR
      db.runSync(
        `
        INSERT OR REPLACE INTO sensors (
          area_id,
          sensorId,
          name,
          sensorType,
          ipAddress,
          rtspUrl,
          battery,
          status,
          latitude,
          longitude,
          activeShuruMode,
          syncedLocally,
          syncedCloud
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          areaId,
          sensorId,
          name,
          sensorType,
          ipAddress,
          rtspUrl,
          battery,
          status,
          latitude,
          longitude,
          activeShuruMode,
          0,
          0,
        ]
      );

      Alert.alert(
        "Success",
        editMode
          ? "Sensor updated successfully"
          : "Sensor saved successfully"
      );

      // NAVIGATION
      navigation.goBack();

    } catch (err) {

      console.log(err);

      Alert.alert(
        "Error",
        "Failed to save sensor"
      );
    }
  };

  // LOCATION PERMISSION
  const getLocationPermission =
    async () => {

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      return status === "granted";
    };

  // FETCH LOCATION
  const fetchLocationData = async () => {

    setFetching(true);

    const granted =
      await getLocationPermission();

    if (!granted) {

      setFetching(false);

      Alert.alert(
        "Permission Required",
        "Location permission is needed"
      );

      return;
    }

    const subscription =
      await Location.watchPositionAsync(
        {
          accuracy:
            Location.Accuracy.BestForNavigation,

          timeInterval: 1000,

          distanceInterval: 1,
        },

        (location) => {

          const currentAccuracy =
            location.coords.accuracy;

          setAccuracy(currentAccuracy);

          if (currentAccuracy <= 20) {

            subscription.remove();

            setFetching(false);

            setLatitude(
              location.coords.latitude
            );

            setLongitude(
              location.coords.longitude
            );
          }
        }
      );
  };

  return (

    <ScrollView
      className="flex-1"
      style={{
        backgroundColor: "#EEF3F4",
      }}
      showsVerticalScrollIndicator={false}
    >

      <Animated.View
        style={{
          opacity: fadeAnim,
        }}
      >

        <View className="px-5 pb-12 pt-14">

          {/* HEADER */}
          <Text
            className="text-4xl font-bold"
            style={{
              color: "#111827",
            }}
          >
            Sensor Data
          </Text>

          <Text
            className="mt-2 text-sm"
            style={{
              color: "#6B7280",
            }}
          >
            Review and manage sensor information
          </Text>

          {/* MAIN CARD */}
          <View
            className="mt-8 rounded-[32px] p-5"

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

            {/* VIEW MODE */}
            {!editable ? (

              <>

                {[
                  ["Project", projectName],
                  ["Area", areaName],
                  ["Sensor ID", sensorId],
                  ["Name", name],
                  ["Sensor Type", sensorType],
                  ["IP Address", ipAddress],
                  ["RTSP URL", rtspUrl],
                  ["Battery", battery],
                  ["Status", status],
                  ["Latitude", latitude],
                  ["Longitude", longitude],
                  ["Mode", activeShuruMode],
                ].map(([label, value]) => (

                  <View
                    key={label}

                    className="mb-4 rounded-[24px] p-4"

                    style={{
                      backgroundColor: "#F3F7F8",
                    }}
                  >

                    <Text
                      className="mb-1 text-xs font-medium"

                      style={{
                        color: "#6B7280",
                      }}
                    >
                      {label}
                    </Text>

                    <Text
                      className="text-base"

                      style={{
                        color: "#111827",
                      }}
                    >
                      {value}
                    </Text>

                  </View>
                ))}

              </>

            ) : (

              <>
                <InputField
                  label="Project"
                  value={projectName}
                  editableInput={false}
                />

                <InputField
                  label="Area"
                  value={areaName}
                  editableInput={false}
                />

                <InputField
                  label="Sensor ID"
                  value={sensorId}
                  setValue={setSensorId}
                />

                <InputField
                  label="Name"
                  value={name}
                  setValue={setName}
                />

                <InputField
                  label="Sensor Type"
                  value={sensorType}
                  setValue={setSensorType}
                />

                <InputField
                  label="IP Address"
                  value={ipAddress}
                  setValue={setIpAddress}
                />

                <InputField
                  label="RTSP URL"
                  value={rtspUrl}
                  setValue={setRtspUrl}
                />

                <InputField
                  label="Battery"
                  value={battery}
                  setValue={setBattery}
                />

                <InputField
                  label="Status"
                  value={status}
                  setValue={setStatus}
                />

                <InputField
                  label="Latitude"
                  value={
                    latitude
                      ? latitude.toString()
                      : ""
                  }
                  editableInput={false}
                />

                <InputField
                  label="Longitude"
                  value={
                    longitude
                      ? longitude.toString()
                      : ""
                  }
                  editableInput={false}
                />

                <InputField
                  label="Mode"
                  value={activeShuruMode}
                  setValue={setActiveShuruMode}
                />
              </>
            )}

          </View>

          {/* ACTION BUTTONS */}
          <View className="mt-8">

            {!editable && (

              <Pressable
                onPress={() =>
                  setEditable(true)
                }

                className="mb-4 rounded-full py-4 active:scale-95"

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
                  Enable Edit Mode
                </Text>

              </Pressable>
            )}

            {/* LOCATION STATUS */}
            {fetching ? (

              <View
                className="mb-4 rounded-[28px] p-5"

                style={{
                  backgroundColor: "#FFF7E8",
                }}
              >

                <Text
                  className="text-center text-base font-semibold"

                  style={{
                    color: "#B45309",
                  }}
                >
                  Fetching Location...
                </Text>

                <Text
                  className="mt-2 text-center text-sm"

                  style={{
                    color: "#92400E",
                  }}
                >
                  Accuracy:
                  {" "}
                  {
                    accuracy
                      ? accuracy.toFixed(2)
                      : "Calculating"
                  }
                  m
                </Text>

              </View>

            ) : latitude == null || longitude == null ? (

              <Pressable
                onPress={fetchLocationData}

                className="mb-4 rounded-full py-4 active:scale-95"

                style={{
                  backgroundColor: "#FEE2E2",
                }}
              >

                <Text
                  className="text-center text-sm font-semibold"

                  style={{
                    color: "#DC2626",
                  }}
                >
                  Fetch Location
                </Text>

              </Pressable>

            ) : (

              <Pressable
                onPress={saveDataIntoDatabase}

                className="mb-4 rounded-full py-4 active:scale-95"

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

                <Text className="text-center text-base font-semibold text-white">
                  {
                    editMode
                      ? "Update Sensor"
                      : "Save Sensor"
                  }
                </Text>

              </Pressable>
            )}

            {/* SCAN AGAIN */}
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

              className="rounded-full py-4 active:scale-95"

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
                Scan Again
              </Text>

            </Pressable>

          </View>

        </View>

      </Animated.View>

    </ScrollView>
  );
}