import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AddPostScreen from '../screens/AddPostScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyPostsScreen from '../screens/MyPostsScreen';
import ChatsListScreen from '../screens/ChatsListScreen';
import ChatScreen from '../screens/ChatScreen';
import UserPublicProfileScreen from '../screens/UserPublicProfileScreen';
import AuthPromptScreen from './AuthPromptScreen';
import TabIcon from './TabIcon';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = createNativeStackNavigator();
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
  </HomeStack.Navigator>
);

const FavoritesStack = createNativeStackNavigator();
const FavoritesStackNavigator = () => {
  const { user } = useAuth();
  return (
    <FavoritesStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <FavoritesStack.Screen name="FavoritesMain" component={FavoritesScreen} />
      ) : (
        <FavoritesStack.Screen
          name="FavoritesAuth"
          component={AuthPromptScreen}
          initialParams={{
            message: 'Zaloguj się, aby zapisywać ulubione ogłoszenia.',
          }}
        />
      )}
    </FavoritesStack.Navigator>
  );
};

const ChatStack = createNativeStackNavigator();
const ChatStackNavigator = () => {
  const { user } = useAuth();
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <ChatStack.Screen name="ChatsMain" component={ChatsListScreen} />
      ) : (
        <ChatStack.Screen
          name="ChatsAuth"
          component={AuthPromptScreen}
          initialParams={{
            message: 'Zaloguj się, aby pisać ze sprzedającymi.',
          }}
        />
      )}
    </ChatStack.Navigator>
  );
};

const ProfileStack = createNativeStackNavigator();
const ProfileStackNavigator = () => {
  const { user } = useAuth();
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      ) : (
        <ProfileStack.Screen
          name="ProfileAuth"
          component={AuthPromptScreen}
          initialParams={{
            message: 'Zaloguj się, aby zarządzać kontem.',
          }}
        />
      )}
    </ProfileStack.Navigator>
  );
};

const AddStack = createNativeStackNavigator();
const AddStackNavigator = () => {
  const { user } = useAuth();
  return (
    <AddStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <AddStack.Screen name="AddMain" component={AddPostScreen} />
      ) : (
        <AddStack.Screen
          name="AddAuth"
          component={AuthPromptScreen}
          initialParams={{
            message: 'Aby dodać ogłoszenie, zaloguj się na konto.',
          }}
        />
      )}
    </AddStack.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ color, focused }) => {
          const map = {
            Home: 'home',
            Favorites: 'favorites',
            Add: 'add',
            Chats: 'chat',
            Profile: 'profile',
          };
          return <TabIcon name={map[route.name]} color={color} focused={focused} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'Strona główna' }} />
      <Tab.Screen
        name="Favorites"
        component={FavoritesStackNavigator}
        options={{ title: 'Ulubione' }}
      />
      <Tab.Screen
        name="Add"
        component={AddStackNavigator}
        options={{ title: 'Dodaj' }}
      />
      <Tab.Screen name="Chats" component={ChatStackNavigator} options={{ title: 'Czaty' }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={MainTabs} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="MyPosts" component={MyPostsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="UserPublic" component={UserPublicProfileScreen} />
        <Stack.Screen name="EditPost" component={AddPostScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
