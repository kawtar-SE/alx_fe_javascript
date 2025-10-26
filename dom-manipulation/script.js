const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const exportBtn = document.getElementById("exportQuotesBtn");
const importFileInput = document.getElementById("importFile");
const categoryFilter = document.getElementById("categoryFilter");

// تحميل الاقتباسات من Local Storage أو استخدام الاقتباسات الافتراضية
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Motivation" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}


function populateCategories() {
  // استخراج الفئات الفريدة
  const categories = [...new Set(quotes.map(q => q.category))];

  // مسح القديم قبل الإضافة
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // استرجاع آخر فلتر مختار من Local Storage
  const lastSelected = localStorage.getItem("lastCategory") || "all";
  categoryFilter.value = lastSelected;
}

function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  let filteredQuotes = quotes;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<strong>"${quote.text}"</strong><br><em>- ${quote.category}</em>`;

  // حفظ آخر اقتباس في Session Storage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}


function filterQuotes() {
  localStorage.setItem("lastCategory", categoryFilter.value); // حفظ الفئة
  showRandomQuote();
}


function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category!");
    return;
  }

  const newQuoteObj = { text, category };
  quotes.push(newQuoteObj);
  saveQuotes(); // تحديث Local Storage

  // تحديث الفئات dropdown إذا كان هناك فئة جديدة
  populateCategories();

  // عرض الاقتباس مباشرة
  quoteDisplay.innerHTML = `<strong>"${newQuoteObj.text}"</strong><br><em>- ${newQuoteObj.category}</em>`;

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("New quote added successfully!");
}


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


function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert('Quotes imported successfully!');
    } catch (error) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}


newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportQuotes);
importFileInput.addEventListener("change", importFromJsonFile);
categoryFilter.addEventListener("change", filterQuotes);

populateCategories();
const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
if (lastQuote) {
  quoteDisplay.innerHTML = `<strong>"${lastQuote.text}"</strong><br><em>- ${lastQuote.category}</em>`;
}
