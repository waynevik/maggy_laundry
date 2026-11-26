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
  document.getElementById("staffAttending").value = session.fullName;

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

  var priceInput = document.getElementById("price");
  var quantityInput = document.getElementById("quantity");
  var totalInput = document.getElementById("total_cost");
  var paidInput = document.getElementById("amount_paid");
  var balanceInput = document.getElementById("balance");
  var serviceInput = document.getElementById("service");
  var orderForm = document.getElementById("orderForm");
  var savedBanner = document.getElementById("savedBanner");

  function calculateTotal() {
    var price = Store.servicePrice(serviceInput.value);
    var quantity = parseInt(quantityInput.value, 10) || 0;
    var total = price * quantity;
    var paid = parseFloat(paidInput.value);
    if (isNaN(paid) || paid < 0) {
      paid = 0;
    }
    var balance = total - paid;
    if (balance < 0) {
      balance = 0;
    }

    priceInput.value = price;
    totalInput.value = total.toFixed(2);
    balanceInput.value = balance.toFixed(2);
    paidInput.classList.toggle("input-error", paid > total && total >= 0);
  }

  serviceInput.addEventListener("change", calculateTotal);
  quantityInput.addEventListener("input", calculateTotal);
  paidInput.addEventListener("input", calculateTotal);

  document.getElementById("clearOrder").addEventListener("click", function () {
    window.setTimeout(function () {
      document.getElementById("staffAttending").value = session.fullName;
      priceInput.value = "0";
      totalInput.value = "0.00";
      balanceInput.value = "0.00";
      paidInput.classList.remove("input-error");
    }, 0);
  });

  orderForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var result = Store.saveOrder(
      {
        customerName: document.getElementById("customer_name").value,
        contact: document.getElementById("contact").value,
        service: serviceInput.value,
        quantity: quantityInput.value,
        amountPaid: paidInput.value,
        pickupArrangement: document.getElementById("pickup_arrangement").value,
        orderDetails: document.getElementById("order_details").value
      },
      session
    );

    if (!result.ok) {
      window.alert(result.message);
      calculateTotal();
      return;
    }

    orderForm.reset();
    document.getElementById("staffAttending").value = session.fullName;
    calculateTotal();
    renderStats();
    renderOrders();
    document.getElementById("savedOrderNumber").textContent = result.orderNumber;
    savedBanner.hidden = false;
    showPage("dashboardPage", document.querySelector("[data-page='dashboardPage']"));
  });

  document.getElementById("savedClose").addEventListener("click", function () {
    savedBanner.hidden = true;
  });

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
