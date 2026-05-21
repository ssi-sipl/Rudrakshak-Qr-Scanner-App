
import { Button, StyleSheet, Text, View , TextInput ,ScrollView} from "react-native";
import { useState } from "react";
import db from "../database";
db.execSync("CREATE TABLE IF NOT EXISTS scanned_data (id INTEGER PRIMARY KEY AUTOINCREMENT, sensorId TEXT, name TEXT, sensorType TEXT, ipAddress TEXT, rtspUrl TEXT, battery TEXT, status TEXT, latitude REAL, longitude REAL)");
export default function ScannedData({ route , navigation}) {
    const [editable, setEditable] = useState(false);
    const { qrData, location } = route.params;
    const parsedData = JSON.parse(qrData);

    const [sensorId, setSensorId] = useState(parsedData.sensorId);
    const [name, setName] = useState(parsedData.name);
    const [sensorType, setSensorType] = useState(parsedData.sensorType);
    const [ipAddress, setIpAddress] = useState(parsedData.ipAddress);
    const [rtspUrl, setRtspUrl] = useState(parsedData.rtspUrl);
    const [battery, setBattery] = useState(parsedData.battery);
    const [status, setStatus] = useState(parsedData.status);
    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;

 //save data to database
 const saveDataIntoDatabase = () => {
 db.runSync(
  `INSERT OR REPLACE INTO scanned_data  
  (sensorId, name, sensorType, ipAddress, rtspUrl, battery, status, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    sensorId,
    name,
    sensorType,
    ipAddress,
    rtspUrl,
    battery,
    status,
    latitude,
    longitude
  ]
);
console.log("Data saved into database successfully!");
  };
    console.log("Parsed QR Data:", parsedData);
    return (
        <ScrollView>
          
      {!editable ?  (
        <View style={styles.center}>
          <Text style={styles.title}>Scanned Data</Text>
          <Text style={styles.qrText}>Sensor ID: {sensorId}</Text>
          <Text style={styles.qrText}>Name: {name}</Text>
          <Text style={styles.qrText}>Sensor Type: {sensorType}</Text>
          <Text style={styles.qrText}>IP Address: {ipAddress}</Text>
          <Text style={styles.qrText}>RTSP URL: {rtspUrl}</Text>
          <Text style={styles.qrText}>Battery: {battery}</Text>
          <Text style={styles.qrText}>Status: {status}</Text>
          <Text style={styles.qrText}>Latitude: {latitude}</Text>
          <Text style={styles.qrText}>Longitude: {longitude}</Text>
          
        
        </View>
      ) : (
      <View style={styles.center}>
        <Text style={styles.title}>Scanned Data</Text>
        <Text style={styles.qrText}>Sensor ID:</Text> 
        <TextInput style={styles.qrText} value={sensorId} onChangeText={setSensorId} />
        <Text style={styles.qrText}>Name:</Text>
        <TextInput style={styles.qrText} value={name} onChangeText={setName} />
        <Text style={styles.qrText}>Sensor Type:</Text>
        <TextInput style={styles.qrText} value={sensorType} onChangeText={setSensorType} />
        <Text style={styles.qrText}>IP Address:</Text>
        <TextInput style={styles.qrText} value={ipAddress} onChangeText={setIpAddress} />
        <Text style={styles.qrText}>RTSP URL:</Text>
        <TextInput style={styles.qrText} value={rtspUrl} onChangeText={setRtspUrl} />
        <Text style={styles.qrText}>Battery:</Text>
        <TextInput style={styles.qrText} value={battery} onChangeText={setBattery} />
        <Text style={styles.qrText}>Status:</Text>
        <TextInput style={styles.qrText} value={status} onChangeText={setStatus} />
        <Text style={styles.qrText}>Latitude:</Text>
        <TextInput style={styles.qrText} value={latitude.toString()} editable={false} />
        <Text style={styles.qrText}>Longitude:</Text>
        <TextInput style={styles.qrText} value={longitude.toString()} editable={false} />
      
      </View>
      )}
      
      { !editable ? (
        <Button title="Editable Mode" onPress={() => setEditable(true)} />)
        : 
        (undefined)
      }
      
      <Button title="Save" onPress={saveDataIntoDatabase} />
       <Button title="Scan Again" onPress={() => navigation.navigate("QRScanner")} />
      </ScrollView>

    );
  }

const styles = StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
    },
    qrText: {
      fontSize: 16,
      marginTop: 20,
    }
  });   