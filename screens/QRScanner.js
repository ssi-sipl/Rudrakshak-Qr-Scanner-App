import { use, useEffect, useState, useCallback } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect } from "@react-navigation/native";
import ScannedData from "./ScannedData";
import * as Location from "expo-location";

export default function QRScanner({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);

  const [qrData, setQrData] = useState("");

  const [location, setLocation] = useState(null);

  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        setLocationPermission(true);
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      setQrData("");
    }, []),
  );

  // Permission Loading
  if (!permission) {
    return <View />;
  }

  // Permission Denied
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 20 }}>Camera Permission Needed</Text>

        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  // QR Scan Function
  const handleBarcodeScanned = async ({ data }) => {
    setScanned(true);
    const locationData = await Location.getCurrentPositionAsync({});
    setLocation(locationData);
    setQrData(data);

    
    navigation.navigate("ScannedData", {
      qrData: data,
      location: locationData,
    });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <View style={styles.bottomContainer}>
        <Text style={styles.title}>Scan QR Code</Text>
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

  qrText: {
    color: "#00ff99",
    fontSize: 16,
    marginBottom: 15,
    paddingHorizontal: 20,
    textAlign: "center",
  },
});


