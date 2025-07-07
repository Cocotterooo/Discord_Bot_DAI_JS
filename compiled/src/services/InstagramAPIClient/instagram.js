var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class InstagramAPIClient {
    constructor(baseURL, accessToken) {
        this.baseURL = baseURL;
        this.accessToken = accessToken;
    }
    request(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, method = 'GET', params = {}) {
            var _a;
            try {
                const queryParams = new URLSearchParams(Object.assign(Object.assign({}, params), { access_token: this.accessToken })).toString();
                const url = `${this.baseURL}${endpoint}?${queryParams}`;
                const response = yield fetch(url, { method });
                const data = yield response.json();
                if (!response.ok)
                    throw new Error(((_a = data.error) === null || _a === void 0 ? void 0 : _a.message) || 'Error en la API de Instagram');
                return data;
            }
            catch (error) {
                console.error(`❌ Error en la petición a ${endpoint}:`, error.message);
                return null;
            }
        });
    }
    getUserProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request('/me', 'GET', { fields: 'id,username,account_type' });
        });
    }
    getUserMedia() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request('/me/media', 'GET', { fields: 'id,caption,media_type,media_url,timestamp' });
        });
    }
}
