import { View, Text, Button } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
    

      <Button
        title="OPEN QR SCANNER"
        onPress={() => navigation.navigate("QRScanner")}
      />
      

    </View>
  );
}