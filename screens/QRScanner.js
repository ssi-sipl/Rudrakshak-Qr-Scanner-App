import { useState, useCallback } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect } from "@react-navigation/native";

export default function QRScanner({
  navigation,
  route,
}) {

  // FROM PREVIOUS SCREEN
  const {
    projectId,
    projectName,
    areaId,
    areaName,
  } = route.params;

  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] =
    useState(false);

  // RESET WHEN SCREEN FOCUSED
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, [])
  );

  // LOADING
  if (!permission) {
    return <View />;
  }

  // PERMISSION DENIED
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 20 }}>
          Camera Permission Needed
        </Text>

        <Button
          title="Grant Permission"
          onPress={requestPermission}
        />
      </View>
    );
  }

  // QR SCAN
  const handleBarcodeScanned = ({ data }) => {

  try {

    // PREVENT MULTIPLE SCANS
    setScanned(true);

    // VALIDATE JSON
    const parsedData = JSON.parse(data);

    // REQUIRED FIELDS CHECK
    if (
      !parsedData.sensorId ||
      !parsedData.name ||
      !parsedData.sensorType ||
      !parsedData.ipAddress ||
      !parsedData.rtspUrl
    ) {

      alert("Wrong QR Format");

      setTimeout(() => {
        setScanned(false);
      }, 1500);

      return;
    }

    // VALID QR
    navigation.replace("ScannedData", {
      qrData: data,

      projectId,
      projectName,

      areaId,
      areaName,
    });

  } catch (error) {

    console.log(error);

    alert("Invalid QR Code");

    // ENABLE RESCAN
    setTimeout(() => {
      setScanned(false);
    }, 1500);
  }
};

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : handleBarcodeScanned
        }
      />

      {/* Bottom */}
      <View style={styles.bottomContainer}>
        <Text style={styles.title}>
          Scan QR Code
        </Text>

        <Text style={styles.subtitle}>
          {projectName} • {areaName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  bottomContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
  },

  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitle: {
    color: "#00ff99",
    fontSize: 14,
  },
});