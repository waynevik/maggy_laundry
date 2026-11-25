/* Sign-in checks against the local user list. Role is taken from the account. */
var Auth = (function () {
  function login(username, password) {
    var name = String(username || "").trim();
    var secret = String(password || "");

    if (name === "" || secret === "") {
      return {
        ok: false,
        message: "Please enter your username and password."
      };
    }

    var user = Store.findUser(name);

    if (!user || user.password !== secret) {
      return {
        ok: false,
        message: "Incorrect username or password. Please try again."
      };
    }

    Store.setSession(user);

    return {
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      }
    };
  }

  function logout() {
    Store.clearSession();
  }

  function requireSession() {
    var session = Store.getSession();
    if (!session) {
      window.location.href = "index.html";
      return null;
    }
    return session;
  }

  return {
    login: login,
    logout: logout,
    requireSession: requireSession
  };
})();
