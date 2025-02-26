import React from "react";
import { Image, Text, View, ActivityIndicator } from "react-native";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>["name"]; color: string }) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Charger la police personnalisée
  const [fontsLoaded] = useFonts({
    Kurale: require("../../assets/fonts/Kurale-Regular.ttf"),
  });

  // Affichage pendant le chargement des polices
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#7ba352" />
        <Text style={{ marginTop: 10 }}>Chargement des polices...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: 'none' }, // Cache la barre de navigation des onglets
        headerStyle: {
          backgroundColor: "#7ba352", // Fond vert pour l'en-tête
        },
        headerTitle: () => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: "bold",
                fontFamily: "Kurale",
              }}
            >
              Jardin de Cocagne
            </Text>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 40, height: 40 }}
              onError={(e) => console.warn("Erreur de chargement du logo", e.nativeEvent)}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          title: "Détails",
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Carte",
        }}
      />
    </Tabs>
  );
}
