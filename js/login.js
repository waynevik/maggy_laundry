(function () {
  var form = document.getElementById("loginForm");
  var message = document.getElementById("loginMessage");
  var usernameInput = document.getElementById("signin-username");
  var passwordInput = document.getElementById("signin-password");
  var signUpButton = document.getElementById("signUpButton");
  var resetButton = document.getElementById("resetDemo");

  if (Store.getSession()) {
    window.location.href = "dashboard.html";
    return;
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + type;
    message.hidden = false;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var result = Auth.login(usernameInput.value, passwordInput.value);

    if (!result.ok) {
      showMessage(result.message, "error");
      passwordInput.value = "";
      return;
    }

    window.location.href = "dashboard.html";
  });

  signUpButton.addEventListener("click", function () {
    showMessage(
      "New accounts are added by an administrator. Use a demo account to sign in.",
      "error"
    );
  });

  resetButton.addEventListener("click", function () {
    Store.reset();
    Store.clearSession();
    usernameInput.value = "";
    passwordInput.value = "";
    showMessage("Demo data has been restored.", "success");
  });
})();
