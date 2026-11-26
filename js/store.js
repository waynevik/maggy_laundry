/* Local stand-in for the laundry database. Later screens read the same records. */
var Store = (function () {
  var DATA_KEY = "lms_data_v1";
  var SESSION_KEY = "lms_session";

  function seed() {
    return {
      users: [
        {
          id: 1,
          username: "admin",
          password: "admin123",
          fullName: "Amina Hassan",
          role: "admin"
        },
        {
          id: 2,
          username: "staff",
          password: "staff123",
          fullName: "James Otieno",
          role: "staff"
        }
      ],
      customers: [
        { id: 1, name: "Wanjiku Mwangi", contact: "0712345678" },
        { id: 2, name: "Peter Kamau", contact: "0722981104" },
        { id: 3, name: "Grace Achieng", contact: "0700112233" },
        { id: 4, name: "Daniel Kiprop", contact: "0799456120" }
      ],
      orders: [
        {
          id: 1,
          orderNumber: "LMS-1001",
          customerId: 1,
          service: "Wash + Iron",
          quantity: 4,
          totalCost: 1200,
          amountPaid: 1200,
          balance: 0,
          laundryStatus: "Ready for Pickup",
          createdAt: "2026-11-24T09:15:00"
        },
        {
          id: 2,
          orderNumber: "LMS-1002",
          customerId: 2,
          service: "Dry Cleaning",
          quantity: 2,
          totalCost: 600,
          amountPaid: 300,
          balance: 300,
          laundryStatus: "Washing",
          createdAt: "2026-11-24T11:40:00"
        },
        {
          id: 3,
          orderNumber: "LMS-1003",
          customerId: 3,
          service: "Gown Cleaning",
          quantity: 1,
          totalCost: 500,
          amountPaid: 500,
          balance: 0,
          laundryStatus: "Ironing",
          createdAt: "2026-11-24T14:05:00"
        },
        {
          id: 4,
          orderNumber: "LMS-1004",
          customerId: 4,
          service: "Household Textile Cleaning",
          quantity: 2,
          totalCost: 1600,
          amountPaid: 800,
          balance: 800,
          laundryStatus: "Received",
          createdAt: "2026-11-25T08:20:00"
        },
        {
          id: 5,
          orderNumber: "LMS-1005",
          customerId: 1,
          service: "Pressing (Ironing) Only",
          quantity: 6,
          totalCost: 900,
          amountPaid: 900,
          balance: 0,
          laundryStatus: "Collected",
          createdAt: "2026-11-22T16:10:00"
        },
        {
          id: 6,
          orderNumber: "LMS-1006",
          customerId: 2,
          service: "Wash (Cleaning Only)",
          quantity: 5,
          totalCost: 1000,
          amountPaid: 1000,
          balance: 0,
          laundryStatus: "Drying",
          createdAt: "2026-11-25T10:45:00"
        }
      ]
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(DATA_KEY);
      if (!raw) {
        var fresh = seed();
        localStorage.setItem(DATA_KEY, JSON.stringify(fresh));
        return fresh;
      }
      return JSON.parse(raw);
    } catch (error) {
      var fallback = seed();
      localStorage.setItem(DATA_KEY, JSON.stringify(fallback));
      return fallback;
    }
  }

  function save(data) {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }

  function reset() {
    var fresh = seed();
    save(fresh);
    return fresh;
  }

  function findUser(username) {
    var data = load();
    var key = String(username || "").trim().toLowerCase();
    for (var i = 0; i < data.users.length; i += 1) {
      if (data.users[i].username.toLowerCase() === key) {
        return data.users[i];
      }
    }
    return null;
  }

  function customerById(data, id) {
    for (var i = 0; i < data.customers.length; i += 1) {
      if (data.customers[i].id === id) {
        return data.customers[i];
      }
    }
    return null;
  }

  function dashboardStats() {
    var data = load();
    var pending = 0;
    var ready = 0;

    data.orders.forEach(function (order) {
      if (order.laundryStatus === "Ready for Pickup") {
        ready += 1;
      } else if (order.laundryStatus !== "Collected") {
        pending += 1;
      }
    });

    return {
      totalOrders: data.orders.length,
      pendingOrders: pending,
      readyOrders: ready,
      totalCustomers: data.customers.length
    };
  }

  function recentOrders(limit) {
    var data = load();
    var copy = data.orders.slice().sort(function (a, b) {
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });

    return copy.slice(0, limit || 10).map(function (order) {
      var customer = customerById(data, order.customerId);
      return {
        orderNumber: order.orderNumber,
        customerName: customer ? customer.name : "Unknown",
        contact: customer ? customer.contact : "",
        service: order.service,
        quantity: order.quantity,
        totalCost: order.totalCost,
        amountPaid: order.amountPaid,
        balance: order.balance,
        laundryStatus: order.laundryStatus
      };
    });
  }

  function getSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function setSession(user) {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      })
    );
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  var SERVICES = {
    "Gown Cleaning": 500,
    "Household Textile Cleaning": 800,
    "Dry Cleaning": 300,
    "Pressing (Ironing) Only": 150,
    "Wash (Cleaning Only)": 200,
    "Wash + Iron": 300
  };

  function nextId(list) {
    var max = 0;
    list.forEach(function (item) {
      if (item.id > max) {
        max = item.id;
      }
    });
    return max + 1;
  }

  function orderNumber(existing) {
    var now = new Date();
    function pad(value) {
      return value < 10 ? "0" + value : String(value);
    }
    var stamp =
      String(now.getFullYear()) +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds());
    var number;
    var taken = {};
    existing.forEach(function (order) {
      taken[order.orderNumber] = true;
    });
    do {
      number = "LMS-" + stamp + "-" + (100 + Math.floor(Math.random() * 900));
    } while (taken[number]);
    return number;
  }

  function saveOrder(input, session) {
    var name = String(input.customerName || "").trim();
    var contact = String(input.contact || "").trim();
    var service = String(input.service || "").trim();
    var details = String(input.orderDetails || "").trim();
    var quantity = parseInt(input.quantity, 10) || 0;
    var paidRaw = String(input.amountPaid == null ? "" : input.amountPaid).trim();
    var paid = paidRaw === "" ? 0 : parseFloat(paidRaw);
    var pickup = String(input.pickupArrangement || "Customer Collection").trim();

    if (!session) {
      return { ok: false, message: "Please sign in again." };
    }

    if (name === "" || contact === "" || service === "" || quantity < 1) {
      return { ok: false, message: "Please fill in all required fields." };
    }

    if (!SERVICES.hasOwnProperty(service)) {
      return { ok: false, message: "Please select a laundry service." };
    }

    if (isNaN(paid) || paid < 0) {
      return { ok: false, message: "Amount paid cannot be negative." };
    }

    var price = SERVICES[service];
    var total = price * quantity;

    if (paid > total) {
      return {
        ok: false,
        message: "Amount paid cannot be greater than the total cost."
      };
    }

    var data = load();
    var customer = null;
    for (var i = 0; i < data.customers.length; i += 1) {
      if (data.customers[i].contact === contact) {
        customer = data.customers[i];
        customer.name = name;
        break;
      }
    }

    if (!customer) {
      customer = {
        id: nextId(data.customers),
        name: name,
        contact: contact
      };
      data.customers.push(customer);
    }

    var order = {
      id: nextId(data.orders),
      orderNumber: orderNumber(data.orders),
      customerId: customer.id,
      staffName: session.fullName,
      service: service,
      orderDetails: details,
      quantity: quantity,
      price: price,
      totalCost: total,
      amountPaid: paid,
      balance: total - paid,
      pickupArrangement: pickup || "Customer Collection",
      laundryStatus: "Received",
      createdAt: new Date().toISOString()
    };

    data.orders.push(order);
    save(data);

    return { ok: true, orderNumber: order.orderNumber };
  }

  return {
    load: load,
    reset: reset,
    findUser: findUser,
    dashboardStats: dashboardStats,
    recentOrders: recentOrders,
    saveOrder: saveOrder,
    servicePrice: function (name) {
      return SERVICES.hasOwnProperty(name) ? SERVICES[name] : 0;
    },
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession
  };
})();
