import {
  Pressable,
  Text,
  View,
  TextInput,
  ScrollView,
  navigation,
} from "react-native";

import { useState, useEffect } from "react";

import {db} from "../database/database.js";
import * as Location from "expo-location";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { initDatabase } from "../database/initDatabase.js";



const InputField = ({ label, value, setValue, editableInput = true }) => (
  <View className="mb-5">
    <Text className="mb-2 text-sm font-semibold tracking-widest text-cyan-400">
      {label}
    </Text>

    <TextInput
      value={value}
      onChangeText={setValue}
      editable={editableInput}
      placeholderTextColor="#64748b"
      className={`rounded-2xl border border-cyan-400/20 bg-slate-900 px-4 py-4 text-base text-white ${
        !editableInput ? "opacity-60" : ""
      }`}
    />
  </View>
);
export default function ScannedData({ route, navigation }) {

  
  const [editable, setEditable] = useState(false);

  const { qrData } = route.params;

  const parsedData = JSON.parse(qrData);

  const [sensorId, setSensorId] = useState(parsedData.sensorId);

  const [name, setName] = useState(parsedData.name);

  const [sensorType, setSensorType] = useState(parsedData.sensorType);

  const [ipAddress, setIpAddress] = useState(parsedData.ipAddress);

  const [rtspUrl, setRtspUrl] = useState(parsedData.rtspUrl);

  const [battery, setBattery] = useState(parsedData.battery);

  const [status, setStatus] = useState(parsedData.status);

  const [locationfetch, setLocationfetch] = useState(null);

  const [latitude, setLatitude] = useState(null);

  const [longitude, setLongitude] = useState(null);

  const [activeShuruMode, setActiveShuruMode] = useState(parsedData.activeShuruMode);

  const [fetching, setFetching] = useState(false);

  const [accuracy, setAccuracy] = useState(null);

  console.log("Parsed QR Data:", parsedData);
  // Save Data
  const saveDataIntoDatabase = () => {
    try {
      db.runSync(
  `INSERT OR REPLACE INTO scanned_data (
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
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
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
  ],
);
      console.log(
        "Data saved into database successfully! Location data updated.",
      );
      alert("Data saved successfuly");
      navigation.replace("Home");
    } catch (err) {
      console.error(err);
      alert("Failed");
    }
  };

  //Location Permmission
  const getLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Location permission denied");
      return false;
    }
    return true;
  };

  
  //Location Fetching with accuracy check

  const fetchLocationData = async () => {
    setFetching(true);

    console.log("Fetching location data...");

    const granted = await getLocationPermission();

    if (granted) {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },

        (location) => {
          const currentAccuracy = location.coords.accuracy;

          console.log(currentAccuracy);

          setAccuracy(currentAccuracy);

          if (currentAccuracy <= 20) {
            console.log("20 meter accuracy reached");

            subscription.remove();

            setFetching(false);

            setLocationfetch(location);

            setLongitude(location.coords.longitude);

            setLatitude(location.coords.latitude);
          }
        },
      );
    } else {
      setFetching(false);

      alert("Location permission is required.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-950">
      {/* Glow */}
      <View className="absolute left-10 top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <View className="px-5 pb-20 pt-10">
        {/* Header */}
        <View className="mb-10 items-center">
          <Text className="text-4xl font-extrabold tracking-widest text-cyan-400">
            DATA TERMINAL
          </Text>

          <Text className="mt-3 text-center text-slate-400">
            QR Sensor Information Panel
          </Text>
        </View>

        {/* View Mode */}
        {!editable ? (
          <View className="rounded-3xl border border-cyan-400/20 bg-slate-900 p-5">
            <Text className="mb-6 text-center text-2xl font-bold text-cyan-300">
              Sensor Details
            </Text>

            {[
              ["Sensor ID", sensorId],
              ["Name", name],
              ["Sensor Type", sensorType],
              ["IP Address", ipAddress],
              ["RTSP URL", rtspUrl],
              ["Battery", battery],
              ["Status", status],
              ["Latitude", latitude],
              ["Longitude", longitude],
              ["ActiveShuruMode", activeShuruMode]
            ].map(([label, value]) => (
              <View
                key={label}
                className="mb-4 rounded-2xl border border-slate-800 bg-slate-950 p-4"
              >
                <Text className="mb-1 text-xs tracking-widest text-cyan-400">
                  {label}
                </Text>

                <Text className="text-base text-slate-200">{value}</Text>
              </View>
            ))}
          </View>
        ) : (
          /* Edit Mode */
          <View className="rounded-3xl border border-cyan-400/20 bg-slate-900 p-5">
            <Text className="mb-6 text-center text-2xl font-bold text-cyan-300">
              Edit Sensor Data
            </Text>

            <InputField
              label="Sensor ID"
              value={sensorId}
              setValue={setSensorId}
            />

            <InputField label="Name" value={name} setValue={setName} />

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

            <InputField label="Battery" value={battery} setValue={setBattery} />

            <InputField label="Status" value={status} setValue={setStatus} />

            <InputField
              label="Latitude"
              value={latitude ? latitude.toString() : ""}
              editableInput={false}
            />

            <InputField
              label="Longitude"
              value={longitude ? latitude.toString() : ""}
              editableInput={false}
            />

            <InputField
              label="ActiveShuruMode"
              value={activeShuruMode}
              editableInput={true}
             setValue={setActiveShuruMode}
            />
            
          </View>
        )}

        {/* Buttons */}
        <View className="mt-8 gap-4">
          {!editable && (
            <Pressable
              onPress={() => setEditable(true)}
              className="rounded-2xl border border-cyan-400/30 bg-slate-900 py-4 active:scale-95"
            >
              <Text className="text-center text-lg font-bold tracking-widest text-cyan-400">
                EDITABLE MODE
              </Text>
            </Pressable>
          )}

          {fetching ? (
            <View className="rounded-2xl border border-yellow-500 bg-yellow-900 py-6">
              <Text className="text-center text-lg font-bold text-yellow-300">
                FETCHING LOCATION...
              </Text>

              <Text className="mt-2 text-center text-base text-white">
                <Text>
                  Current Accuracy:{" "}
                  {accuracy ? accuracy.toFixed(2) + " meters" : "Calculating"}
                </Text>
              </Text>
            </View>
          ) : locationfetch == null ? (
            <Pressable
              onPress={() => fetchLocationData()}
              className="rounded-2xl border border-red-500 bg-red-900 py-4 active:scale-95"
            >
              <Text className="text-center text-lg font-bold tracking-widest text-red-400">
                Fetch Location Data
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={saveDataIntoDatabase}
              className="rounded-2xl bg-cyan-500 py-4 active:scale-95"
            >
              <Text className="text-center text-lg font-bold tracking-widest text-slate-950">
                SAVE DATA
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => navigation.navigate("QRScanner")}
            className="rounded-2xl border border-slate-700 bg-slate-900 py-4 active:scale-95"
          >
            <Text className="text-center text-lg font-bold tracking-widest text-white">
              SCAN AGAIN
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Text className="mt-10 text-center text-xs tracking-[4px] text-slate-600">
          RUDRAKSHAM QR SECURE TERMINAL
        </Text>
      </View>
    </ScrollView>
  );
}
