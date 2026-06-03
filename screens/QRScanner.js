import { useState, useCallback , useRef} from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect } from "@react-navigation/native";
import { PinchGestureHandler } from "react-native-gesture-handler";
import { decryptData } from "../utils/crypto";

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

  const [zoom, setZoom] = useState(0);

  const zoomRef =useRef(0);

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

    console.log("data before decryption", data);
    const parsedData = decryptData(data);
    console.log("data after decryptin", parsedData);
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
      qrData:JSON.stringify(parsedData),

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
    
    <PinchGestureHandler
  onGestureEvent={(event) => {
    const scale = event.nativeEvent.scale;

    let newZoom = zoomRef.current + (scale - 1) * 0.2;

    if (newZoom < 0) newZoom = 0;
    if (newZoom > 1) newZoom = 1;
    setZoom(newZoom);
  
  }}
  onEnded={() => {
  zoomRef.current = zoom;
}}
>
  <CameraView
    style={StyleSheet.absoluteFillObject}
    zoom={zoom}
    barcodeScannerSettings={{
      barcodeTypes: ["qr"],
    }}
    onBarcodeScanned={
      scanned
        ? undefined
        : handleBarcodeScanned
    }
  />
</PinchGestureHandler>
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