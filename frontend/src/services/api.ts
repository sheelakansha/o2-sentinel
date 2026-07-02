import { database } from "../firebase";
import { ref, get, update } from "firebase/database";

const API = "https://o2-sentinel-frontend.onrender.com";

const unwrap = async (res: Response) => {
  const json = await res.json();
  return json && json.success && json.data !== undefined ? json.data : json;
};


export const getSensorData = async () => {
  const snapshot = await get(ref(database, "sensors/current"));
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return {
    oxygen: 0,
    temperature: 0,
    humidity: 0,
    timestamp: null
  };
};

export const getAlerts = async () => {
  const snapshot = await get(ref(database, "alerts/active"));
  if (snapshot.exists()) {
    const val = snapshot.val();
    return Object.keys(val).map(key => val[key]);
  }
  return [];
};

export const getDevices = async () => {
  const snapshot = await get(ref(database, "devices"));

  if (snapshot.exists()) {
    return snapshot.val();
  }

  return {
    status: "OFFLINE",
    battery: 0,
    lastSeen: null
  };
};

export const getSensorHistory = async () => {
  const snapshot = await get(ref(database, "sensors/history"));
  if (snapshot.exists()) {
    const val = snapshot.val();
    const dataList = Object.keys(val).map(key => val[key]);
    dataList.sort((a: any, b: any) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });
    return dataList;
  }
  return [];
};

export const getAlertHistory = async () => {
  const snapshot = await get(ref(database, "alerts/history"));

  if (snapshot.exists()) {
    const val = snapshot.val();

    const alerts = Object.keys(val).map(key => val[key]);

    alerts.sort((a: any, b: any) => {
        const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tb - ta;
    });

    return alerts;
  }

  return [];
};

export const acknowledgeAlert = async (id: number) => {
  const snapshot = await get(ref(database, "alerts/active"));
  if (snapshot.exists()) {
    const activeAlerts = snapshot.val();
    const key = Object.keys(activeAlerts).find(k => activeAlerts[k].id === id);
    if (key) {
      const alertRef = ref(database, `alerts/active/${key}`);
      await update(alertRef, { acknowledged: true });
      return { success: true };
    }
  }
  return { success: false, error: "Alert not found" };
};

export const getRecommendations = async () => {
  const res = await fetch(`${API}/api/recommendations`);
  return await res.json();
};

export const getSensorPredictions = async () => {
  const res = await fetch(`${API}/api/sensors/prediction`);
  return await res.json();
};

export const getSystemStats = async () => {
  const res = await fetch(`${API}/api/stats`);
  return await res.json();
};

export const getSystemHealth = async () => {
  const res = await fetch(`${API}/api/system/health`);
  return await unwrap(res);
};

export const getSystemEvents = async () => {
  const res = await fetch(`${API}/api/system/events`);
  return await unwrap(res);
};

