import { demoUsers } from "./data";
import { currentUser } from "./store";
import { persistUsers, publicUser } from "./users";

const SESSION_KEY = "mock_session_user_id";
const MIN_PASSWORD_LENGTH = 8;

export function registerAuthMocks(mock) {
  mock.onGet("/auth/me").reply(() => {
    const user = currentUser();
    return user ? [200, publicUser(user)] : [401, { detail: "Not authenticated" }];
  });

  mock.onPost("/auth/login").reply((config) => {
    const { email, password } = JSON.parse(config.data);
    const wanted = String(email ?? "").trim().toLowerCase();
    const user = demoUsers.find((u) => u.email.toLowerCase() === wanted);

    if (!user || password !== user.password) {
      return [401, { detail: "Invalid email or password" }];
    }

    if (user.active === false) {
      return [403, { detail: "This account has been deactivated. Contact ICT." }];
    }

    if (!user.email_confirmed) {
      return [403, { detail: "Confirm your email address first. Check your inbox for the link." }];
    }

    sessionStorage.setItem(SESSION_KEY, String(user.id));
    return [200, { user: publicUser(user) }];
  });

  mock.onPost("/auth/logout").reply(() => {
    sessionStorage.removeItem(SESSION_KEY);
    return [204];
  });

  mock.onPost("/auth/change-password").reply((config) => {
    const user = currentUser();
    if (!user) return [401, { detail: "Not authenticated" }];

    const { current_password, new_password } = JSON.parse(config.data);

    if (current_password !== user.password) {
      return [422, { detail: "Your current password is incorrect." }];
    }

    if (!new_password || new_password.length < MIN_PASSWORD_LENGTH) {
      return [422, { detail: `The new password must be at least ${MIN_PASSWORD_LENGTH} characters.` }];
    }

    if (new_password === current_password) {
      return [422, { detail: "The new password must be different from the current one." }];
    }

    user.password = new_password;
    user.must_change_password = false;
    persistUsers();

    return [200, { user: publicUser(user) }];
  });

  mock.onPost("/auth/confirm-email").reply((config) => {
    const { token } = JSON.parse(config.data);
    const user = demoUsers.find((u) => u.confirm_token && u.confirm_token === token);

    if (!user) {
      return [404, { detail: "This confirmation link is not valid." }];
    }

    if (!user.email_confirmed) {
      user.email_confirmed = true;
      persistUsers();
    }

    return [200, { email: user.email }];
  });
}