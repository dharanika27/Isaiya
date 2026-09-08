import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { LibraryStackNavigator } from './LibraryStackNavigator';
import { PlayerScreen } from '../screens/PlayerScreen';
import { QueueScreen } from '../screens/QueueScreen';
import { useIsaiyaTheme } from '../theme/ThemeContext';
import type { RootStackParamList, RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Search: 'search',
  LibraryStack: 'library',
};

const TAB_LABELS: Record<keyof RootTabParamList, string> = {
  Home: 'Home',
  Search: 'Search',
  LibraryStack: 'Library',
};

function Tabs() {
  const { colors } = useIsaiyaTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabel: TAB_LABELS[route.name as keyof RootTabParamList],
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name as keyof RootTabParamList]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="LibraryStack" component={LibraryStackNavigator} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { navigationTheme } = useIsaiyaTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator>
        <RootStack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <RootStack.Screen name="Player" component={PlayerScreen} options={{ title: 'Now Playing' }} />
        <RootStack.Screen name="Queue" component={QueueScreen} options={{ title: 'Queue' }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
