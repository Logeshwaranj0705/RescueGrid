export const BASE_URL = "http://localhost:8000";

export const API_PATH = {
    AUTH: {
        LOGIN: "/api/v1/auth/login",
        REGISTER: "/api/v1/auth/register",
        GET_USER_INFO: "/api/v1/auth/getUser"
    },

    IMAGE: {
        UPLOAD_IMAGE: "/api/v1/auth/upload-image",
    },

    ANALYSIS: {
        GET_ALL_ANALYSIS: "/api/v1/analysis/get",
        ADD_ANALYSIS: "/api/v1/analysis/add",
        DELETE_ANALYSIS: "/api/v1/analysis/delete-all",
        DOWNLOAD_ANALYSIS: "/api/v1/analysis/downloadexcel",
        GET_EMPLOYEE_USAGE_COUNT: "/api/v1/analysis/empcount",
        SET_NOTES:"/api/v1/analysis/addnote",
        UPDATE_WORK:"/api/v1/analysis/update-work",
    },

    EMPLOYEE: {
        ADD_EMPLOYEE: "/api/v1/emp/add",
        DELETE_EMPLOYEE:`/api/v1/emp/delete-all`,
    },

    MESSAGER: {
        GET_ALL_HISTORY: "/api/v1/message/get",
        SET_ALL_MESSAGE: "api/v1/message/msgSend"
    },

    DASHBOARD:{
        GET_ALL_DASHBOARDDATA: "/api/v1/dashboard/get",
        DELETE_NOTE: (id) => `/api/v1/dashboard/note/${id}`,
    },

    ADMIN: {
        GET_ALL_USERS: "/api/v1/adm/users",
    },
};
