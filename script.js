/**
 * Personal Expense Manager - JavaScript Application
 * Handles all functionality for adding, displaying, and managing expenses
 * Uses localStorage for data persistence
 */

class ExpenseManager {
  constructor() {
    // Initialize application state
    this.expenses = this.loadExpenses();
    this.init();
  }

  /**
   * Initialize the application
   * Set up event listeners and render initial data
   */
  init() {
    this.setupEventListeners();
    this.setDefaultDate();
    this.renderAll();
  }

  /**
   * Set up all event listeners for the application
   */
  setupEventListeners() {
    // Form submission
    const form = document.getElementById("expenseForm");
    form.addEventListener("submit", (e) => this.handleFormSubmit(e));

    // Input validation on blur
    const inputs = form.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => this.clearFieldError(input));
    });
  }

  /**
   * Set the default date to today
   */
  setDefaultDate() {
    const dateInput = document.getElementById("date");
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }

  /**
   * Handle form submission for adding new expenses
   * @param {Event} e - Form submit event
   */
  handleFormSubmit(e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(e.target);
    const expenseData = {
      description: formData.get("description").trim(),
      amount: parseFloat(formData.get("amount")),
      category: formData.get("category"),
      date: formData.get("date"),
    };

    // Validate all fields
    if (!this.validateForm(expenseData)) {
      return;
    }

    // Create and add expense
    const expense = this.createExpense(expenseData);
    this.addExpense(expense);

    // Reset form and show success message
    e.target.reset();
    this.setDefaultDate();
    this.showToast("Gasto adicionado com sucesso!", "success");
    this.renderAll();
  }

  /**
   * Validate the entire form
   * @param {Object} data - Form data to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  validateForm(data) {
    let isValid = true;

    // Validate description
    if (!data.description || data.description.length < 3) {
      this.showFieldError(
        "description",
        "A descrição deve ter pelo menos 3 caracteres"
      );
      isValid = false;
    }

    // Validate amount
    if (!data.amount || data.amount <= 0) {
      this.showFieldError("amount", "O valor deve ser maior que 0");
      isValid = false;
    }

    // Validate category
    if (!data.category) {
      this.showFieldError("category", "Por favor, selecione uma categoria");
      isValid = false;
    }

    // Validate date
    if (!data.date) {
      this.showFieldError("date", "Por favor, selecione uma data");
      isValid = false;
    } else {
      const selectedDate = new Date(data.date);
      const today = new Date();
      if (selectedDate > today) {
        this.showFieldError("date", "A data não pode ser no futuro");
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Validate individual field
   * @param {HTMLElement} field - Input field to validate
   */
  validateField(field) {
    const value = field.value.trim();

    switch (field.name) {
      case "description":
        if (!value || value.length < 3) {
          this.showFieldError(
            "description",
            "A descrição deve ter pelo menos 3 caracteres"
          );
        } else {
          this.clearFieldError(field);
        }
        break;
      case "amount":
        if (!value || parseFloat(value) <= 0) {
          this.showFieldError("amount", "O valor deve ser maior que 0");
        } else {
          this.clearFieldError(field);
        }
        break;
      case "category":
        if (!value) {
          this.showFieldError("category", "Por favor, selecione uma categoria");
        } else {
          this.clearFieldError(field);
        }
        break;
      case "date":
        if (!value) {
          this.showFieldError("date", "Por favor, selecione uma data");
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          if (selectedDate > today) {
            this.showFieldError("date", "A data não pode ser no futuro");
          } else {
            this.clearFieldError(field);
          }
        }
        break;
    }
  }

  /**
   * Show field error message
   * @param {string} fieldName - Name of the field
   * @param {string} message - Error message to display
   */
  showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const fieldElement = document.getElementById(fieldName);

    errorElement.textContent = message;
    errorElement.classList.add("show");
    fieldElement.style.borderColor = "var(--error-color)";
  }

  /**
   * Clear field error message
   * @param {HTMLElement} field - Input field to clear error for
   */
  clearFieldError(field) {
    const errorElement = document.getElementById(`${field.name}Error`);
    errorElement.classList.remove("show");
    field.style.borderColor = "";
  }

  /**
   * Create a new expense object
   * @param {Object} data - Expense data
   * @returns {Object} - Expense object with unique ID
   */
  createExpense(data) {
    return {
      id: this.generateId(),
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generate a unique ID for expenses
   * @returns {string} - Unique identifier
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Add an expense to the list
   * @param {Object} expense - Expense object to add
   */
  addExpense(expense) {
    this.expenses.unshift(expense); // Add to beginning for recent-first display
    this.saveExpenses();
  }

  /**
   * Remove an expense from the list
   * @param {string} id - ID of expense to remove
   */
  removeExpense(id) {
    const index = this.expenses.findIndex((expense) => expense.id === id);
    if (index !== -1) {
      this.expenses.splice(index, 1);
      this.saveExpenses();
      this.renderAll();
      this.showToast("Gasto excluído com sucesso!", "success");
    }
  }

  /**
   * Load expenses from localStorage
   * @returns {Array} - Array of expense objects
   */
  loadExpenses() {
    try {
      const stored = localStorage.getItem("personalExpenses");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading expenses from localStorage:", error);
      return [];
    }
  }

  /**
   * Save expenses to localStorage
   */
  saveExpenses() {
    try {
      localStorage.setItem("personalExpenses", JSON.stringify(this.expenses));
    } catch (error) {
      console.error("Error saving expenses to localStorage:", error);
      this.showToast("Erro ao salvar dados. Tente novamente.", "error");
    }
  }

  /**
   * Calculate total expenses for current month
   * @returns {number} - Total amount for current month
   */
  getCurrentMonthTotal() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return this.expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        );
      })
      .reduce((total, expense) => total + expense.amount, 0);
  }

  /**
   * Calculate total of all expenses
   * @returns {number} - Total amount of all expenses
   */
  getTotalExpenses() {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  /**
   * Get expenses grouped by category with totals
   * @returns {Object} - Categories with their totals
   */
  getCategoryTotals() {
    const categories = {};

    this.expenses.forEach((expense) => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      categories[expense.category] += expense.amount;
    });

    // Sort categories by total amount (descending)
    return Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
  }

  /**
   * Get category display name in Portuguese
   * @param {string} categoryKey - Internal category key
   * @returns {string} - Display name in Portuguese
   */
  getCategoryDisplayName(categoryKey) {
    const categoryNames = {
      alimentacao: "Alimentação",
      transporte: "Transporte",
      entretenimento: "Entretenimento",
      compras: "Compras",
      contas: "Contas e Utilidades",
      saude: "Saúde",
      educacao: "Educação",
      viagem: "Viagem",
      outros: "Outros",
    };
    return categoryNames[categoryKey] || categoryKey;
  }

  /**
   * Format currency amount
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  }

  /**
   * Format date for display
   * @param {string} dateString - Date string to format
   * @returns {string} - Formatted date string
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Render all components of the application
   */
  renderAll() {
    this.renderSummary();
    this.renderCategoryTotals();
    this.renderExpensesList();
  }

  /**
   * Render the summary section with totals
   */
  renderSummary() {
    const monthlyTotal = this.getCurrentMonthTotal();
    const totalExpenses = this.getTotalExpenses();

    document.getElementById("monthlyTotal").textContent =
      this.formatCurrency(monthlyTotal);
    document.getElementById("totalExpenses").textContent =
      this.formatCurrency(totalExpenses);
  }

  /**
   * Render the category totals section
   */
  renderCategoryTotals() {
    const categoryList = document.getElementById("categoryList");
    const categories = this.getCategoryTotals();

    if (Object.keys(categories).length === 0) {
      categoryList.innerHTML =
        '<div class="empty-state">Nenhum gasto ainda</div>';
      return;
    }

    const categoryHTML = Object.entries(categories)
      .map(
        ([category, total]) => `
                <div class="category-item">
                    <span class="category-name">${this.getCategoryDisplayName(
                      category
                    )}</span>
                    <span class="category-amount">${this.formatCurrency(
                      total
                    )}</span>
                </div>
            `
      )
      .join("");

    categoryList.innerHTML = categoryHTML;
  }

  /**
   * Render the expenses list
   */
  renderExpensesList() {
    const expensesList = document.getElementById("expensesList");
    const expensesCount = document.getElementById("expensesCount");

    // Update expenses count
    const count = this.expenses.length;
    expensesCount.textContent = `${count} gasto${count !== 1 ? "s" : ""}`;

    if (this.expenses.length === 0) {
      expensesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💰</div>
                    <h3>Nenhum gasto ainda</h3>
                    <p>Comece adicionando seu primeiro gasto acima</p>
                </div>
            `;
      return;
    }

    const expensesHTML = this.expenses
      .map(
        (expense) => `
            <div class="expense-item fade-in">
                <div class="expense-details">
                    <h4>${this.escapeHtml(expense.description)}</h4>
                    <div class="expense-meta">
                        <span class="expense-category">${this.getCategoryDisplayName(
                          expense.category
                        )}</span>
                        <span class="expense-date">${this.formatDate(
                          expense.date
                        )}</span>
                    </div>
                </div>
                <div class="expense-amount">${this.formatCurrency(
                  expense.amount
                )}</div>
                <button class="btn-danger" onclick="expenseManager.removeExpense('${
                  expense.id
                }')">
                    Excluir
                </button>
            </div>
        `
      )
      .join("");

    expensesList.innerHTML = expensesHTML;
  }

  /**
   * Escape HTML to prevent XSS attacks
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of message (success, error)
   */
  showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add("show");

    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  // Create global instance for access from HTML onclick handlers
  window.expenseManager = new ExpenseManager();
});

/**
 * Handle page visibility change to refresh data if needed
 * Useful when multiple tabs are open
 */
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && window.expenseManager) {
    // Reload expenses in case they were modified in another tab
    window.expenseManager.expenses = window.expenseManager.loadExpenses();
    window.expenseManager.renderAll();
  }
});

/**
 * Handle storage events for cross-tab synchronization
 */
window.addEventListener("storage", (e) => {
  if (e.key === "personalExpenses" && window.expenseManager) {
    // Reload expenses when changed in another tab
    window.expenseManager.expenses = window.expenseManager.loadExpenses();
    window.expenseManager.renderAll();
  }
});
