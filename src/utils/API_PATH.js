const API_BASE_RAW = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE = API_BASE_RAW.replace(/\/+$/, "");

const API_PATH = {
  BASE: API_BASE,
  MESSAGES: {
    SEND: `${API_BASE}/api/v1/msg/addMsg`,
    LIST: `${API_BASE}/api/v1/msg/getMsg`,
  },
  ALERTS: {
    LIST: `${API_BASE}/api/alerts`,
    BROADCAST: `${API_BASE}/api/alerts/broadcast`,
  },
  UPLOADS: {
    FILE: `${API_BASE}/uploads`,
  },
};

export default API_PATH;
