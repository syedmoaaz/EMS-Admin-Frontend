import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  checkIn,
  checkOut,
  clearSession,
  fetchMe,
} from "../src/auth";
import { getOutboxCount as outboxCount } from "../src/outbox";
import {
  flushNow,
  readCurrentPosition,
  requestLocationPermission,
  setTrackingStatusHandler,
  startTracking,
  stopTracking,
} from "../src/tracking";

export default function HomeScreen({ token, profile: initial, onLogout }) {
  const [profile, setProfile] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [trackInfo, setTrackInfo] = useState({
    running: false,
    pending: 0,
    lastError: null,
    status: null,
    gpsDenied: false,
  });
  const [refreshing, setRefreshing] = useState(false);

  const attendance = profile?.todayAttendance;
  const checkedIn =
    attendance?.checkIn && attendance.checkIn !== "--";
  const checkedOut =
    attendance?.checkOut && attendance.checkOut !== "--";
  const onDuty = checkedIn && !checkedOut;

  const refresh = useCallback(async () => {
    try {
      const data = await fetchMe(token);
      setProfile(data);
      setError("");
      const pending = await outboxCount();
      setTrackInfo((prev) => ({ ...prev, pending }));
    } catch (err) {
      setError(err.message || "Failed to refresh");
    }
  }, [token]);

  useEffect(() => {
    setTrackingStatusHandler((s) =>
      setTrackInfo((prev) => ({ ...prev, ...s }))
    );
    return () => {
      setTrackingStatusHandler(null);
      stopTracking();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (onDuty) {
        const seconds = profile?.gpsRefreshSeconds || 30;
        await startTracking(token, Math.max(15, Number(seconds) || 30) * 1000);
      } else {
        stopTracking();
      }
      if (!cancelled) {
        const pending = await outboxCount();
        setTrackInfo((prev) => ({ ...prev, pending, running: onDuty }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onDuty, token, profile?.gpsRefreshSeconds]);

  const coordsPayload = async () => {
    const coords = await readCurrentPosition();
    if (!coords) return {};
    return { lat: coords.latitude, lng: coords.longitude };
  };

  const handleCheckIn = async () => {
    setBusy(true);
    setError("");
    try {
      const perm = await requestLocationPermission();
      if (!perm.granted) {
        setError("Location permission is required for GPS check-in.");
        return;
      }
      const coords = await coordsPayload();
      await checkIn(token, coords);
      await refresh();
      const seconds = profile?.gpsRefreshSeconds || 30;
      await startTracking(token, Math.max(15, Number(seconds) || 30) * 1000);
    } catch (err) {
      setError(err.message || "Check-in failed");
    } finally {
      setBusy(false);
    }
  };

  const handleCheckOut = async () => {
    setBusy(true);
    setError("");
    try {
      const coords = await coordsPayload();
      await checkOut(token, coords);
      stopTracking();
      await flushNow(token);
      await refresh();
    } catch (err) {
      setError(err.message || "Check-out failed");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    stopTracking();
    await clearSession();
    onLogout?.();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const branchName =
    typeof profile?.branch === "object"
      ? profile.branch?.name
      : profile?.branch || "—";

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Hello,</Text>
          <Text style={styles.name}>{profile?.name || "Employee"}</Text>
          <Text style={styles.meta}>
            {profile?.employeeId} · {profile?.role}
          </Text>
          <Text style={styles.meta}>Branch: {branchName}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today&apos;s attendance</Text>
        <Row label="Check in" value={attendance?.checkIn || "--"} />
        <Row label="Check out" value={attendance?.checkOut || "--"} />
        <Row label="Status" value={attendance?.status || "Not checked in"} />
        <Row label="Hours" value={attendance?.hours || "--"} />
        <Row label="Method" value={attendance?.method || "--"} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live GPS</Text>
        <Row
          label="Tracking"
          value={trackInfo.running ? "On duty — uploading" : "Stopped"}
        />
        <Row label="Last status" value={trackInfo.status || "—"} />
        <Row label="Queued points" value={String(trackInfo.pending || 0)} />
        {trackInfo.gpsDenied ? (
          <Text style={styles.warn}>
            Location denied — admin will see GPS Disabled.
          </Text>
        ) : null}
        {trackInfo.lastError ? (
          <Text style={styles.warn}>{trackInfo.lastError}</Text>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!checkedIn && (
        <TouchableOpacity
          style={[styles.primaryBtn, busy && styles.disabled]}
          onPress={handleCheckIn}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>Check in</Text>
          )}
        </TouchableOpacity>
      )}

      {onDuty && (
        <TouchableOpacity
          style={[styles.secondaryBtn, busy && styles.disabled]}
          onPress={handleCheckOut}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#1d4ed8" />
          ) : (
            <Text style={styles.secondaryText}>Check out</Text>
          )}
        </TouchableOpacity>
      )}

      {checkedOut && (
        <Text style={styles.done}>Checked out for today. See you tomorrow.</Text>
      )}
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f1f5f9" },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: 12,
  },
  hello: { color: "#64748b", fontSize: 14 },
  name: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  meta: { color: "#64748b", marginTop: 2, fontSize: 13 },
  logout: { color: "#dc2626", fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 10,
    color: "#0f172a",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowLabel: { color: "#64748b" },
  rowValue: { fontWeight: "600", color: "#0f172a" },
  primaryBtn: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryBtn: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#1d4ed8",
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  secondaryText: { color: "#1d4ed8", fontWeight: "800", fontSize: 16 },
  disabled: { opacity: 0.7 },
  error: { color: "#dc2626", marginBottom: 8 },
  warn: { color: "#b45309", marginTop: 8, fontSize: 13 },
  done: {
    textAlign: "center",
    marginTop: 16,
    color: "#64748b",
    fontWeight: "600",
  },
});
