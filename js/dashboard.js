(function () {
  var session = Auth.requireSession();
  if (!session) {
    return;
  }

  var sidebar = document.getElementById("sidebar");
  var main = document.getElementById("main");
  var menuButton = document.querySelector(".menu-button");

  document.getElementById("staffLabel").textContent =
    (session.role === "admin" ? "Admin: " : "Staff: ") + session.fullName;

  function money(amount) {
    return (
      "KSh " +
      Number(amount).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    );
  }

  function renderStats() {
    var stats = Store.dashboardStats();
    document.getElementById("totalOrders").textContent = stats.totalOrders;
    document.getElementById("pendingOrders").textContent = stats.pendingOrders;
    document.getElementById("readyOrders").textContent = stats.readyOrders;
    document.getElementById("totalCustomers").textContent = stats.totalCustomers;
  }

  function renderOrders() {
    var tbody = document.getElementById("recentOrdersBody");
    var orders = Store.recentOrders(10);
    tbody.innerHTML = "";

    if (orders.length === 0) {
      var empty = document.createElement("tr");
      var cell = document.createElement("td");
      cell.colSpan = 8;
      cell.className = "empty-table";
      cell.textContent = "No orders have been recorded yet.";
      empty.appendChild(cell);
      tbody.appendChild(empty);
      return;
    }

    orders.forEach(function (order) {
      var row = document.createElement("tr");

      function cell(text, strong) {
        var td = document.createElement("td");
        if (strong) {
          var bold = document.createElement("strong");
          bold.textContent = text;
          td.appendChild(bold);
        } else {
          td.textContent = text;
        }
        return td;
      }

      row.appendChild(cell(order.orderNumber, true));

      var customerCell = document.createElement("td");
      customerCell.appendChild(document.createTextNode(order.customerName));
      var phone = document.createElement("small");
      phone.textContent = order.contact;
      customerCell.appendChild(phone);
      row.appendChild(customerCell);

      row.appendChild(cell(order.service, false));
      row.appendChild(cell(String(order.quantity), false));
      row.appendChild(cell(money(order.totalCost), false));
      row.appendChild(cell(money(order.amountPaid), false));
      row.appendChild(cell(money(order.balance), false));

      var statusCell = document.createElement("td");
      var badge = document.createElement("span");
      badge.className = "status-badge";
      badge.textContent = order.laundryStatus;
      statusCell.appendChild(badge);
      row.appendChild(statusCell);

      tbody.appendChild(row);
    });
  }

  function showPage(pageId, button) {
    document.querySelectorAll(".page").forEach(function (page) {
      page.classList.remove("active");
    });

    var selected = document.getElementById(pageId);
    if (selected) {
      selected.classList.add("active");
    }

    document.querySelectorAll(".sidebar ul li button").forEach(function (btn) {
      btn.classList.remove("active");
    });

    if (button) {
      button.classList.add("active");
    }

    if (window.innerWidth <= 700) {
      sidebar.classList.remove("open");
    }

    document.querySelectorAll(".slide-panel").forEach(function (slide) {
      slide.classList.remove("open");
    });
  }

  function openSlide(slideId) {
    var slide = document.getElementById(slideId);
    if (!slide) {
      return;
    }

    document.querySelectorAll(".slide-panel").forEach(function (panel) {
      panel.classList.remove("open");
    });

    slide.classList.add("open");

    if (window.innerWidth <= 700) {
      sidebar.classList.remove("open");
    }
  }

  function closeSlide(slideId) {
    var slide = document.getElementById(slideId);
    if (slide) {
      slide.classList.remove("open");
    }
  }

  function toggleSidebar() {
    if (window.innerWidth <= 700) {
      sidebar.classList.toggle("open");
    } else {
      sidebar.classList.toggle("closed");
      main.classList.toggle("expanded");
    }
  }

  menuButton.addEventListener("click", toggleSidebar);

  document.querySelectorAll("[data-page]").forEach(function (button) {
    button.addEventListener("click", function () {
      showPage(button.getAttribute("data-page"), button);
    });
  });

  document.querySelectorAll("[data-slide]").forEach(function (button) {
    button.addEventListener("click", function () {
      openSlide(button.getAttribute("data-slide"));
    });
  });

  document.querySelectorAll("[data-close]").forEach(function (button) {
    button.addEventListener("click", function () {
      closeSlide(button.getAttribute("data-close"));
    });
  });

  document.getElementById("logoutButton").addEventListener("click", function () {
    Auth.logout();
    window.location.href = "index.html";
  });

  document.addEventListener("click", function (event) {
    if (window.innerWidth > 700) {
      return;
    }

    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      sidebar.classList.remove("open");
    }
  });

  renderStats();
  renderOrders();
})();
