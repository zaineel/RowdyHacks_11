import { createApp } from "vue";
import { createPinia } from "pinia";
import { createAuth0 } from "@auth0/auth0-vue";
import App from "./App.vue";
import router from "./router";
import "./assets/styles/main.css";

const app = createApp(App);

// Pinia store
app.use(createPinia());

// Auth0
app.use(
  createAuth0({
    domain: import.meta.env.VITE_AUTH0_DOMAIN || "your-domain.auth0.com",
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || "your-client-id",
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience:
        import.meta.env.VITE_AUTH0_AUDIENCE || "https://api.payitforward.com",
      scope: "openid profile email",
    },
    useRefreshTokens: true,
    cacheLocation: "localstorage",
  })
);

// Router
app.use(router);

app.mount("#app");
