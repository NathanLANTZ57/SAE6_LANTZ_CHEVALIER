import React from 'react';
import { Image, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Charger votre police
  const [fontsLoaded] = useFonts({
    Kurale: require("../../assets/fonts/Kurale-Regular.ttf"), // Correction du nom de la police
  });

  if (!fontsLoaded) {
    return <Text>Chargement des polices...</Text>; // Affichage pendant le chargement
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: 'none' }, // Désactiver la barre de navigation
        headerStyle: {
          backgroundColor: '#7ba352', // Fond vert pour l'en-tête
        },
        headerTitle: () => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 20,
                fontWeight: 'bold',
                fontFamily: 'Kurale', // Police personnalisée
              }}
            >
              Jardin de Cocagne
            </Text>
            <Image
              source={require('../../assets/images/logo.png')}
              style={{ width: 40, height: 40 }}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          title: '',
        }}
      />
    </Tabs>
  );
}
