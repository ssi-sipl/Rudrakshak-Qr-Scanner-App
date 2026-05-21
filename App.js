import "./global.css";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import QRScanner from "./screens/QRScanner";
import ScannedData from "./screens/ScannedData";

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="QRScanner" component={QRScanner} />
      <Stack.Screen name="ScannedData" component={ScannedData} />
      </Stack.Navigator>
    </NavigationContainer> );

  


  
// }

// export default function App() {
//   return (
//     <View className="flex-1 items-center justify-center bg-red-500">
//       <Text className="text-white text-3xl font-bold">
//         NativeWind Working 🚀
//       </Text>
//     </View>
//   );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
