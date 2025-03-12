import { Chart } from "@/components/ui/chart"
// DOM Elements
const balanceEl = document.getElementById("balance")
const incomeEl = document.getElementById("income-total")
const expenseEl = document.getElementById("expense-total")
const transactionForm = document.getElementById("transaction-form")
const descriptionInput = document.getElementById("description")
const amountInput = document.getElementById("amount")
const categoryInput = document.getElementById("category")
const transactionList = document.getElementById("transaction-list")
const expenseChart = document.getElementById("expense-chart")

// Initialize Chart
let myChart = null

// Get transactions from local storage
let transactions = JSON.parse(localStorage.getItem("transactions")) || []

// Initialize the app
function init() {
  updateUI()

  // Event listeners
  transactionForm.addEventListener("submit", addTransaction)
  transactionList.addEventListener("click", handleTransactionClick)
}

// Update the UI with current data
function updateUI() {
  updateTransactionList()
  updateSummary()
  updateChart()
}

// Update the transaction list in the UI
function updateTransactionList() {
  transactionList.innerHTML = ""

  if (transactions.length === 0) {
    const emptyRow = document.createElement("tr")
    const emptyCell = document.createElement("td")
    emptyCell.colSpan = 4
    emptyCell.className = "empty-message"
    emptyCell.textContent = "No transactions yet. Add a transaction to get started!"
    emptyRow.appendChild(emptyCell)
    transactionList.appendChild(emptyRow)
    return
  }

  transactions.forEach((transaction) => {
    const row = document.createElement("tr")
    const isIncome = transaction.amount > 0

    row.classList.add(isIncome ? "income" : "expense")
    row.setAttribute("data-id", transaction.id)

    row.innerHTML = `
      <td class="transaction-description">${transaction.description}</td>
      <td class="transaction-category">${transaction.category}</td>
      <td class="transaction-amount ${isIncome ? "income" : "expense"}">
        ${formatAmount(transaction.amount)}
      </td>
      <td class="action-cell">
        <button class="delete-btn" data-id="${transaction.id}">×</button>
      </td>
    `

    transactionList.appendChild(row)
  })
}

// Update the financial summary
function updateSummary() {
  const amounts = transactions.map((transaction) => transaction.amount)

  // Calculate balance
  const balance = amounts.reduce((acc, amount) => acc + amount, 0).toFixed(2)

  // Calculate income
  const income = amounts
    .filter((amount) => amount > 0)
    .reduce((acc, amount) => acc + amount, 0)
    .toFixed(2)

  // Calculate expenses
  const expense = (amounts.filter((amount) => amount < 0).reduce((acc, amount) => acc + amount, 0) * -1).toFixed(2)

  // Update UI
  balanceEl.textContent = formatAmount(balance)
  incomeEl.textContent = formatAmount(income)
  expenseEl.textContent = formatAmount(expense)
}

// Update the expense chart
function updateChart() {
  // Get expense categories and amounts
  const expenseData = {}

  transactions
    .filter((transaction) => transaction.amount < 0)
    .forEach((transaction) => {
      const category = transaction.category
      if (expenseData[category]) {
        expenseData[category] += Math.abs(transaction.amount)
      } else {
        expenseData[category] = Math.abs(transaction.amount)
      }
    })

  const categories = Object.keys(expenseData)
  const amounts = Object.values(expenseData)

  // Define colors for categories
  const backgroundColors = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
  ]

  // Destroy previous chart if it exists
  if (myChart) {
    myChart.destroy()
  }

  // Create new chart if there's data
  if (categories.length > 0) {
    myChart = new Chart(expenseChart, {
      type: "doughnut",
      data: {
        labels: categories,
        datasets: [
          {
            data: amounts,
            backgroundColor: backgroundColors.slice(0, categories.length),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.raw || 0
                return `${label}: ${formatAmount(value)}`
              },
            },
          },
        },
      },
    })
  } else {
    // Display a message if no expense data
    const ctx = expenseChart.getContext("2d")
    ctx.clearRect(0, 0, expenseChart.width, expenseChart.height)
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.fillStyle = "#6b7280"
    ctx.fillText("No expense data to display", expenseChart.width / 2, expenseChart.height / 2)
  }
}

// Add a new transaction
function addTransaction(e) {
  e.preventDefault()

  const description = descriptionInput.value.trim()
  const amount = Number.parseFloat(amountInput.value)
  const category = categoryInput.value

  if (description === "" || isNaN(amount) || category === "") {
    alert("Please fill in all fields")
    return
  }

  const transaction = {
    id: generateID(),
    description,
    amount,
    category,
    date: new Date().toISOString(),
  }

  transactions.push(transaction)
  updateLocalStorage()
  updateUI()

  // Reset form
  transactionForm.reset()
}

// Handle clicks on transaction items (for deletion)
function handleTransactionClick(e) {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.getAttribute("data-id")
    removeTransaction(id)
  }
}

// Remove a transaction
function removeTransaction(id) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    transactions = transactions.filter((transaction) => transaction.id !== id)
    updateLocalStorage()
    updateUI()
  }
}

// Update local storage
function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions))
}

// Format amount as currency
function formatAmount(amount) {
  const sign = amount < 0 ? "-" : ""
  return `${sign}$${Math.abs(amount).toFixed(2)}`
}

// Generate a random ID
function generateID() {
  return Math.floor(Math.random() * 1000000000).toString()
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", init)

