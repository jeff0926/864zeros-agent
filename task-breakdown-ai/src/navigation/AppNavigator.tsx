import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';

// Screens
import HomeScreen from '../screens/HomeScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen} 
      options={{ title: 'Tasks' }}
    />
    <Stack.Screen 
      name="TaskDetail" 
      component={TaskDetailScreen} 
      options={{ title: 'Task Details' }}
    />
    <Stack.Screen 
      name="CreateTask" 
      component={CreateTaskScreen} 
      options={{ title: 'New Task' }}
    />
  </Stack.Navigator>
);

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Profile':
              iconName = 'user';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;