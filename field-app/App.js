import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import {
  fetchMe,
  getStoredProfile,
  getToken,
} from "./src/auth";

export default function App() {
  const [booting, setBooting] = useState(true);
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const existing = await getToken();
        if (!existing) return;
        const cached = await getStoredProfile();
        setToken(existing);
        setProfile(cached);
        try {
          const fresh = await fetchMe(existing);
          setProfile(fresh);
        } catch {
          // Keep cached profile if offline
        }
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  if (booting) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <StatusBar style="dark" />
      </View>
    );
  }

  if (!token) {
    return (
      <>
        <StatusBar style="light" />
        <LoginScreen
          onLoggedIn={(nextToken, data) => {
            setToken(nextToken);
            setProfile(data);
          }}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <HomeScreen
        token={token}
        profile={profile}
        onLogout={() => {
          setToken(null);
          setProfile(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
});
