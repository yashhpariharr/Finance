// 🔐 AUTH SYSTEM
const authBox = document.getElementById("authBox");
const appBox = document.getElementById("app");

function signup() {
  const user = authUser.value;
  const pass = authPass.value;
  if (!user || !pass) return alert("Fill all fields");
  localStorage.setItem("user_" + user, pass);
  alert("Signup successful!");
}

function login() {
  const user = authUser.value;
  const pass = authPass.value;
  const saved = localStorage.getItem("user_" + user);

  if (saved === pass) {
    authBox.style.display = "none";
    appBox.style.display = "block";
  } else {
    alert("Invalid login");
  }
}

// 📊 MAIN APP
const form = document.getElementById("form");
const list = document.getElementById("list");
const reportEl = document.getElementById("report");
const aiEl = document.getElementById("ai");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let chart;

// ADD
form.onsubmit = (e) => {
  e.preventDefault();

  const exp = {
    id: Date.now(),
    desc: desc.value,
    amount: +amount.value,
    date: date.value,
    category: category.value,
    type: type.value
  };

  expenses.push(exp);
  save();
  render();
  form.reset();
};

// SAVE
function save() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// RENDER
function render() {
  list.innerHTML = "";

  let income = 0, expense = 0;

  expenses.forEach(e => {
    if (e.type === "income") income += e.amount;
    else expense += e.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      ${e.desc} - ₹${e.amount}
      <button onclick="removeExpense(${e.id})">❌</button>
    `;
    list.appendChild(li);
  });

  const balance = income - expense;

  balanceCard.textContent = "₹" + balance;
  incomeCard.textContent = "₹" + income;
  expenseCard.textContent = "₹" + expense;

  generateReport();
  generateInsights(income, expense, balance);
  renderChart();
}

// DELETE
function removeExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  save();
  render();
}

// REPORT
function generateReport() {
  const months = {};

  expenses.forEach(e => {
    const m = e.date.slice(0, 7);
    months[m] = (months[m] || 0) + e.amount;
  });

  let output = "";
  for (let m in months) {
    output += `📅 ${m} → ₹${months[m]} <br>`;
  }

  reportEl.innerHTML = output;
}

// AI
function generateInsights(income, expense, balance) {
  aiEl.innerHTML = `
    Income: ₹${income} <br>
    Expense: ₹${expense} <br>
    Balance: ₹${balance} <br>
    ${balance < 0 ? "⚠️ Overspending!" : "✅ Good job!"}
  `;
}

// CHART
function renderChart() {
  if (chart) chart.destroy();

  let income = 0, expense = 0;
  expenses.forEach(e => {
    if (e.type === "income") income += e.amount;
    else expense += e.amount;
  });

  chart = new Chart(document.getElementById("chart"), {
    type: "doughnut",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{ data: [income, expense] }]
    }
  });
}

// 📸 OCR
async function scanReceipt() {
  const file = receiptInput.files[0];
  if (!file) return alert("Upload image first");

  receiptText.textContent = "Scanning...";

  const result = await Tesseract.recognize(file, "eng");
  receiptText.textContent = result.data.text;
}

// EXPORT
function exportExcel() {
  let csv = "Desc,Amount,Type,Date\n";
  expenses.forEach(e => {
    csv += `${e.desc},${e.amount},${e.type},${e.date}\n`;
  });

  const blob = new Blob([csv]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "finance.csv";
  a.click();
}

// DARK MODE
function toggleDark() {
  document.body.classList.toggle("dark");
}

// INIT
render();