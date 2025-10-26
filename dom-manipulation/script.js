// =======================
// Dynamic Quote Generator
// =======================

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const exportBtn = document.getElementById("exportQuotesBtn");
const importFileInput = document.getElementById("importFile");
const categoryFilter = document.getElementById("categoryFilter");
const conflictNotif = document.getElementById("conflictNotif");

// Simulate server
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Load quotes from localStorage or default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Motivation" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  const lastSelected = localStorage.getItem("lastCategory") || "all";
  categoryFilter.value = lastSelected;
}

// Show random quote
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  let filteredQuotes = quotes;
  if (selectedCategory !== "all") filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<strong>"${quote.text}"</strong><br><em>- ${quote.category}</em>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Filter quotes
function filterQuotes() {
  localStorage.setItem("lastCategory", categoryFilter.value);
  showRandomQuote();
}

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) {
    alert("Please enter both quote text and category!");
    return;
  }
  const newQuoteObj = { text, category };
  quotes.push(newQuoteObj);
  saveQuotes();
  populateCategories();
  showRandomQuote();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  notifyUser("New quote added!");
  postQuoteToServer(newQuoteObj);
}

// Export quotes to JSON
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      showRandomQuote();
      notifyUser('Quotes imported successfully!');
    } catch {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Notify user
function notifyUser(message) {
  const notif = document.createElement("div");
  notif.textContent = message;
  notif.style.backgroundColor = "#4CAF50";
  notif.style.color = "#fff";
  notif.style.padding = "10px";
  notif.style.marginTop = "10px";
  notif.style.textAlign = "center";
  notif.style.borderRadius = "5px";
  document.body.insertBefore(notif, document.body.firstChild);
  setTimeout(() => notif.remove(), 3000);
}

// =======================
// Server Sync & Conflict Handling
// =======================

// Fetch data from server (mock API)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();
    const serverQuotes = serverData.slice(0,5).map(item => ({ text: item.title, category: "Server" }));
    syncQuotes(serverQuotes);
  } catch (error) {
    console.error("Failed to fetch server quotes:", error);
  }
}

// Sync local storage with server data and resolve conflicts
function syncQuotes(serverQuotes) {
  let conflict = false;
  serverQuotes.forEach(sq => {
    const exists = quotes.some(lq => lq.text === sq.text);
    if (!exists) {
      quotes.push(sq);
      conflict = true;
    }
  });
  saveQuotes();
  populateCategories();
  
  if (conflict) {
    showConflictNotification(); // نزاع موجود
  } else {
    notifyUser("Quotes synced with server!"); // مزامنة ناجحة بدون نزاع
  }
}

// Show conflict notification
function showConflictNotification() {
  conflictNotif.style.display = "block";
  setTimeout(() => conflictNotif.style.display = "none", 4000);
}

// Post new quote to server (simulation)
async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: {"Content-Type":"application/json; charset=UTF-8"}
    });
  } catch (error) {
    console.error("Failed to post quote:", error);
  }
}

// =======================
// Event Listeners
// =======================
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportQuotes);
importFileInput.addEventListener("change", importFromJsonFile);
categoryFilter.addEventListener("change", filterQuotes);

// =======================
// Initialize
// =======================
populateCategories();
const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
if (lastQuote) {
  quoteDisplay.innerHTML = `<strong>"${lastQuote.text}"</strong><br><em>- ${lastQuote.category}</em>`;
}

// Periodic server sync every 60s
setInterval(fetchQuotesFromServer, 60000);
